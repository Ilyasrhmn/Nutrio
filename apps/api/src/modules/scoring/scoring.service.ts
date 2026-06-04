import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DailyScoreRecord } from './entities/daily-score-record.entity';
import { ScoreEvent } from './entities/score-event.entity';
import { PENALTY_TABLE, PenaltyEventType, BASE_DISBURSEMENT_RATE } from './penalty.constants';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    @InjectRepository(DailyScoreRecord)
    private readonly recordRepo: Repository<DailyScoreRecord>,
    @InjectRepository(ScoreEvent)
    private readonly eventRepo: Repository<ScoreEvent>,
    private readonly dataSource: DataSource,
    private readonly realtimeService: RealtimeService,
  ) {}

  static calculateNewScore(current: number, delta: number): number {
    return Math.min(100, Math.max(0, current + delta));
  }

  private todayString(): string {
    return new Date().toISOString().split('T')[0] ?? '';
  }

  async initializeDailyScore(vendorId: string): Promise<DailyScoreRecord> {
    const today = this.todayString();
    const existing = await this.recordRepo.findOne({ where: { vendorId, scoreDate: today } });
    if (existing) return existing;

    const record = this.recordRepo.create({ vendorId, scoreDate: today, scoreCurrent: 100 });
    return this.recordRepo.save(record);
  }

  async getOrInitRecord(vendorId: string): Promise<DailyScoreRecord> {
    const today = this.todayString();
    const record = await this.recordRepo.findOne({ where: { vendorId, scoreDate: today } });
    if (record) return record;
    return this.initializeDailyScore(vendorId);
  }

  async getCurrentScore(vendorId: string): Promise<{ score: number; record: DailyScoreRecord; events: ScoreEvent[] }> {
    const record = await this.getOrInitRecord(vendorId);
    const events = await this.eventRepo.find({
      where: { dailyScoreRecordId: record.id },
      order: { occurredAt: 'DESC' },
    });
    return { score: record.scoreCurrent, record, events };
  }

  async applyPenalty(
    vendorId: string,
    eventType: PenaltyEventType,
    context?: Record<string, unknown>,
  ): Promise<ScoreEvent> {
    const penalty = PENALTY_TABLE[eventType];
    const record = await this.getOrInitRecord(vendorId);

    const newScore = ScoringService.calculateNewScore(record.scoreCurrent, penalty.delta);
    await this.recordRepo.update(record.id, { scoreCurrent: newScore });

    const event = this.eventRepo.create({
      dailyScoreRecordId: record.id,
      eventType,
      scoreDelta: penalty.delta,
      reason: context?.reason ? String(context.reason) : penalty.reason,
      regulationRef: penalty.ref,
    });
    const saved = await this.eventRepo.save(event);

    this.logger.log(`[scoring] ${vendorId} ${eventType} ${penalty.delta} → score=${newScore}`);

    this.realtimeService.broadcastToVendor(vendorId, 'score:update', {
      score: newScore,
      delta: penalty.delta,
      eventType,
      reason: penalty.reason,
    });

    if (newScore < 60) {
      this.realtimeService.broadcastToBGN('score:critical', {
        vendorId,
        score: newScore,
        eventType,
      });
    }

    return saved;
  }

  async getDisbursementEstimate(vendorId: string): Promise<number> {
    const { score } = await this.getCurrentScore(vendorId);
    const [sppg] = await this.dataSource.query(
      `SELECT target_porsi FROM sppg_locations WHERE vendor_id = $1 AND is_active = true LIMIT 1`,
      [vendorId],
    );
    const targetPorsi: number = sppg?.target_porsi ?? 100;
    return Math.floor(targetPorsi * BASE_DISBURSEMENT_RATE * (score / 100));
  }

  async finalizeScore(vendorId: string): Promise<DailyScoreRecord> {
    const record = await this.getOrInitRecord(vendorId);
    await this.recordRepo.update(record.id, {
      scoreFinal: record.scoreCurrent,
      finalizedAt: new Date(),
    });
    return this.recordRepo.findOneOrFail({ where: { id: record.id } });
  }

  async getHistory(vendorId: string, days: number) {
    const rows = await this.dataSource.query(
      `SELECT
         r.score_date          AS date,
         COALESCE(r.score_final, r.score_current) AS score,
         COUNT(ce.id) FILTER (WHERE ce.cp_status = 'done') AS cp_done
       FROM daily_score_records r
       LEFT JOIN checkpoint_events ce
              ON ce.vendor_id = r.vendor_id
             AND ce.submitted_at::date = r.score_date::date
       WHERE r.vendor_id = $1
       GROUP BY r.score_date, r.score_final, r.score_current
       ORDER BY r.score_date DESC
       LIMIT $2`,
      [vendorId, days],
    );
    return rows.map((r: any) => ({
      date: r.date,
      score: Number(r.score),
      cpDone: Number(r.cp_done),
    }));
  }

  async getActiveVendorIds(): Promise<string[]> {
    const rows = await this.dataSource.query(
      `SELECT id FROM vendors WHERE lifecycle_status = 'ACTIVE'`,
    );
    return rows.map((r: { id: string }) => r.id);
  }

  async getVendorsWithNoCheckpointToday(): Promise<string[]> {
    const today = this.todayString();
    const rows = await this.dataSource.query(
      `SELECT v.id FROM vendors v
       WHERE v.lifecycle_status = 'ACTIVE'
       AND NOT EXISTS (
         SELECT 1 FROM checkpoint_events ce
         WHERE ce.vendor_id = v.id
           AND ce.cp_status = 'done'
           AND ce.created_at::date = $1::date
       )`,
      [today],
    );
    return rows.map((r: { id: string }) => r.id);
  }
}
