import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { DataSource, EntityManager } from "typeorm";
import { AuditService } from "../../common/audit/audit.service";
import { IdempotencyService } from "../../common/idempotency/idempotency.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { RejectOrderDto } from "./dto/reject-order.dto";
import { NotificationsService } from "../notifications/notifications.service";

type ApiOrderStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "dispatched"
  | "received";

const API_STATUS: Record<string, ApiOrderStatus> = {
  draft: "draft",
  pending_supplier: "submitted",
  confirmed: "accepted",
  shipped: "dispatched",
  delivered: "received",
  cancelled: "cancelled",
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
    private readonly notifications: NotificationsService,
  ) {}

  private async notifyUser(userId: string, subject: string, body: string) {
    await this.notifications.send({ userId, channel: "in_app", subject, body });
  }

  private async orderUsers(
    orderId: string,
  ): Promise<{ vendorUserId: string; supplierUserId: string }> {
    const [order] = await this.dataSource.query(
      `SELECT v.user_id AS vendor_user_id, s.user_id AS supplier_user_id
       FROM purchase_orders po
       JOIN vendors v ON v.id = po.vendor_id
       JOIN suppliers s ON s.id = po.supplier_id
       WHERE po.id = $1`,
      [orderId],
    );
    if (!order) throw new NotFoundException("Purchase order tidak ditemukan");
    return {
      vendorUserId: order.vendor_user_id,
      supplierUserId: order.supplier_user_id,
    };
  }

  private async vendorId(
    manager: EntityManager,
    userId: string,
  ): Promise<string> {
    const [vendor] = await manager.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    if (!vendor) throw new ForbiddenException("Profil vendor tidak ditemukan");
    return vendor.id;
  }

  private async supplierId(
    manager: EntityManager,
    userId: string,
  ): Promise<string> {
    const [supplier] = await manager.query(
      `SELECT id FROM suppliers WHERE user_id = $1 AND deleted_at IS NULL LIMIT 1`,
      [userId],
    );
    if (!supplier)
      throw new ForbiddenException("Profil supplier tidak ditemukan");
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
      invoiceNumber: row.invoice_number ?? null,
    };
  }

  async create(userId: string, dto: CreateOrderDto, key?: string) {
    const result = await this.idempotency.execute(
      userId,
      key,
      dto,
      async (manager, correlationId) => {
        const vendorId = await this.vendorId(manager, userId);
        const products: SupplierProductRow[] = await manager.query(
          `SELECT id, name, unit, price_per_unit, min_order_qty
         FROM supplier_products
         WHERE supplier_id = $1 AND id = ANY($2::uuid[]) AND status = 'active'
         FOR SHARE`,
          [dto.supplierId, dto.items.map((item) => item.productId)],
        );
        if (products.length !== dto.items.length) {
          throw new NotFoundException(
            "Satu atau lebih produk supplier tidak tersedia",
          );
        }

        const byId = new Map<string, SupplierProductRow>(
          products.map((product) => [product.id, product]),
        );
        const lines = dto.items.map((item) => {
          const product = byId.get(item.productId);
          const qty = Number(item.quantity);
          if (!product || qty < Number(product.min_order_qty)) {
            throw new ConflictException(
              "Kuantitas belum memenuhi minimum order produk",
            );
          }
          if (product.price_per_unit == null) {
            throw new ConflictException(
              "Harga produk belum ditetapkan supplier",
            );
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
            [
              order.id,
              line.product.id,
              line.product.name,
              line.product.unit,
              line.qty,
              line.product.price_per_unit,
              line.total,
            ],
          );
        }
        await manager.query(
          `INSERT INTO po_status_logs (po_id, to_status, actor_id)
         VALUES ($1, 'pending_supplier', $2)`,
          [order.id, userId],
        );
        const eventId = await this.audit.record(manager, {
          actorUserId: userId,
          aggregateType: "purchase_order",
          aggregateId: order.id,
          action: "order.submitted",
          after: this.serialize(order),
          correlationId,
        });
        return { body: this.serialize(order), eventId };
      },
    );
    if (!result.replayed) {
      await this.notifyUser(
        (await this.orderUsers(result.body.id)).supplierUserId,
        "PO baru diterima",
        `PO ${result.body.poNumber} menunggu keputusan Anda.`,
      );
    }
    return result;
  }

  async listVendor(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const vendorId = await this.vendorId(manager, userId);
      const rows = await manager.query(
        `SELECT po.*, si.invoice_number FROM purchase_orders po
         LEFT JOIN supplier_invoices si ON si.po_id = po.id
         WHERE po.vendor_id = $1 ORDER BY po.created_at DESC`,
        [vendorId],
      );
      return rows.map((row: any) => this.serialize(row));
    });
  }

  async listSupplier(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const supplierId = await this.supplierId(manager, userId);
      const rows = await manager.query(
        `SELECT po.*, si.invoice_number FROM purchase_orders po
         LEFT JOIN supplier_invoices si ON si.po_id = po.id
         WHERE po.supplier_id = $1 ORDER BY po.created_at DESC`,
        [supplierId],
      );
      return rows.map((row: any) => this.serialize(row));
    });
  }

  private async transition(
    userId: string,
    orderId: string,
    key: string | undefined,
    action: "accept" | "reject" | "dispatch",
    reject?: RejectOrderDto,
  ) {
    const result = await this.idempotency.execute(
      userId,
      key,
      { orderId, action, reject },
      async (manager, correlationId) => {
        const supplierId = await this.supplierId(manager, userId);
        const [order] = await manager.query(
          `SELECT * FROM purchase_orders WHERE id = $1 AND supplier_id = $2 FOR UPDATE`,
          [orderId, supplierId],
        );
        if (!order)
          throw new NotFoundException("Purchase order tidak ditemukan");
        const expected =
          action === "dispatch" ? "confirmed" : "pending_supplier";
        if (order.status !== expected)
          throw new ConflictException(
            "Transisi status purchase order tidak valid",
          );
        const next =
          action === "accept"
            ? "confirmed"
            : action === "reject"
              ? "cancelled"
              : "shipped";
        const [updated] = await manager.query(
          `UPDATE purchase_orders
         SET status = $2::po_status, rejection_reason = $3, updated_at = NOW()
         WHERE id = $1 RETURNING *`,
          [
            orderId,
            next,
            action === "reject" ? (reject?.reason ?? null) : null,
          ],
        );
        await manager.query(
          `INSERT INTO po_status_logs (po_id, from_status, to_status, actor_id)
         VALUES ($1, $2::po_status, $3::po_status, $4)`,
          [orderId, order.status, next, userId],
        );
        const eventId = await this.audit.record(manager, {
          actorUserId: userId,
          aggregateType: "purchase_order",
          aggregateId: orderId,
          action: `order.${action}ed`,
          after: this.serialize(updated),
          correlationId,
        });
        return { body: this.serialize(updated), eventId };
      },
    );
    if (!result.replayed) {
      await this.notifyUser(
        (await this.orderUsers(orderId)).vendorUserId,
        "Status PO diperbarui",
        `PO ${result.body.poNumber} ${result.body.status}.`,
      );
    }
    return result;
  }

  accept(userId: string, orderId: string, key?: string) {
    return this.transition(userId, orderId, key, "accept");
  }
  reject(userId: string, orderId: string, dto: RejectOrderDto, key?: string) {
    return this.transition(userId, orderId, key, "reject", dto);
  }
  dispatch(userId: string, orderId: string, key?: string) {
    return this.transition(userId, orderId, key, "dispatch");
  }

  async cancel(
    userId: string,
    orderId: string,
    dto: RejectOrderDto,
    key?: string,
  ) {
    const result = await this.idempotency.execute(
      userId,
      key,
      { orderId, reason: dto.reason },
      async (manager, correlationId) => {
        const vendorId = await this.vendorId(manager, userId);
        const [order] = await manager.query(
          `SELECT * FROM purchase_orders WHERE id = $1 AND vendor_id = $2 FOR UPDATE`,
          [orderId, vendorId],
        );
        if (!order)
          throw new NotFoundException("Purchase order tidak ditemukan");
        if (
          !["draft", "pending_supplier", "confirmed"].includes(order.status)
        ) {
          throw new ConflictException("Purchase order tidak dapat dibatalkan");
        }
        const [updated] = await manager.query(
          `UPDATE purchase_orders SET status = 'cancelled', rejection_reason = $2, updated_at = NOW()
         WHERE id = $1 RETURNING *`,
          [orderId, dto.reason],
        );
        await manager.query(
          `INSERT INTO po_status_logs (po_id, from_status, to_status, actor_id, notes)
         VALUES ($1, $2::po_status, 'cancelled', $3, $4)`,
          [orderId, order.status, userId, dto.reason],
        );
        const eventId = await this.audit.record(manager, {
          actorUserId: userId,
          aggregateType: "purchase_order",
          aggregateId: orderId,
          action: "order.cancelled",
          after: this.serialize(updated),
          correlationId,
        });
        return { body: this.serialize(updated), eventId };
      },
    );
    if (!result.replayed) {
      await this.notifyUser(
        (await this.orderUsers(orderId)).supplierUserId,
        "PO dibatalkan",
        `PO ${result.body.poNumber} dibatalkan vendor.`,
      );
    }
    return result;
  }

  async detail(userId: string, orderId: string) {
    return this.dataSource.transaction(async (manager) => {
      const [user] = await manager.query(`SELECT id FROM users WHERE id = $1`, [
        userId,
      ]);
      if (!user) throw new ForbiddenException();
      const [order] = await manager.query(
        `SELECT po.*, si.invoice_number
         FROM purchase_orders po
         LEFT JOIN suppliers s ON s.id = po.supplier_id
         LEFT JOIN vendors v ON v.id = po.vendor_id
         LEFT JOIN supplier_invoices si ON si.po_id = po.id
         WHERE po.id = $1 AND (v.user_id = $2 OR s.user_id = $2)`,
        [orderId, userId],
      );
      if (!order) throw new NotFoundException("Purchase order tidak ditemukan");
      const [items, history] = await Promise.all([
        manager.query(
          `SELECT product_id, product_name, unit, qty, unit_price, line_total FROM purchase_order_items WHERE po_id = $1 ORDER BY created_at`,
          [orderId],
        ),
        manager.query(
          `SELECT from_status, to_status, notes, created_at FROM po_status_logs WHERE po_id = $1 ORDER BY created_at`,
          [orderId],
        ),
      ]);
      return { ...this.serialize(order), items, history };
    });
  }

  async receive(userId: string, orderId: string, key?: string) {
    const result = await this.idempotency.execute(
      userId,
      key,
      { orderId },
      async (manager, correlationId) => {
        const vendorId = await this.vendorId(manager, userId);
        const [order] = await manager.query(
          `SELECT * FROM purchase_orders WHERE id = $1 AND vendor_id = $2 FOR UPDATE`,
          [orderId, vendorId],
        );
        if (!order)
          throw new NotFoundException("Purchase order tidak ditemukan");
        if (order.status !== "shipped")
          throw new ConflictException("Purchase order belum dapat diterima");
        const items = await manager.query(
          `SELECT * FROM purchase_order_items WHERE po_id = $1`,
          [orderId],
        );
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
          aggregateType: "purchase_order",
          aggregateId: orderId,
          action: "order.received",
          after: this.serialize(updated),
          correlationId,
        });
        return { body: this.serialize(updated), eventId };
      },
    );
    if (!result.replayed) {
      await this.notifyUser(
        (await this.orderUsers(orderId)).supplierUserId,
        "PO diterima vendor",
        `PO ${result.body.poNumber} sudah diterima dan masuk inventaris.`,
      );
    }
    return result;
  }
}
