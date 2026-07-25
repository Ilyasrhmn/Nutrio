import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { AuditService } from '../../common/audit/audit.service';
import { IdempotencyService } from '../../common/idempotency/idempotency.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RejectOrderDto } from './dto/reject-order.dto';

type ApiOrderStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'dispatched'
  | 'received';

const API_STATUS: Record<string, ApiOrderStatus> = {
  draft: 'draft',
  pending_supplier: 'submitted',
  confirmed: 'accepted',
  shipped: 'dispatched',
  delivered: 'received',
  cancelled: 'rejected',
};

interface SupplierProductRow {
  id: string;
  name: string;
  unit: string;
  price_per_unit: string | number | null;
  min_order_qty: string | number;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly idempotency: IdempotencyService,
    private readonly audit: AuditService,
  ) {}

  private async vendorId(manager: EntityManager, userId: string): Promise<string> {
    const [vendor] = await manager.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    if (!vendor) throw new ForbiddenException('Profil vendor tidak ditemukan');
    return vendor.id;
  }

  private async supplierId(manager: EntityManager, userId: string): Promise<string> {
    const [supplier] = await manager.query(
      `SELECT id FROM suppliers WHERE user_id = $1 AND deleted_at IS NULL LIMIT 1`,
      [userId],
    );
    if (!supplier) throw new ForbiddenException('Profil supplier tidak ditemukan');
    return supplier.id;
  }

  private serialize(row: any) {
    return {
      id: row.id,
      poNumber: row.po_number,
      supplierId: row.supplier_id,
      vendorId: row.vendor_id,
      status: API_STATUS[row.status] ?? row.status,
      requestedDeliveryDate: row.requested_delivery_date,
      totalAmount: Number(row.total_amount),
      rejectionReason: row.rejection_reason ?? null,
    };
  }

  async create(userId: string, dto: CreateOrderDto, key?: string) {
    return this.idempotency.execute(userId, key, dto, async (manager, correlationId) => {
      const vendorId = await this.vendorId(manager, userId);
      const products: SupplierProductRow[] = await manager.query(
        `SELECT id, name, unit, price_per_unit, min_order_qty
         FROM supplier_products
         WHERE supplier_id = $1 AND id = ANY($2::uuid[]) AND status = 'active'
         FOR SHARE`,
        [dto.supplierId, dto.items.map((item) => item.productId)],
      );
      if (products.length !== dto.items.length) {
        throw new NotFoundException('Satu atau lebih produk supplier tidak tersedia');
      }

      const byId = new Map<string, SupplierProductRow>(
        products.map((product) => [product.id, product]),
      );
      const lines = dto.items.map((item) => {
        const product = byId.get(item.productId);
        const qty = Number(item.quantity);
        if (!product || qty < Number(product.min_order_qty)) {
          throw new ConflictException('Kuantitas belum memenuhi minimum order produk');
        }
        if (product.price_per_unit == null) {
          throw new ConflictException('Harga produk belum ditetapkan supplier');
        }
        return { product, qty, total: qty * Number(product.price_per_unit) };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
      const poNumber = `PO-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const [order] = await manager.query(
        `INSERT INTO purchase_orders
           (po_number, vendor_id, supplier_id, status, requested_delivery_date,
            subtotal, total_amount, vendor_notes)
         VALUES ($1, $2, $3, 'pending_supplier', $4::date, $5, $5, $6)
         RETURNING *`,
        [
          poNumber,
          vendorId,
          dto.supplierId,
          dto.requestedDeliveryDate ?? new Date().toISOString().slice(0, 10),
          subtotal,
          dto.vendorNotes ?? null,
        ],
      );
      for (const line of lines) {
        await manager.query(
          `INSERT INTO purchase_order_items
             (po_id, product_id, product_name, unit, qty, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [order.id, line.product.id, line.product.name, line.product.unit, line.qty, line.product.price_per_unit, line.total],
        );
      }
      await manager.query(
        `INSERT INTO po_status_logs (po_id, to_status, actor_id)
         VALUES ($1, 'pending_supplier', $2)`,
        [order.id, userId],
      );
      const eventId = await this.audit.record(manager, {
        actorUserId: userId,
        aggregateType: 'purchase_order',
        aggregateId: order.id,
        action: 'order.submitted',
        after: this.serialize(order),
        correlationId,
      });
      return { body: this.serialize(order), eventId };
    });
  }

  async listVendor(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const vendorId = await this.vendorId(manager, userId);
      const rows = await manager.query(
        `SELECT * FROM purchase_orders WHERE vendor_id = $1 ORDER BY created_at DESC`,
        [vendorId],
      );
      return rows.map((row: any) => this.serialize(row));
    });
  }

  async listSupplier(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const supplierId = await this.supplierId(manager, userId);
      const rows = await manager.query(
        `SELECT * FROM purchase_orders WHERE supplier_id = $1 ORDER BY created_at DESC`,
        [supplierId],
      );
      return rows.map((row: any) => this.serialize(row));
    });
  }

  private async transition(
    userId: string,
    orderId: string,
    key: string | undefined,
    action: 'accept' | 'reject' | 'dispatch',
    reject?: RejectOrderDto,
  ) {
    return this.idempotency.execute(userId, key, { orderId, action, reject }, async (manager, correlationId) => {
      const supplierId = await this.supplierId(manager, userId);
      const [order] = await manager.query(
        `SELECT * FROM purchase_orders WHERE id = $1 AND supplier_id = $2 FOR UPDATE`,
        [orderId, supplierId],
      );
      if (!order) throw new NotFoundException('Purchase order tidak ditemukan');
      const expected = action === 'dispatch' ? 'confirmed' : 'pending_supplier';
      if (order.status !== expected) throw new ConflictException('Transisi status purchase order tidak valid');
      const next = action === 'accept' ? 'confirmed' : action === 'reject' ? 'cancelled' : 'shipped';
      const [updated] = await manager.query(
        `UPDATE purchase_orders
         SET status = $2::po_status, rejection_reason = $3, updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [orderId, next, action === 'reject' ? reject?.reason ?? null : null],
      );
      await manager.query(
        `INSERT INTO po_status_logs (po_id, from_status, to_status, actor_id)
         VALUES ($1, $2::po_status, $3::po_status, $4)`,
        [orderId, order.status, next, userId],
      );
      const eventId = await this.audit.record(manager, {
        actorUserId: userId,
        aggregateType: 'purchase_order',
        aggregateId: orderId,
        action: `order.${action}ed`,
        after: this.serialize(updated),
        correlationId,
      });
      return { body: this.serialize(updated), eventId };
    });
  }

  accept(userId: string, orderId: string, key?: string) { return this.transition(userId, orderId, key, 'accept'); }
  reject(userId: string, orderId: string, dto: RejectOrderDto, key?: string) { return this.transition(userId, orderId, key, 'reject', dto); }
  dispatch(userId: string, orderId: string, key?: string) { return this.transition(userId, orderId, key, 'dispatch'); }

  async receive(userId: string, orderId: string, key?: string) {
    return this.idempotency.execute(userId, key, { orderId }, async (manager, correlationId) => {
      const vendorId = await this.vendorId(manager, userId);
      const [order] = await manager.query(
        `SELECT * FROM purchase_orders WHERE id = $1 AND vendor_id = $2 FOR UPDATE`,
        [orderId, vendorId],
      );
      if (!order) throw new NotFoundException('Purchase order tidak ditemukan');
      if (order.status !== 'shipped') throw new ConflictException('Purchase order belum dapat diterima');
      const items = await manager.query(`SELECT * FROM purchase_order_items WHERE po_id = $1`, [orderId]);
      for (const item of items) {
        await manager.query(
          `INSERT INTO inventory_ledger
             (vendor_id, product_id, unit, quantity_delta, entry_type, source_type, source_id, actor_user_id)
           VALUES ($1, $2, $3, $4, 'goods_receipt', 'purchase_order', $5, $6)`,
          [vendorId, item.product_id, item.unit, item.qty, orderId, userId],
        );
      }
      const [updated] = await manager.query(
        `UPDATE purchase_orders SET status = 'delivered', actual_delivery_date = CURRENT_DATE, updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [orderId],
      );
      const eventId = await this.audit.record(manager, {
        actorUserId: userId,
        aggregateType: 'purchase_order',
        aggregateId: orderId,
        action: 'order.received',
        after: this.serialize(updated),
        correlationId,
      });
      return { body: this.serialize(updated), eventId };
    });
  }
}
