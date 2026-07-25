import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit/audit.service';
import { IdempotencyService } from '../../common/idempotency/idempotency.service';
import { UpsertMenuPlanDto } from './dto/upsert-menu-plan.dto';

@Injectable()
export class MenuPlansService {
  constructor(private readonly dataSource: DataSource, private readonly idempotency: IdempotencyService, private readonly audit: AuditService) {}
  private async vendorId(userId: string) {
    const [vendor] = await this.dataSource.query(`SELECT id FROM vendors WHERE user_id = $1`, [userId]);
    if (!vendor) throw new ForbiddenException('Profil vendor tidak ditemukan');
    return vendor.id as string;
  }
  async upsert(userId: string, dto: UpsertMenuPlanDto, key?: string) {
    if (new Set(dto.items.map((item) => `${item.productId}:${item.unit}`)).size !== dto.items.length) throw new ConflictException('Produk menu tidak boleh duplikat');
    return this.idempotency.execute(userId, key, dto, async (manager, correlationId) => {
      const [vendor] = await manager.query(`SELECT id FROM vendors WHERE user_id = $1`, [userId]);
      if (!vendor) throw new ForbiddenException('Profil vendor tidak ditemukan');
      const [plan] = await manager.query(
        `INSERT INTO menu_plans (vendor_id, operation_date, target_pax)
         VALUES ($1, $2::date, $3)
         ON CONFLICT (vendor_id, operation_date) DO UPDATE SET target_pax = EXCLUDED.target_pax, updated_at = NOW()
         RETURNING *`, [vendor.id, dto.operationDate, dto.targetPax]);
      await manager.query(`DELETE FROM menu_plan_items WHERE menu_plan_id = $1`, [plan.id]);
      for (const item of dto.items) await manager.query(
        `INSERT INTO menu_plan_items (menu_plan_id, product_id, unit, quantity_per_pax) VALUES ($1, $2, $3, $4)`,
        [plan.id, item.productId, item.unit, item.quantityPerPax]);
      const eventId = await this.audit.record(manager, { actorUserId: userId, aggregateType: 'menu_plan', aggregateId: plan.id, action: 'menu_plan.saved', after: { operationDate: dto.operationDate, targetPax: dto.targetPax, items: dto.items }, correlationId });
      return { body: { id: plan.id, operationDate: plan.operation_date, targetPax: Number(plan.target_pax), items: dto.items }, eventId };
    });
  }
  async get(userId: string, operationDate: string) {
    const vendorId = await this.vendorId(userId);
    const [plan] = await this.dataSource.query(`SELECT * FROM menu_plans WHERE vendor_id = $1 AND operation_date = $2::date`, [vendorId, operationDate]);
    if (!plan) throw new NotFoundException('Menu plan tidak ditemukan');
    const items = await this.dataSource.query(
      `SELECT mi.product_id, mi.unit, mi.quantity_per_pax, p.name,
       COALESCE((SELECT SUM(l.quantity_delta) FROM inventory_ledger l WHERE l.vendor_id = $1 AND l.product_id = mi.product_id AND l.unit = mi.unit), 0) available
       FROM menu_plan_items mi JOIN supplier_products p ON p.id = mi.product_id WHERE mi.menu_plan_id = $2`, [vendorId, plan.id]);
    return { id: plan.id, operationDate: plan.operation_date, targetPax: Number(plan.target_pax), items: items.map((item: any) => { const requiredQuantity = Number(item.quantity_per_pax) * Number(plan.target_pax); const availableQuantity = Number(item.available); return { productId: item.product_id, name: item.name, unit: item.unit, requiredQuantity, availableQuantity, shortageQuantity: Math.max(0, requiredQuantity - availableQuantity) }; }) };
  }
}
