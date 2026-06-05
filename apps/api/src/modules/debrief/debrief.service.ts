import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { LlmService } from '../ai/llm.service';
import { ScoringService } from '../scoring/scoring.service';

export interface DebriefResult {
  id: string;
  vendorId: string;
  scoreDate: string;
  scoreFinal: number;
  narrativeGood: string;
  narrativeImprove: string;
  recommendations: string[];
  fundEstimate: number;
  auditHash: string;
  generatedAt: Date;
}

@Injectable()
export class DebriefService {
  private readonly logger = new Logger(DebriefService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly llmService: LlmService,
    private readonly scoringService: ScoringService,
  ) {}

  async getOrGenerate(vendorId: string, date: string): Promise<DebriefResult> {
    const [existing] = await this.dataSource.query(
      `SELECT * FROM daily_debriefs WHERE vendor_id = $1 AND score_date = $2`,
      [vendorId, date],
    );
    if (existing) return this.mapRow(existing);

    return this.generate(vendorId, date);
  }

  async generate(vendorId: string, date: string): Promise<DebriefResult> {
    const { score, record, events } = await this.scoringService.getCurrentScore(vendorId);
    const fundEstimate = await this.scoringService.getDisbursementEstimate(vendorId);

    const penaltyLines = events
      .filter(e => e.scoreDelta < 0)
      .map(e => `- ${e.eventType}: ${e.reason} (${e.scoreDelta})`)
      .join('\n') || '(tidak ada penalti)';

    const prompt = `Kamu adalah asisten evaluasi program MBG (Makan Bergizi Gratis).
Berikut ringkasan performa vendor hari ini (${date}):
- Skor akhir: ${score}/100
- Estimasi cair dana: Rp ${fundEstimate.toLocaleString('id-ID')}
- Penalti yang terjadi:
${penaltyLines}

Berikan evaluasi singkat dalam format JSON (tanpa markdown):
{
  "narrativeGood": "kalimat singkat tentang apa yang berjalan baik",
  "narrativeImprove": "kalimat singkat tentang yang perlu diperbaiki",
  "recommendations": ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3"]
}`;

    let narrativeGood = 'Operasional berjalan sesuai jadwal.';
    let narrativeImprove = 'Pertahankan konsistensi checkpoint harian.';
    let recommendations = ['Pastikan CP1 dimulai sebelum jam 10:00', 'Upload foto berkualitas baik', 'Koordinasi dengan kurir lebih awal'];

    try {
      const result = await this.llmService.generate(
        'Kamu adalah evaluator program MBG. Jawab selalu dalam bahasa Indonesia dengan format JSON yang diminta.',
        prompt,
        { feature: 'debrief_narrative', cacheKey: `debrief:${vendorId}:${date}`, cacheTtl: 3600 },
      );
      const parsed = JSON.parse(result.text);
      narrativeGood = parsed.narrativeGood ?? narrativeGood;
      narrativeImprove = parsed.narrativeImprove ?? narrativeImprove;
      recommendations = parsed.recommendations ?? recommendations;
    } catch (e) {
      this.logger.warn(`[debrief] LLM parse failed for ${vendorId}/${date}, using defaults`);
    }

    const auditPayload = JSON.stringify({ vendorId, date, scoreFinal: score, events: events.map(e => e.eventType) });
    const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    const [row] = await this.dataSource.query(
      `INSERT INTO daily_debriefs
         (vendor_id, score_date, score_final, narrative_good, narrative_improve, recommendations, fund_estimate, audit_hash)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
       ON CONFLICT (vendor_id, score_date) DO UPDATE
         SET score_final = $3, narrative_good = $4, narrative_improve = $5,
             recommendations = $6::jsonb, fund_estimate = $7, audit_hash = $8, generated_at = NOW()
       RETURNING *`,
      [vendorId, date, score, narrativeGood, narrativeImprove, JSON.stringify(recommendations), fundEstimate, auditHash],
    );

    this.logger.log(`[debrief] Generated for vendor=${vendorId} date=${date} score=${score}`);
    return this.mapRow(row);
  }

  async verifyHash(dataHash: string) {
    const [row] = await this.dataSource.query(
      `SELECT dd.*, v.business_name FROM daily_debriefs dd
       JOIN vendors v ON v.id = dd.vendor_id
       WHERE dd.audit_hash = $1`,
      [dataHash],
    );
    if (!row) throw new NotFoundException('Hash tidak ditemukan');
    return {
      valid: true,
      vendorName: row.business_name,
      date: row.score_date,
      scoreFinal: row.score_final,
      auditHash: row.audit_hash,
      generatedAt: row.generated_at,
    };
  }

  private mapRow(row: any): DebriefResult {
    return {
      id: row.id,
      vendorId: row.vendor_id,
      scoreDate: row.score_date,
      scoreFinal: row.score_final,
      narrativeGood: row.narrative_good,
      narrativeImprove: row.narrative_improve,
      recommendations: Array.isArray(row.recommendations) ? row.recommendations : JSON.parse(row.recommendations ?? '[]'),
      fundEstimate: Number(row.fund_estimate),
      auditHash: row.audit_hash,
      generatedAt: row.generated_at,
    };
  }
}
