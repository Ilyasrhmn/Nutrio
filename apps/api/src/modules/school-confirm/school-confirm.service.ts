import {
  Injectable,
  NotFoundException,
  GoneException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ScoringService } from '../scoring/scoring.service';
import { RealtimeService } from '../realtime/realtime.service';

export interface ConfirmPayload {
  jumlahDiterima: number;
  kondisi: 'baik' | 'ada_masalah';
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
    if (!row) throw new NotFoundException('QR token tidak valid');
    if (row.confirmation_id) throw new ConflictException('Sudah dikonfirmasi sebelumnya');
    if (new Date(row.expired_at) < new Date()) throw new GoneException('Token sudah kedaluwarsa');

    return {
      token: row.token,
      vendorName: row.vendor_name,
      schoolId: row.school_id,
      porsiCount: row.porsi_count,
      status: row.status,
    };
  }

  async confirm(qrToken: string, payload: ConfirmPayload) {
    const [tokenRow] = await this.dataSource.query(
      `SELECT dt.id, dt.vendor_id, dt.school_id, sc.id AS existing_confirm
       FROM delivery_tokens dt
       LEFT JOIN school_confirmations sc ON sc.delivery_token_id = dt.id
       WHERE dt.token = $1::uuid`,
      [qrToken],
    );
    if (!tokenRow) throw new NotFoundException('QR token tidak valid');
    if (tokenRow.existing_confirm) throw new ConflictException('Sudah dikonfirmasi sebelumnya');

    await this.dataSource.query(
      `INSERT INTO school_confirmations (delivery_token_id, jumlah_diterima, kondisi, masalah_jenis, catatan)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        tokenRow.id,
        payload.jumlahDiterima,
        payload.kondisi,
        JSON.stringify(payload.masalahJenis ?? []),
        payload.catatan ?? null,
      ],
    );

    await this.dataSource.query(
      `UPDATE delivery_tokens SET status = 'used', used_at = NOW() WHERE id = $1`,
      [tokenRow.id],
    );

    if (payload.kondisi === 'ada_masalah') {
      await this.scoringService.applyPenalty(tokenRow.vendor_id, 'SCHOOL_COMPLAINT', {
        reason: payload.masalahJenis?.join(', ') ?? 'Masalah tidak dirinci',
      });

      await this.dataSource.query(
        `INSERT INTO alerts (vendor_id, alert_type, severity, title, body)
         VALUES ($1, 'citizen_report', 'critical',
           'Konfirmasi sekolah: Ada Masalah',
           $2)`,
        [tokenRow.vendor_id, `Sekolah ${tokenRow.school_id}: ${payload.masalahJenis?.join(', ') ?? '-'}. Catatan: ${payload.catatan ?? '-'}`],
      );

      this.realtimeService.broadcastToBGN('alert:new', {
        vendorId: tokenRow.vendor_id,
        type: 'SCHOOL_COMPLAINT',
        schoolId: tokenRow.school_id,
        masalah: payload.masalahJenis,
      });

      this.logger.warn(`[school-confirm] Complaint vendor=${tokenRow.vendor_id} school=${tokenRow.school_id}`);
    } else {
      this.realtimeService.broadcastToVendor(tokenRow.vendor_id, 'delivery:confirmed', {
        schoolId: tokenRow.school_id,
        jumlahDiterima: payload.jumlahDiterima,
      });
    }

    return { ok: true };
  }
}
