import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { RealtimeService } from "../realtime/realtime.service";
import { VendorReadinessService } from "../vendors/vendor-readiness.service";
import { StateMachineService } from "../vendors/state-machine.service";
import { VendorLifecycleStatus } from "../vendors/entities/vendor.entity";
import { ListVendorsQueryDto } from "./dto/list-vendors-query.dto";
import { UpdateTeamMemberDto } from "../onboarding/dto/update-team-member.dto";

@Injectable()
export class AdminVendorsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly readiness: VendorReadinessService,
    private readonly lifecycle: StateMachineService,
    private readonly realtime: RealtimeService,
  ) {}

  async list(query: ListVendorsQueryDto) {
    const values: unknown[] = [];
    const where = ["v.deleted_at IS NULL"];
    if (query.lifecycleStatus) {
      values.push(query.lifecycleStatus);
      where.push(`v.lifecycle_status = $${values.length}`);
    }
    if (query.province) {
      values.push(query.province);
      where.push(`v.address_province ILIKE $${values.length}`);
    }
    const readinessSql = `(NULLIF(BTRIM(v.phone), '') IS NOT NULL AND NULLIF(BTRIM(v.address_street), '') IS NOT NULL AND EXISTS (SELECT 1 FROM sppg_locations sl WHERE sl.vendor_id=v.id AND sl.is_active) AND EXISTS (SELECT 1 FROM documents d WHERE d.vendor_id=v.id AND d.status='verified' AND (d.expires_at IS NULL OR d.expires_at >= CURRENT_DATE)) AND EXISTS (SELECT 1 FROM vendor_team_members tm WHERE tm.vendor_id=v.id AND tm.role='kepala_dapur' AND tm.status='accepted') AND EXISTS (SELECT 1 FROM onboarding_progress op WHERE op.vendor_id=v.id AND op.step3_done) AND EXISTS (SELECT 1 FROM vendor_supplier_connections vsc JOIN suppliers s ON s.id=vsc.supplier_id AND s.status='verified' WHERE vsc.vendor_id=v.id) AND EXISTS (SELECT 1 FROM inspections i WHERE i.vendor_id=v.id AND i.status='completed' AND i.critical_fails=0 AND i.inspection_score >= 80))`;
    if (query.ready !== undefined)
      where.push(`${readinessSql} = ${query.ready === "true"}`);
    const filter = where.join(" AND ");
    values.push(query.limit, (query.page - 1) * query.limit);
    const [items, count] = await Promise.all([
      this.dataSource.query(
        `SELECT v.id, v.business_name AS "businessName", v.owner_name AS "ownerName", v.address_province AS "province", v.lifecycle_status AS "lifecycleStatus", ${readinessSql} AS ready FROM vendors v WHERE ${filter} ORDER BY v.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      ),
      this.dataSource.query(
        `SELECT COUNT(*)::int AS total FROM vendors v WHERE ${filter}`,
        values.slice(0, -2),
      ),
    ]);
    return {
      items,
      total: count[0].total,
      page: query.page,
      limit: query.limit,
    };
  }

  async detail(vendorId: string) {
    const [vendor] = await this.dataSource.query(
      `SELECT id, business_name AS "businessName", owner_name AS "ownerName", lifecycle_status AS "lifecycleStatus", status, status_reason AS "statusReason" FROM vendors WHERE id=$1 AND deleted_at IS NULL`,
      [vendorId],
    );
    if (!vendor) throw new NotFoundException("Vendor tidak ditemukan");
    const [readiness, timeline, team, documents] = await Promise.all([
      this.readiness.evaluate(vendorId),
      this.lifecycle.getTimeline(vendorId),
      this.dataSource.query(
        `SELECT id, role, invite_email AS "inviteEmail", status, accepted_at AS "acceptedAt" FROM vendor_team_members WHERE vendor_id=$1 ORDER BY created_at`,
        [vendorId],
      ),
      this.dataSource.query(
        `SELECT id, doc_type AS "docType", status, uploaded_at AS "uploadedAt" FROM documents WHERE vendor_id=$1 ORDER BY uploaded_at DESC`,
        [vendorId],
      ),
    ]);
    return { ...vendor, readiness, timeline, team, documents };
  }

  async suspend(vendorId: string, actorId: string, reason: string) {
    const result = await this.lifecycle.transition(
      vendorId,
      VendorLifecycleStatus.SUSPENDED,
      actorId,
      reason,
    );
    this.realtime.broadcastToVendor(
      vendorId,
      "vendor:lifecycle:update",
      result,
    );
    return result;
  }

  async resume(vendorId: string, actorId: string, reason: string) {
    const snapshot = await this.readiness.evaluate(vendorId, actorId);
    if (!snapshot.ready)
      throw new ConflictException({
        code: "NOT_READY",
        missingRequirements: snapshot.missingRequirements,
      });
    const result = await this.lifecycle.transition(
      vendorId,
      VendorLifecycleStatus.ACTIVE,
      actorId,
      reason,
    );
    this.realtime.broadcastToVendor(
      vendorId,
      "vendor:lifecycle:update",
      result,
    );
    return result;
  }

  async requestRevision(
    vendorId: string,
    actorId: string,
    reason: string,
    missingRequirements: string[],
  ) {
    const result = await this.lifecycle.transition(
      vendorId,
      VendorLifecycleStatus.REVISION_REQUESTED,
      actorId,
      `${reason}: ${missingRequirements.join(", ")}`,
    );
    this.realtime.broadcastToVendor(
      vendorId,
      "vendor:lifecycle:update",
      result,
    );
    return result;
  }

  async updateTeamMember(
    vendorId: string,
    memberId: string,
    dto: UpdateTeamMemberDto,
  ) {
    const [member] = await this.dataSource.query(
      `UPDATE vendor_team_members
       SET role = COALESCE($3, role), invite_email = COALESCE($4, invite_email),
           invite_phone = COALESCE($5, invite_phone), updated_at = NOW()
       WHERE id = $1 AND vendor_id = $2
       RETURNING id, role, invite_email AS "inviteEmail", invite_phone AS "invitePhone", status`,
      [
        memberId,
        vendorId,
        dto.role ?? null,
        dto.email ?? null,
        dto.phone ?? null,
      ],
    );
    if (!member) throw new NotFoundException("Anggota tim tidak ditemukan");
    return member;
  }

  async resendTeamMemberInvite(vendorId: string, memberId: string) {
    const [member] = await this.dataSource.query(
      `UPDATE vendor_team_members SET invite_sent_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND vendor_id = $2 AND status = 'pending'
       RETURNING id, status, invite_sent_at AS "inviteSentAt"`,
      [memberId, vendorId],
    );
    if (!member)
      throw new NotFoundException("Undangan pending tidak ditemukan");
    return member;
  }

  async removeTeamMember(vendorId: string, memberId: string) {
    const rows = await this.dataSource.query(
      `DELETE FROM vendor_team_members WHERE id = $1 AND vendor_id = $2 RETURNING id`,
      [memberId, vendorId],
    );
    if (!rows[0]) throw new NotFoundException("Anggota tim tidak ditemukan");
    return { ok: true };
  }
}
