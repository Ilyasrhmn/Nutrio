import {
  Injectable,
  NotFoundException,
  GoneException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { ScoringService } from '../scoring/scoring.service';
import { RealtimeService } from '../realtime/realtime.service';

export interface DeliveryInfo {
  token: string;
  vendorName: string;
  schoolId: string;
  porsiCount: number;
  generatedAt: Date;
  expiredAt: Date;
  status: string;
  arrivedAt: Date | null;
  completedAt: Date | null;
}

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly scoringService: ScoringService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private async getToken(token: string) {
    const [row] = await this.dataSource.query(
      `SELECT dt.*, v.business_name AS vendor_name
       FROM delivery_tokens dt
       JOIN vendors v ON v.id = dt.vendor_id
       WHERE dt.token = $1::uuid`,
      [token],
    );
    return row ?? null;
  }

  async getInfo(token: string): Promise<DeliveryInfo> {
    const row = await this.getToken(token);
    if (!row) throw new NotFoundException('Token tidak ditemukan');
    if (row.status === 'used') throw new GoneException('Token sudah digunakan');
    if (new Date(row.expired_at) < new Date()) throw new GoneException('Token sudah kedaluwarsa');

    return {
      token: row.token,
      vendorName: row.vendor_name,
      schoolId: row.school_id,
      porsiCount: row.porsi_count,
      generatedAt: row.generated_at,
      expiredAt: row.expired_at,
      status: row.status,
      arrivedAt: row.arrived_at ?? null,
      completedAt: row.completed_at ?? null,
    };
  }

  async recordArrival(token: string, gpsLat?: number, gpsLng?: number): Promise<{ ok: boolean }> {
    const row = await this.getToken(token);
    if (!row) throw new NotFoundException('Token tidak ditemukan');
    if (row.status === 'used') throw new GoneException('Token sudah digunakan');
    if (new Date(row.expired_at) < new Date()) {
      await this.scoringService.applyPenalty(row.vendor_id, 'DELIVERY_LATE');
      throw new GoneException('Token sudah kedaluwarsa');
    }

    const gps =
      gpsLat != null && gpsLng != null
        ? `ST_SetSRID(ST_MakePoint(${gpsLng}, ${gpsLat}), 4326)`
        : null;

    await this.dataSource.query(
      `UPDATE delivery_tokens SET arrived_at = NOW(), status = 'in_progress'${gps ? `, gps = ${gps}` : ''} WHERE token = $1::uuid`,
      [token],
    );

    return { ok: true };
  }

  async uploadArrivalPhoto(token: string, file: Express.Multer.File): Promise<{ fileUrl: string }> {
    const row = await this.getToken(token);
    if (!row) throw new NotFoundException('Token tidak ditemukan');
    if (row.status === 'used') throw new GoneException('Token sudah digunakan');

    const key = `delivery/${row.vendor_id}/${token}.jpg`;
    const result = await this.storageService.upload(file.buffer, key, file.mimetype);

    await this.dataSource.query(
      `UPDATE delivery_tokens SET arrival_photo = $1 WHERE token = $2::uuid`,
      [result.fileUrl, token],
    );

    return { fileUrl: result.fileUrl };
  }

  async getQrPayload(token: string): Promise<{ token: string; qrValue: string; status: string }> {
    const row = await this.getToken(token);
    if (!row) throw new NotFoundException('Token tidak ditemukan');
    if (row.status === 'used') throw new GoneException('Token sudah digunakan');

    const appBaseUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';
    return {
      token: row.token,
      qrValue: `${appBaseUrl}/sekolah/confirm/${row.token}`,
      status: row.status,
    };
  }

  async getMyWeekSchedule(userId: string) {
    const [vendor] = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1`,
      [userId],
    );
    if (!vendor) return { days: [] };

    const rows = await this.dataSource.query(
      `SELECT
         dt.generated_at::date  AS delivery_date,
         dt.school_id,
         dt.porsi_count,
         dt.status,
         dt.arrived_at,
         dt.completed_at
       FROM delivery_tokens dt
       WHERE dt.vendor_id = $1
         AND dt.generated_at >= date_trunc('week', CURRENT_DATE)
         AND dt.generated_at < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
       ORDER BY dt.generated_at ASC`,
      [vendor.id],
    );

    const [sppg] = await this.dataSource.query(
      `SELECT assigned_schools, target_porsi FROM sppg_locations
       WHERE vendor_id = $1 AND is_active = TRUE LIMIT 1`,
      [vendor.id],
    );

    const byDate: Record<string, typeof rows> = {};
    for (const r of rows) {
      const k = new Date(r.delivery_date).toISOString().split('T')[0]!;
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(r);
    }

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + i);
      const key = d.toISOString().split('T')[0]!;
      const deliveries = byDate[key] ?? [];
      const isToday = key === new Date().toISOString().split('T')[0];

      result.push({
        date: key,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday,
        totalPorsi: sppg?.target_porsi ?? 0,
        hasData: deliveries.length > 0,
        schools: deliveries.map((r: any) => ({
          schoolId: r.school_id,
          porsiCount: Number(r.porsi_count),
          status: r.status,
          arrivedAt: r.arrived_at ?? null,
          completedAt: r.completed_at ?? null,
        })),
        assignedSchools: sppg?.assigned_schools ?? [],
      });
    }

    return { days: result };
  }

  async complete(token: string): Promise<{ ok: boolean }> {
    const row = await this.getToken(token);
    if (!row) throw new NotFoundException('Token tidak ditemukan');
    if (row.status === 'used') throw new ConflictException('Token sudah digunakan');
    if (!row.arrived_at) throw new BadRequestException('Harus catat kedatangan dulu');

    await this.dataSource.query(
      `UPDATE delivery_tokens SET completed_at = NOW(), status = 'waiting_school_confirm' WHERE token = $1::uuid`,
      [token],
    );

    this.realtimeService.broadcastToVendor(row.vendor_id, 'delivery:waiting_confirm', {
      token,
      schoolId: row.school_id,
    });

    this.logger.log(`[delivery] Token ${token} completed, waiting school confirm`);
    return { ok: true };
  }
}
