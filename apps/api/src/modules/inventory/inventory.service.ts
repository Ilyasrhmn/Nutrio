import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { AuditService } from "../../common/audit/audit.service";
import { IdempotencyService } from "../../common/idempotency/idempotency.service";
import { CreateOpnameDto } from "./dto/create-opname.dto";
import { RecordWasteDto } from "./dto/record-waste.dto";

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly idempotency: IdempotencyService,
    private readonly audit: AuditService,
  ) {}

  private async vendorId(userId: string) {
    const [vendor] = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1`,
      [userId],
    );
    if (!vendor) throw new ForbiddenException("Profil vendor tidak ditemukan");
    return vendor.id as string;
  }

  async current(userId: string) {
    const vendorId = await this.vendorId(userId);
    const rows = await this.dataSource.query(
      `SELECT l.product_id, p.name, l.unit, SUM(l.quantity_delta) AS quantity
       FROM inventory_ledger l JOIN supplier_products p ON p.id = l.product_id
       WHERE l.vendor_id = $1 GROUP BY l.product_id, p.name, l.unit
       HAVING SUM(l.quantity_delta) <> 0 ORDER BY p.name`,
      [vendorId],
    );
    return rows.map((row: any) => ({
      productId: row.product_id,
      name: row.name,
      unit: row.unit,
      quantity: Number(row.quantity),
    }));
  }

  async opname(userId: string, dto: CreateOpnameDto, key?: string) {
    return this.idempotency.execute(
      userId,
      key,
      dto,
      async (manager, correlationId) => {
        const [vendor] = await manager.query(
          `SELECT id FROM vendors WHERE user_id = $1`,
          [userId],
        );
        if (!vendor)
          throw new ForbiddenException("Profil vendor tidak ditemukan");
        const [balance] = await manager.query(
          `SELECT COALESCE(SUM(quantity_delta), 0) AS quantity FROM inventory_ledger
         WHERE vendor_id = $1 AND product_id = $2 AND unit = $3`,
          [vendor.id, dto.productId, dto.unit],
        );
        const delta = Number(dto.countedQuantity) - Number(balance.quantity);
        if (delta === 0)
          throw new UnprocessableEntityException(
            "Jumlah opname sama dengan saldo stok",
          );
        const sourceId = randomUUID();
        await manager.query(
          `INSERT INTO inventory_ledger
          (vendor_id, product_id, unit, quantity_delta, entry_type, source_type, source_id, actor_user_id)
         VALUES ($1, $2, $3, $4, 'stock_opname_adjustment', 'stock_opname', $5, $6)`,
          [vendor.id, dto.productId, dto.unit, delta, sourceId, userId],
        );
        const eventId = await this.audit.record(manager, {
          actorUserId: userId,
          aggregateType: "inventory",
          aggregateId: sourceId,
          action: "inventory.opname",
          after: {
            productId: dto.productId,
            unit: dto.unit,
            countedQuantity: dto.countedQuantity,
            reason: dto.reason,
          },
          correlationId,
        });
        return {
          body: {
            productId: dto.productId,
            unit: dto.unit,
            quantity: dto.countedQuantity,
          },
          eventId,
        };
      },
    );
  }

  async waste(userId: string, dto: RecordWasteDto, key?: string) {
    return this.idempotency.execute(
      userId,
      key,
      dto,
      async (manager, correlationId) => {
        const [vendor] = await manager.query(
          `SELECT id FROM vendors WHERE user_id = $1`,
          [userId],
        );
        if (!vendor)
          throw new ForbiddenException("Profil vendor tidak ditemukan");
        const [balance] = await manager.query(
          `SELECT COALESCE(SUM(quantity_delta), 0) AS quantity FROM inventory_ledger
         WHERE vendor_id = $1 AND product_id = $2 AND unit = $3`,
          [vendor.id, dto.productId, dto.unit],
        );
        if (Number(balance.quantity) < dto.quantity)
          throw new UnprocessableEntityException(
            "Stok tidak cukup untuk dicatat sebagai waste",
          );
        const sourceId = randomUUID();
        await manager.query(
          `INSERT INTO inventory_ledger
          (vendor_id, product_id, unit, quantity_delta, entry_type, source_type, source_id, actor_user_id)
         VALUES ($1, $2, $3, $4, 'waste', 'inventory_waste', $5, $6)`,
          [vendor.id, dto.productId, dto.unit, -dto.quantity, sourceId, userId],
        );
        const eventId = await this.audit.record(manager, {
          actorUserId: userId,
          aggregateType: "inventory",
          aggregateId: sourceId,
          action: "inventory.waste_recorded",
          after: {
            productId: dto.productId,
            unit: dto.unit,
            quantity: dto.quantity,
            reason: dto.reason,
          },
          correlationId,
        });
        return {
          body: {
            productId: dto.productId,
            unit: dto.unit,
            quantity: dto.quantity,
          },
          eventId,
        };
      },
    );
  }
}
