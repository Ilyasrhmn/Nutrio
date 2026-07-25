import {
  Injectable,
  NotFoundException,
  GoneException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { ScoringService } from "../scoring/scoring.service";
import { RealtimeService } from "../realtime/realtime.service";
import { AuditService } from "../../common/audit/audit.service";

export interface ConfirmPayload {
  jumlahDiterima: number;
  kondisi: "baik" | "ada_masalah";
  masalahJenis?: string[];
  catatan?: string;
}

@Injectable()
export class SchoolConfirmService {
  private readonly logger = new Logger(SchoolConfirmService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly scoringService: ScoringService,
    private readonly realtimeService: RealtimeService,
    private readonly audit: AuditService,
  ) {}

  async getDeliveryInfo(qrToken: string) {
    const [row] = await this.dataSource.query(
      `SELECT dt.token, dt.vendor_id, dt.school_id, dt.porsi_count, dt.status,
              dt.expired_at, dt.completed_at, v.business_name AS vendor_name,
              sc.id AS confirmation_id
       FROM delivery_tokens dt
       JOIN vendors v ON v.id = dt.vendor_id
       LEFT JOIN school_confirmations sc ON sc.delivery_token_id = dt.id
       WHERE dt.token = $1::uuid`,
      [qrToken],
    );
    if (!row) throw new NotFoundException("QR token tidak valid");
    if (row.confirmation_id)
      throw new ConflictException("Sudah dikonfirmasi sebelumnya");
    if (new Date(row.expired_at) < new Date())
      throw new GoneException("Token sudah kedaluwarsa");

    return {
      token: row.token,
      vendorName: row.vendor_name,
      schoolId: row.school_id,
      porsiCount: row.porsi_count,
      status: row.status,
    };
  }

  async confirm(qrToken: string, payload: ConfirmPayload) {
    const tokenRow: any = await this.dataSource.transaction(async (manager) => {
      const [token] = await manager.query(
        `SELECT dt.id, dt.vendor_id, dt.school_id, dt.operation_day_id, dt.completed_at,
                dt.expired_at, dt.porsi_count, sc.id AS existing_confirm
         FROM delivery_tokens dt
         LEFT JOIN school_confirmations sc ON sc.delivery_token_id = dt.id
         WHERE dt.token = $1::uuid FOR UPDATE OF dt`,
        [qrToken],
      );
      if (!token) throw new NotFoundException("QR token tidak valid");
      if (token.existing_confirm)
        throw new ConflictException("Sudah dikonfirmasi sebelumnya");
      if (new Date(token.expired_at) < new Date())
        throw new GoneException("Token sudah kedaluwarsa");
      if (!token.completed_at)
        throw new ConflictException("Pengantaran belum selesai");
      await manager.query(
        `INSERT INTO school_confirmations (delivery_token_id, jumlah_diterima, kondisi, masalah_jenis, catatan)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          token.id,
          payload.jumlahDiterima,
          payload.kondisi,
          payload.masalahJenis ?? [],
          payload.catatan ?? null,
        ],
      );
      await manager.query(
        `UPDATE delivery_tokens SET status = 'used', used_at = NOW() WHERE id = $1`,
        [token.id],
      );
      if (token.operation_day_id) {
        await manager.query(
          `UPDATE operation_days SET status = 'school_confirmed', updated_at = NOW()
           WHERE id = $1 AND status = 'dispatched'`,
          [token.operation_day_id],
        );
      }
      const hasIssue =
        payload.kondisi === "ada_masalah" ||
        payload.jumlahDiterima !== Number(token.porsi_count);
      if (hasIssue) {
        await manager.query(
          `INSERT INTO incidents (vendor_id, operation_day_id, source_type, source_id, severity, reason)
           VALUES ($1, $2, 'school_confirmation', $3, 'critical', $4)`,
          [
            token.vendor_id,
            token.operation_day_id ?? null,
            token.id,
            payload.masalahJenis?.join(", ") ?? "Jumlah porsi tidak sesuai",
          ],
        );
      }
      await this.audit.record(manager, {
        aggregateType: "school_confirmation",
        aggregateId: token.id,
        action: "school.confirmed",
        after: {
          operationDayId: token.operation_day_id,
          kondisi: payload.kondisi,
          jumlahDiterima: payload.jumlahDiterima,
        },
      });
      return { ...token, hasIssue };
    });

    if (tokenRow.hasIssue) {
      await this.scoringService.applyPenalty(
        tokenRow.vendor_id,
        "SCHOOL_COMPLAINT",
        {
          reason: payload.masalahJenis?.join(", ") ?? "Masalah tidak dirinci",
        },
      );

      await this.dataSource.query(
        `INSERT INTO alerts (vendor_id, alert_type, severity, title, body)
         VALUES ($1, 'citizen_report', 'critical',
           'Konfirmasi sekolah: Ada Masalah',
           $2)`,
        [
          tokenRow.vendor_id,
          `Sekolah ${tokenRow.school_id}: ${payload.masalahJenis?.join(", ") ?? "-"}. Catatan: ${payload.catatan ?? "-"}`,
        ],
      );

      this.realtimeService.broadcastToBGN("alert:new", {
        vendorId: tokenRow.vendor_id,
        type: "SCHOOL_COMPLAINT",
        schoolId: tokenRow.school_id,
        masalah: payload.masalahJenis,
      });

      this.logger.warn(
        `[school-confirm] Complaint vendor=${tokenRow.vendor_id} school=${tokenRow.school_id}`,
      );
    } else {
      this.realtimeService.broadcastToVendor(
        tokenRow.vendor_id,
        "delivery:confirmed",
        {
          schoolId: tokenRow.school_id,
          jumlahDiterima: payload.jumlahDiterima,
        },
      );
    }

    return { ok: true };
  }
}
