import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { EntityManager, DataSource } from "typeorm";
import { AuditService } from "../../common/audit/audit.service";
import { IdempotencyService } from "../../common/idempotency/idempotency.service";
import { BASE_DISBURSEMENT_RATE } from "../scoring/penalty.constants";

@Injectable()
export class OperationDaysService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly idempotency: IdempotencyService,
    private readonly audit: AuditService,
  ) {}
  private async vendorId(manager: EntityManager, userId: string) {
    const [vendor] = await manager.query(
      `SELECT id FROM vendors WHERE user_id=$1`,
      [userId],
    );
    if (!vendor) throw new ForbiddenException("Profil vendor tidak ditemukan");
    return vendor.id as string;
  }
  async create(userId: string, menuPlanId: string, key?: string) {
    return this.idempotency.execute(
      userId,
      key,
      { menuPlanId },
      async (manager, correlationId) => {
        const vendorId = await this.vendorId(manager, userId);
        const [menu] = await manager.query(
          `SELECT * FROM menu_plans WHERE id=$1 AND vendor_id=$2 FOR UPDATE`,
          [menuPlanId, vendorId],
        );
        if (!menu) throw new NotFoundException("Menu plan tidak ditemukan");
        const shortages = await manager.query(
          `SELECT mi.product_id, mi.unit, (mi.quantity_per_pax * $2) - COALESCE(SUM(l.quantity_delta), 0) shortage FROM menu_plan_items mi LEFT JOIN inventory_ledger l ON l.vendor_id=$1 AND l.product_id=mi.product_id AND l.unit=mi.unit WHERE mi.menu_plan_id=$3 GROUP BY mi.product_id, mi.unit, mi.quantity_per_pax HAVING (mi.quantity_per_pax * $2) > COALESCE(SUM(l.quantity_delta), 0)`,
          [vendorId, menu.target_pax, menu.id],
        );
        if (shortages.length)
          throw new UnprocessableEntityException({
            code: "INSUFFICIENT_INVENTORY",
            shortages,
          });
        const [day] = await manager.query(
          `INSERT INTO operation_days (vendor_id, menu_plan_id, operation_date) VALUES ($1,$2,$3) RETURNING *`,
          [vendorId, menu.id, menu.operation_date],
        );
        const eventId = await this.audit.record(manager, {
          actorUserId: userId,
          aggregateType: "operation_day",
          aggregateId: day.id,
          action: "operation.created",
          after: { status: day.status, operationDate: day.operation_date },
          correlationId,
        });
        return {
          body: { id: day.id, status: day.status, allowedNext: ["CP1"] },
          eventId,
        };
      },
    );
  }
  async today(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const vendorId = await this.vendorId(manager, userId);
      const [day] = await manager.query(
        `SELECT * FROM operation_days WHERE vendor_id=$1 AND operation_date=CURRENT_DATE`,
        [vendorId],
      );
      if (!day) return null;
      const next =
        day.status === "planned"
          ? "CP1"
          : day.status === "in_progress"
            ? "CP2"
            : day.status === "dispatched"
              ? "CP4"
              : day.status === "school_confirmed"
                ? "close"
                : null;
      return {
        id: day.id,
        status: day.status,
        allowedNext: next ? [next] : [],
      };
    });
  }
  async consumeForCp1(
    manager: EntityManager,
    operationDayId: string,
    actorUserId: string,
  ) {
    const [day] = await manager.query(
      `SELECT od.*, mp.target_pax FROM operation_days od JOIN menu_plans mp ON mp.id=od.menu_plan_id WHERE od.id=$1 FOR UPDATE`,
      [operationDayId],
    );
    if (!day) throw new NotFoundException("Operation day tidak ditemukan");
    if (day.status !== "planned" && day.status !== "in_progress")
      throw new ConflictException(
        "CP1 tidak diizinkan untuk status operation day ini",
      );
    const items = await manager.query(
      `SELECT product_id,unit,quantity_per_pax FROM menu_plan_items WHERE menu_plan_id=$1`,
      [day.menu_plan_id],
    );
    for (const item of items) {
      const [balance] = await manager.query(
        `SELECT COALESCE(SUM(quantity_delta),0) quantity FROM inventory_ledger WHERE vendor_id=$1 AND product_id=$2 AND unit=$3`,
        [day.vendor_id, item.product_id, item.unit],
      );
      const required = Number(item.quantity_per_pax) * Number(day.target_pax);
      const [existing] = await manager.query(
        `SELECT id FROM inventory_ledger WHERE source_type='operation_day' AND source_id=$1 AND entry_type='consumption' AND product_id=$2 AND unit=$3`,
        [operationDayId, item.product_id, item.unit],
      );
      if (!existing && Number(balance.quantity) < required)
        throw new UnprocessableEntityException("Stok tidak cukup untuk CP1");
      await manager.query(
        `INSERT INTO inventory_ledger (vendor_id,product_id,unit,quantity_delta,entry_type,source_type,source_id,actor_user_id) VALUES ($1,$2,$3,$4,'consumption','operation_day',$5,$6) ON CONFLICT (source_type,source_id,entry_type,product_id,unit) DO NOTHING`,
        [
          day.vendor_id,
          item.product_id,
          item.unit,
          -required,
          operationDayId,
          actorUserId,
        ],
      );
    }
    await manager.query(
      `UPDATE operation_days SET status='in_progress',updated_at=NOW() WHERE id=$1`,
      [operationDayId],
    );
    return day;
  }
  async activeForVendor(manager: EntityManager, vendorId: string) {
    const [day] = await manager.query(
      `SELECT * FROM operation_days WHERE vendor_id=$1 AND operation_date=CURRENT_DATE FOR UPDATE`,
      [vendorId],
    );
    if (!day)
      throw new ConflictException("Operation day hari ini belum dibuat");
    return day;
  }
  async close(userId: string, operationDayId: string, key?: string) {
    return this.idempotency.execute(
      userId,
      key,
      { operationDayId },
      async (manager, correlationId) => {
        const vendorId = await this.vendorId(manager, userId);
        const [day] = await manager.query(
          `SELECT * FROM operation_days WHERE id=$1 AND vendor_id=$2 FOR UPDATE`,
          [operationDayId, vendorId],
        );
        if (!day) throw new NotFoundException("Operation day tidak ditemukan");
        if (day.status !== "school_confirmed")
          throw new ConflictException(
            "Operation day belum dikonfirmasi sekolah",
          );
        const [facts] = await manager.query(
          `SELECT
             (SELECT COUNT(*)::int FROM checkpoint_events
              WHERE operation_day_id = $1 AND cp_status = 'done') AS checkpoints_done,
             (SELECT COUNT(*)::int FROM delivery_tokens
              WHERE operation_day_id = $1) AS deliveries_total,
             (SELECT COUNT(*)::int FROM school_confirmations sc
              JOIN delivery_tokens dt ON dt.id = sc.delivery_token_id
              WHERE dt.operation_day_id = $1) AS schools_confirmed,
             (SELECT COUNT(*)::int FROM incidents
              WHERE operation_day_id = $1) AS incident_count,
             (SELECT COALESCE(SUM(se.score_delta), 0)::int
              FROM score_events se
              JOIN daily_score_records dsr ON dsr.id = se.daily_score_record_id
              WHERE dsr.vendor_id = $2 AND dsr.score_date = $3::date) AS score_delta`,
          [operationDayId, vendorId, day.operation_date],
        );
        if (Number(facts.checkpoints_done) !== 4)
          throw new ConflictException(
            "Empat checkpoint wajib selesai sebelum closing",
          );
        if (
          Number(facts.deliveries_total) === 0 ||
          Number(facts.deliveries_total) !== Number(facts.schools_confirmed)
        )
          throw new ConflictException(
            "Semua pengantaran harus dikonfirmasi sekolah sebelum closing",
          );
        const [score] = await manager.query(
          `INSERT INTO daily_score_records (vendor_id,score_date,score_current) VALUES ($1,CURRENT_DATE,100) ON CONFLICT (vendor_id,score_date) DO UPDATE SET score_current=daily_score_records.score_current RETURNING *`,
          [vendorId],
        );
        const scoreFinal = Math.max(
          0,
          Math.min(100, 100 + Number(facts.score_delta)),
        );
        await manager.query(
          `UPDATE daily_score_records
           SET score_current=$2, score_final=$2, finalized_at=NOW() WHERE id=$1`,
          [score.id, scoreFinal],
        );
        const [sppg] = await manager.query(
          `SELECT target_porsi FROM sppg_locations WHERE vendor_id=$1 AND is_active=true LIMIT 1`,
          [vendorId],
        );
        const estimate = Math.floor(
          Number(sppg?.target_porsi ?? 100) *
            BASE_DISBURSEMENT_RATE *
            (scoreFinal / 100),
        );
        const [projection] = await manager.query(
          `INSERT INTO fund_projections (operation_day_id,vendor_id,amount) VALUES ($1,$2,$3) ON CONFLICT (operation_day_id) DO UPDATE SET amount=EXCLUDED.amount RETURNING id`,
          [operationDayId, vendorId, estimate],
        );
        await manager.query(
          `UPDATE operation_days SET status='closed',closed_at=NOW(),updated_at=NOW() WHERE id=$1`,
          [operationDayId],
        );
        const eventId = await this.audit.record(manager, {
          actorUserId: userId,
          aggregateType: "operation_day",
          aggregateId: operationDayId,
          action: "operation.closed",
          after: {
            scoreFinal,
            fundProjectionId: projection.id,
            facts: {
              checkpointsDone: Number(facts.checkpoints_done),
              deliveriesTotal: Number(facts.deliveries_total),
              schoolsConfirmed: Number(facts.schools_confirmed),
              incidentCount: Number(facts.incident_count),
              scoreDelta: Number(facts.score_delta),
            },
          },
          correlationId,
        });
        return {
          body: {
            id: operationDayId,
            status: "closed",
            scoreFinal,
            fundProjectionId: projection.id,
          },
          eventId,
        };
      },
    );
  }
}
