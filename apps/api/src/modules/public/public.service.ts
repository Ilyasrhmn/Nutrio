import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PublicService {
  constructor(private readonly dataSource: DataSource) {}

  async getOverview() {
    const [stats] = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM vendors WHERE lifecycle_status = 'ACTIVE')  AS total_active_vendors,
        (SELECT COALESCE(SUM(target_porsi), 0)
           FROM sppg_locations WHERE is_active = true)                    AS total_porsi_today,
        (SELECT COUNT(*) FROM daily_score_records
           WHERE score_date = CURRENT_DATE AND score_current >= 80)       AS vendors_excellent,
        (SELECT COUNT(*) FROM school_confirmations
           WHERE confirmed_at::date = CURRENT_DATE)                       AS confirmations_today
    `);

    return {
      totalActiveVendors: Number(stats.total_active_vendors),
      totalPorsiToday: Number(stats.total_porsi_today),
      vendorsExcellent: Number(stats.vendors_excellent),
      confirmationsToday: Number(stats.confirmations_today),
    };
  }

  async searchSppg(q?: string, city?: string, limit = 20) {
    const conditions = [`v.lifecycle_status = 'ACTIVE'`];
    const params: unknown[] = [limit];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`v.business_name ILIKE $${params.length}`);
    }
    if (city) {
      params.push(`%${city}%`);
      conditions.push(`v.address ILIKE $${params.length}`);
    }

    const rows = await this.dataSource.query(
      `SELECT v.id, v.business_name,
              v.address_city,
              v.address_province,
              COALESCE(dsr.score_current, 100) AS score_current,
              sl.target_porsi,
              sl.assigned_schools,
              ST_Y(sl.coordinates::geometry) AS lat,
              ST_X(sl.coordinates::geometry) AS lng
       FROM vendors v
       LEFT JOIN daily_score_records dsr
              ON dsr.vendor_id = v.id AND dsr.score_date = CURRENT_DATE
       LEFT JOIN sppg_locations sl ON sl.vendor_id = v.id AND sl.is_active = true
       WHERE ${conditions.join(' AND ')}
       ORDER BY dsr.score_current DESC NULLS LAST
       LIMIT $1`,
      params,
    );

    return rows.map((r: any) => ({
      id: r.id,
      name: r.business_name,
      addressCity: r.address_city,
      addressProvince: r.address_province,
      score: Number(r.score_current),
      targetPorsi: r.target_porsi ?? 0,
      schoolCount: Array.isArray(r.assigned_schools) ? r.assigned_schools.length : 0,
      lat: r.lat ? Number(r.lat) : null,
      lng: r.lng ? Number(r.lng) : null,
    }));
  }

  async getSppgPublicProfile(vendorId: string) {
    const [vendor] = await this.dataSource.query(
      `SELECT v.id, v.business_name,
              COALESCE(dsr.score_current, 100) AS score_current,
              sl.target_porsi
       FROM vendors v
       LEFT JOIN daily_score_records dsr
              ON dsr.vendor_id = v.id AND dsr.score_date = CURRENT_DATE
       LEFT JOIN sppg_locations sl ON sl.vendor_id = v.id AND sl.is_active = true
       WHERE v.id = $1 AND v.lifecycle_status = 'ACTIVE'`,
      [vendorId],
    );
    if (!vendor) return null;

    const history = await this.dataSource.query(
      `SELECT score_date, COALESCE(score_final, score_current) AS score
       FROM daily_score_records
       WHERE vendor_id = $1 AND score_date >= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY score_date ASC`,
      [vendorId],
    );

    return {
      id: vendor.id,
      name: vendor.business_name,
      score: Number(vendor.score_current),
      targetPorsi: vendor.target_porsi ?? 0,
      scoreHistory30d: history.map((h: any) => ({
        date: h.score_date,
        score: Number(h.score),
      })),
    };
  }

  async getAuditTrail(vendorId: string, limit = 10) {
    const rows = await this.dataSource.query(
      `SELECT al.id, al.action, al.entity_type, al.data_hash, al.created_at,
              al.diff
       FROM audit_logs al
       WHERE al.entity_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [vendorId, limit],
    );

    return rows.map((r: any) => ({
      id: r.id,
      action: r.action,
      entityType: r.entity_type,
      dataHash: r.data_hash,
      createdAt: r.created_at,
    }));
  }
}
