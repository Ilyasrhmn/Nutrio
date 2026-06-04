import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CommandCenterService {
  constructor(private readonly dataSource: DataSource) {}

  async getOverview() {
    const [stats] = await this.dataSource.query(`
      SELECT
        COUNT(*)                                                          AS total_active,
        COUNT(*) FILTER (WHERE dsr.id IS NULL)                           AS not_started,
        COUNT(*) FILTER (WHERE dsr.score_current < 60)                   AS critical,
        (SELECT COUNT(*) FROM alerts WHERE is_read = false)              AS alert_pending
      FROM vendors v
      LEFT JOIN daily_score_records dsr
             ON dsr.vendor_id = v.id AND dsr.score_date = CURRENT_DATE
      WHERE v.lifecycle_status = 'ACTIVE'
    `);

    return {
      totalActive: Number(stats.total_active),
      notStarted: Number(stats.not_started),
      critical: Number(stats.critical),
      alertPending: Number(stats.alert_pending),
    };
  }

  async getAlerts(severity?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = ['a.is_read = false'];
    const params: unknown[] = [limit, offset];

    if (severity) {
      params.push(severity);
      conditions.push(`a.severity = $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const rows = await this.dataSource.query(
      `SELECT a.id, a.vendor_id, a.alert_type, a.severity, a.title, a.body,
              a.is_read, a.created_at,
              v.business_name AS vendor_name,
              dsr.score_current AS vendor_score
       FROM alerts a
       LEFT JOIN vendors v ON v.id = a.vendor_id
       LEFT JOIN daily_score_records dsr
              ON dsr.vendor_id = a.vendor_id AND dsr.score_date = CURRENT_DATE
       WHERE ${where}
       ORDER BY
         CASE a.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
         a.created_at DESC
       LIMIT $1 OFFSET $2`,
      params,
    );

    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*) FROM alerts WHERE is_read = false`,
    );

    return {
      data: rows.map((r: any) => ({
        id: r.id,
        vendorId: r.vendor_id,
        vendorName: r.vendor_name ?? '—',
        alertType: r.alert_type,
        severity: r.severity,
        title: r.title,
        body: r.body,
        vendorScore: r.vendor_score !== null ? Number(r.vendor_score) : null,
        createdAt: r.created_at,
      })),
      total: Number(count),
      page,
    };
  }

  async markAlertRead(alertId: string) {
    await this.dataSource.query(
      `UPDATE alerts SET is_read = true, read_at = NOW() WHERE id = $1`,
      [alertId],
    );
    return { ok: true };
  }

  async getSppgDetail(vendorId: string) {
    const [vendor] = await this.dataSource.query(
      `SELECT v.id, v.business_name, v.lifecycle_status,
              dsr.score_current, dsr.score_date
       FROM vendors v
       LEFT JOIN daily_score_records dsr
              ON dsr.vendor_id = v.id AND dsr.score_date = CURRENT_DATE
       WHERE v.id = $1`,
      [vendorId],
    );
    if (!vendor) return null;

    const history = await this.dataSource.query(
      `SELECT score_date, COALESCE(score_final, score_current) AS score
       FROM daily_score_records
       WHERE vendor_id = $1 AND score_date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY score_date ASC`,
      [vendorId],
    );

    const checkpoints = await this.dataSource.query(
      `SELECT cp_type, cp_status, completed_at
       FROM checkpoint_events
       WHERE vendor_id = $1 AND created_at::date = CURRENT_DATE
       ORDER BY cp_type`,
      [vendorId],
    );

    const recentAlerts = await this.dataSource.query(
      `SELECT id, severity, alert_type, title, created_at
       FROM alerts
       WHERE vendor_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [vendorId],
    );

    const [sppg] = await this.dataSource.query(
      `SELECT id, target_porsi, assigned_schools
       FROM sppg_locations
       WHERE vendor_id = $1 AND is_active = true
       LIMIT 1`,
      [vendorId],
    );

    return {
      vendorId: vendor.id,
      vendorName: vendor.business_name,
      lifecycleStatus: vendor.lifecycle_status,
      score: vendor.score_current !== null ? Number(vendor.score_current) : 100,
      scoreHistory: history.map((h: any) => ({
        date: h.score_date,
        score: Number(h.score),
      })),
      checkpoints: checkpoints.map((c: any) => ({
        cpType: c.cp_type,
        cpStatus: c.cp_status,
        completedAt: c.completed_at,
      })),
      recentAlerts: recentAlerts.map((a: any) => ({
        id: a.id,
        severity: a.severity,
        alertType: a.alert_type,
        title: a.title,
        createdAt: a.created_at,
      })),
      sppg: sppg
        ? {
            targetPorsi: sppg.target_porsi,
            assignedSchools: sppg.assigned_schools ?? [],
          }
        : null,
    };
  }

  async getDeliveries(date?: string, limit = 50) {
    const d = date ?? new Date().toISOString().split('T')[0];
    const rows = await this.dataSource.query(
      `SELECT dt.token, dt.status, dt.porsi_count,
              dt.generated_at, dt.expired_at,
              dt.arrived_at, dt.completed_at,
              dt.school_id,
              v.business_name AS vendor_name,
              ST_Y(dt.gps::geometry) AS gps_lat,
              ST_X(dt.gps::geometry) AS gps_lng,
              sc.confirmed_at AS school_confirmed_at,
              sc.kondisi AS school_kondisi
       FROM delivery_tokens dt
       JOIN vendors v ON v.id = dt.vendor_id
       LEFT JOIN school_confirmations sc ON sc.delivery_token_id = dt.id
       WHERE dt.generated_at::date = $1::date
       ORDER BY dt.generated_at DESC
       LIMIT $2`,
      [d, limit],
    );
    return rows.map((r: any) => ({
      token: r.token,
      status: r.status,
      vendorName: r.vendor_name,
      schoolId: r.school_id,
      porsiCount: Number(r.porsi_count),
      generatedAt: r.generated_at,
      expiredAt: r.expired_at,
      arrivedAt: r.arrived_at ?? null,
      completedAt: r.completed_at ?? null,
      schoolConfirmedAt: r.school_confirmed_at ?? null,
      schoolKondisi: r.school_kondisi ?? null,
      gpsLat: r.gps_lat ? Number(r.gps_lat) : null,
      gpsLng: r.gps_lng ? Number(r.gps_lng) : null,
    }));
  }

  async getReportStats() {
    const [compliance] = await this.dataSource.query(`
      SELECT
        COUNT(*) FILTER (WHERE dsr.score_current >= 80)        AS high_score,
        COUNT(*) FILTER (WHERE dsr.score_current BETWEEN 60 AND 79) AS mid_score,
        COUNT(*) FILTER (WHERE dsr.score_current < 60)         AS low_score,
        COUNT(*)                                               AS total_with_data,
        (SELECT COUNT(*) FROM vendors WHERE lifecycle_status = 'ACTIVE') AS total_active
      FROM daily_score_records dsr
      WHERE dsr.score_date = CURRENT_DATE
    `);

    const [cpStats] = await this.dataSource.query(`
      SELECT
        COUNT(*) FILTER (WHERE cp_status = 'done')   AS cp_done,
        COUNT(*)                                     AS cp_total,
        COUNT(*) FILTER (WHERE cp_type = 'CP3' AND cp_status = 'done') AS cp3_done
      FROM checkpoint_events
      WHERE created_at::date = CURRENT_DATE
    `);

    const totalActive = Number(compliance.total_active) || 1;
    const totalWithData = Number(compliance.total_with_data) || 0;
    const highScore = Number(compliance.high_score) || 0;
    const lowScore = Number(compliance.low_score) || 0;
    const cpDone = Number(cpStats.cp_done) || 0;
    const cpTotal = Number(cpStats.cp_total) || 1;

    const complianceRate = totalWithData > 0
      ? Math.round((highScore / totalWithData) * 100)
      : 0;

    const fraudPreventionRate = totalActive > 0
      ? Math.round(((totalActive - lowScore) / totalActive) * 100)
      : 100;

    const anomalies = await this.dataSource.query(`
      SELECT v.id, v.business_name, dsr.score_current,
             dsr.score_date,
             (SELECT se.reason FROM score_events se WHERE se.vendor_id = v.id
              ORDER BY se.created_at DESC LIMIT 1) AS last_reason
      FROM vendors v
      JOIN daily_score_records dsr
           ON dsr.vendor_id = v.id AND dsr.score_date = CURRENT_DATE
      WHERE v.lifecycle_status = 'ACTIVE' AND dsr.score_current < 80
      ORDER BY dsr.score_current ASC
      LIMIT 10
    `);

    return {
      complianceRate,
      fraudPreventionRate,
      stats: {
        highScore,
        midScore: Number(compliance.mid_score) || 0,
        lowScore,
        totalWithData,
        totalActive,
        cpDoneToday: cpDone,
        cpTotalToday: cpTotal,
        cp3DoneToday: Number(cpStats.cp3_done) || 0,
      },
      anomalies: anomalies.map((r: any) => ({
        vendorId: r.id,
        vendorName: r.business_name,
        score: Number(r.score_current),
        lastReason: r.last_reason ?? 'Tidak ada data',
      })),
    };
  }

  async getActiveVendors() {
    const rows = await this.dataSource.query(
      `SELECT v.id, v.business_name,
              COALESCE(dsr.score_current, 100) AS score_current,
              dsr.score_date,
              (SELECT COUNT(*) FROM checkpoint_events ce
               WHERE ce.vendor_id = v.id AND ce.cp_status = 'done'
               AND ce.created_at::date = CURRENT_DATE) AS cp_done
       FROM vendors v
       LEFT JOIN daily_score_records dsr
              ON dsr.vendor_id = v.id AND dsr.score_date = CURRENT_DATE
       WHERE v.lifecycle_status = 'ACTIVE'
       ORDER BY dsr.score_current ASC NULLS LAST
       LIMIT 50`,
    );

    return rows.map((r: any) => ({
      vendorId: r.id,
      vendorName: r.business_name,
      score: Number(r.score_current),
      cpDone: Number(r.cp_done),
      hasData: r.score_date !== null,
    }));
  }
}
