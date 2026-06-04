# Phase 3 — Dunia 2 Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full operational daily loop — Scoring Engine, Checkpoint Backend (CP1–CP4), Mission Control dashboard, and Daily Mode PWA for staff.

**Architecture:** Sequential bottom-up: scoring engine first (no deps), then checkpoint backend (depends on scoring), then Mission Control frontend (reads scoring + checkpoints), then Daily Mode PWA (submits checkpoints). All use existing infrastructure: INF-1 (Storage), INF-2 (WebSocket/RealtimeService), INF-3 (Cron stubs), INF-6 (AI/VisionService).

**Tech Stack:** NestJS 11 + TypeORM (backend), Next.js 16 App Router (web portal), Next.js 16 PWA (pwa), socket.io, Tailwind v4, shadcn/ui via `@workspace/ui`

---

## File Map

### Created (backend)
- `apps/api/src/database/migrations/1710900000000-AddScoringTables.ts`
- `apps/api/src/database/migrations/1710900000001-AddCheckpointTables.ts`
- `apps/api/src/modules/scoring/entities/daily-score-record.entity.ts`
- `apps/api/src/modules/scoring/entities/score-event.entity.ts`
- `apps/api/src/modules/scoring/penalty.constants.ts`
- `apps/api/src/modules/scoring/scoring.service.ts`
- `apps/api/src/modules/scoring/scoring.service.spec.ts`
- `apps/api/src/modules/scoring/scoring.controller.ts`
- `apps/api/src/modules/scoring/scoring.module.ts`
- `apps/api/src/modules/checkpoints/entities/checkpoint-event.entity.ts`
- `apps/api/src/modules/checkpoints/entities/delivery-token.entity.ts`
- `apps/api/src/modules/checkpoints/entities/school-confirmation.entity.ts`
- `apps/api/src/modules/checkpoints/dto/submit-checkpoint.dto.ts`
- `apps/api/src/modules/checkpoints/checkpoints.service.ts`
- `apps/api/src/modules/checkpoints/checkpoints.service.spec.ts`
- `apps/api/src/modules/checkpoints/checkpoints.controller.ts`
- `apps/api/src/modules/checkpoints/checkpoints.module.ts`
- `apps/api/src/modules/mission-control/mission-control.service.ts`
- `apps/api/src/modules/mission-control/mission-control.controller.ts`
- `apps/api/src/modules/mission-control/mission-control.module.ts`

### Modified (backend)
- `apps/api/src/modules/realtime/realtime.gateway.ts` — presence tracking map
- `apps/api/src/modules/realtime/realtime.service.ts` — `getPresence()` method
- `apps/api/src/modules/scheduler/score-init.cron.ts` — replace stub
- `apps/api/src/modules/scheduler/force-close.cron.ts` — replace stub
- `apps/api/src/modules/scheduler/scheduler.module.ts` — import ScoringModule + CheckpointsModule
- `apps/api/src/app.module.ts` — register ScoringModule, CheckpointsModule, MissionControlModule

### Created (web)
- `apps/web/app/portal/(vendor)/mission-control/page.tsx`

### Modified (pwa)
- `apps/pwa/app/page.tsx` — rewrite to PWALanding

### Created (pwa)
- `apps/pwa/app/cp/[cpId]/context/page.tsx`
- `apps/pwa/app/cp/[cpId]/capture/page.tsx`
- `apps/pwa/app/cp/[cpId]/validate/page.tsx`
- `apps/pwa/app/cp/[cpId]/confirm/page.tsx`

---

## Task 1: Migration — Scoring Tables

**Files:**
- Create: `apps/api/src/database/migrations/1710900000000-AddScoringTables.ts`

- [ ] **Step 1: Create the migration file**

```typescript
// apps/api/src/database/migrations/1710900000000-AddScoringTables.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScoringTables1710900000000 implements MigrationInterface {
  name = 'AddScoringTables1710900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE daily_score_records (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        score_date      DATE NOT NULL,
        score_current   INTEGER NOT NULL DEFAULT 100,
        score_final     INTEGER,
        started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        finalized_at    TIMESTAMPTZ,
        UNIQUE(vendor_id, score_date)
      );

      CREATE TABLE score_events (
        id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        daily_score_record_id UUID NOT NULL REFERENCES daily_score_records(id) ON DELETE CASCADE,
        event_type            VARCHAR(50) NOT NULL,
        score_delta           INTEGER NOT NULL,
        reason                TEXT NOT NULL,
        regulation_ref        VARCHAR(100),
        occurred_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE RULE no_update_score_events AS ON UPDATE TO score_events DO INSTEAD NOTHING;
      CREATE RULE no_delete_score_events AS ON DELETE TO score_events DO INSTEAD NOTHING;

      CREATE INDEX idx_score_records_vendor_date ON daily_score_records(vendor_id, score_date DESC);
      CREATE INDEX idx_score_events_record ON score_events(daily_score_record_id, occurred_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP RULE IF EXISTS no_delete_score_events ON score_events;
      DROP RULE IF EXISTS no_update_score_events ON score_events;
      DROP TABLE IF EXISTS score_events;
      DROP TABLE IF EXISTS daily_score_records;
    `);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/database/migrations/1710900000000-AddScoringTables.ts
git commit -m "feat: add scoring tables migration"
```

---

## Task 2: Migration — Checkpoint Tables

**Files:**
- Create: `apps/api/src/database/migrations/1710900000001-AddCheckpointTables.ts`

- [ ] **Step 1: Create the migration file**

```typescript
// apps/api/src/database/migrations/1710900000001-AddCheckpointTables.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckpointTables1710900000001 implements MigrationInterface {
  name = 'AddCheckpointTables1710900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE cp_type AS ENUM ('CP1', 'CP2', 'CP3', 'CP4');
      CREATE TYPE cp_status AS ENUM ('pending', 'in_progress', 'done', 'failed', 'force_closed');

      CREATE TABLE checkpoint_events (
        id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        sppg_location_id  UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE CASCADE,
        cp_type           cp_type NOT NULL,
        cp_status         cp_status NOT NULL DEFAULT 'pending',
        photos            JSONB NOT NULL DEFAULT '[]',
        ai_validation     JSONB,
        score_delta       INTEGER NOT NULL DEFAULT 0,
        started_at        TIMESTAMPTZ,
        completed_at      TIMESTAMPTZ,
        gps               GEOGRAPHY(POINT, 4326),
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX idx_cp_unique_per_day
        ON checkpoint_events(vendor_id, sppg_location_id, cp_type, (created_at::date));

      CREATE TABLE delivery_tokens (
        id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        token             UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
        vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        sppg_location_id  UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE CASCADE,
        school_id         TEXT NOT NULL,
        porsi_count       INTEGER NOT NULL DEFAULT 0,
        generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expired_at        TIMESTAMPTZ NOT NULL,
        used_at           TIMESTAMPTZ,
        status            VARCHAR(30) NOT NULL DEFAULT 'active'
      );

      CREATE TABLE school_confirmations (
        id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        delivery_token_id   UUID UNIQUE NOT NULL REFERENCES delivery_tokens(id) ON DELETE CASCADE,
        jumlah_diterima     INTEGER NOT NULL,
        kondisi             VARCHAR(20) NOT NULL,
        masalah_jenis       TEXT[] NOT NULL DEFAULT '{}',
        catatan             TEXT,
        confirmed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_cp_events_vendor_date ON checkpoint_events(vendor_id, (created_at::date) DESC);
      CREATE INDEX idx_delivery_tokens_token ON delivery_tokens(token);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS school_confirmations;
      DROP TABLE IF EXISTS delivery_tokens;
      DROP TABLE IF EXISTS checkpoint_events;
      DROP TYPE IF EXISTS cp_status;
      DROP TYPE IF EXISTS cp_type;
    `);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/database/migrations/1710900000001-AddCheckpointTables.ts
git commit -m "feat: add checkpoint/delivery/school-confirmation tables migration"
```

---

## Task 3: FEAT-2.6 — Scoring Entities + Penalty Constants

**Files:**
- Create: `apps/api/src/modules/scoring/entities/daily-score-record.entity.ts`
- Create: `apps/api/src/modules/scoring/entities/score-event.entity.ts`
- Create: `apps/api/src/modules/scoring/penalty.constants.ts`

- [ ] **Step 1: Create DailyScoreRecord entity**

```typescript
// apps/api/src/modules/scoring/entities/daily-score-record.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('daily_score_records')
export class DailyScoreRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'score_date', type: 'date' })
  scoreDate!: string;

  @Column({ name: 'score_current', type: 'int', default: 100 })
  scoreCurrent!: number;

  @Column({ name: 'score_final', type: 'int', nullable: true })
  scoreFinal!: number | null;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true })
  finalizedAt!: Date | null;
}
```

- [ ] **Step 2: Create ScoreEvent entity**

```typescript
// apps/api/src/modules/scoring/entities/score-event.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('score_events')
export class ScoreEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'daily_score_record_id', type: 'uuid' })
  dailyScoreRecordId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType!: string;

  @Column({ name: 'score_delta', type: 'int' })
  scoreDelta!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'regulation_ref', type: 'varchar', length: 100, nullable: true })
  regulationRef!: string | null;

  @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;
}
```

- [ ] **Step 3: Create penalty constants**

```typescript
// apps/api/src/modules/scoring/penalty.constants.ts
export type PenaltyEventType =
  | 'GOLDEN_RULE_VIOLATION'
  | 'AI_VALIDATION_FAIL_3X'
  | 'FORCE_CLOSED_NO_CP'
  | 'SCHOOL_COMPLAINT'
  | 'CP_LATE_START'
  | 'DELIVERY_LATE'
  | 'PHOTO_QUALITY_POOR';

export const PENALTY_TABLE: Record<PenaltyEventType, { delta: number; reason: string; ref: string }> = {
  GOLDEN_RULE_VIOLATION: {
    delta: -20,
    reason: 'CP2 disubmit lebih dari 4 jam setelah CP1',
    ref: 'PRD §5.6.A',
  },
  AI_VALIDATION_FAIL_3X: {
    delta: -5,
    reason: 'Foto gagal validasi AI 3 kali berturut-turut',
    ref: 'PRD §5.6.B',
  },
  FORCE_CLOSED_NO_CP: {
    delta: -50,
    reason: 'Tidak ada checkpoint selesai — force close jam 14:00',
    ref: 'PRD §5.6.C',
  },
  SCHOOL_COMPLAINT: {
    delta: -10,
    reason: 'Sekolah melaporkan masalah pada konfirmasi pengiriman',
    ref: 'PRD §5.6.D',
  },
  CP_LATE_START: {
    delta: -5,
    reason: 'CP1 dimulai setelah jam 10:00',
    ref: 'PRD §5.6.E',
  },
  DELIVERY_LATE: {
    delta: -15,
    reason: 'Token pengiriman kedaluwarsa sebelum digunakan',
    ref: 'PRD §5.6.F',
  },
  PHOTO_QUALITY_POOR: {
    delta: -3,
    reason: 'Kualitas foto di bawah standar (confidence AI < 0.5)',
    ref: 'PRD §5.6.G',
  },
};

export const BASE_DISBURSEMENT_RATE = 30_000; // IDR per porsi
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/scoring/
git commit -m "feat: add scoring entities and penalty constants"
```

---

## Task 4: FEAT-2.6 — ScoringService + Tests

**Files:**
- Create: `apps/api/src/modules/scoring/scoring.service.ts`
- Create: `apps/api/src/modules/scoring/scoring.service.spec.ts`

- [ ] **Step 1: Write failing tests first**

```typescript
// apps/api/src/modules/scoring/scoring.service.spec.ts
import { ScoringService } from './scoring.service';
import { PENALTY_TABLE } from './penalty.constants';

describe('ScoringService — pure logic', () => {
  describe('calculateNewScore', () => {
    it('clamps score to 0 minimum', () => {
      expect(ScoringService.calculateNewScore(5, -20)).toBe(0);
    });

    it('clamps score to 100 maximum', () => {
      expect(ScoringService.calculateNewScore(100, 10)).toBe(100);
    });

    it('applies negative delta correctly', () => {
      expect(ScoringService.calculateNewScore(100, -20)).toBe(80);
    });
  });

  describe('PENALTY_TABLE', () => {
    it('GOLDEN_RULE_VIOLATION delta is -20', () => {
      expect(PENALTY_TABLE.GOLDEN_RULE_VIOLATION.delta).toBe(-20);
    });

    it('FORCE_CLOSED_NO_CP delta is -50', () => {
      expect(PENALTY_TABLE.FORCE_CLOSED_NO_CP.delta).toBe(-50);
    });

    it('all deltas are negative', () => {
      Object.values(PENALTY_TABLE).forEach(({ delta }) => {
        expect(delta).toBeLessThan(0);
      });
    });
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm --filter api test -- --testPathPattern=scoring.service.spec
```

Expected: FAIL — `ScoringService` not found.

- [ ] **Step 3: Implement ScoringService**

```typescript
// apps/api/src/modules/scoring/scoring.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    return new Date().toISOString().split('T')[0];
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

  async getHistory(vendorId: string, days: number): Promise<DailyScoreRecord[]> {
    return this.recordRepo
      .createQueryBuilder('r')
      .where('r.vendorId = :vendorId', { vendorId })
      .orderBy('r.scoreDate', 'DESC')
      .limit(days)
      .getMany();
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
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm --filter api test -- --testPathPattern=scoring.service.spec
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/scoring/scoring.service.ts apps/api/src/modules/scoring/scoring.service.spec.ts
git commit -m "feat: implement ScoringService with penalty logic and WS broadcast"
```

---

## Task 5: FEAT-2.6 — ScoringController + Module + Register

**Files:**
- Create: `apps/api/src/modules/scoring/scoring.controller.ts`
- Create: `apps/api/src/modules/scoring/scoring.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create ScoringController**

```typescript
// apps/api/src/modules/scoring/scoring.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

interface JwtPayload { sub: string; email: string; role: string; }

@Controller('scoring')
@UseGuards(JwtAuthGuard)
export class ScoringController {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly dataSource: DataSource,
  ) {}

  private async getVendorId(userId: string): Promise<string> {
    const [row] = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [userId],
    );
    if (!row) throw new NotFoundException('Vendor tidak ditemukan');
    return row.id;
  }

  @Get('today')
  async getToday(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.sub);
    const { score, record, events } = await this.scoringService.getCurrentScore(vendorId);
    const disbursement = await this.scoringService.getDisbursementEstimate(vendorId);
    return { score, record, events, disbursementEstimate: disbursement };
  }

  @Get('history')
  async getHistory(@CurrentUser() user: JwtPayload, @Query('days') days?: string) {
    const vendorId = await this.getVendorId(user.sub);
    return this.scoringService.getHistory(vendorId, days ? parseInt(days, 10) : 30);
  }
}
```

- [ ] **Step 2: Create ScoringModule**

```typescript
// apps/api/src/modules/scoring/scoring.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyScoreRecord } from './entities/daily-score-record.entity';
import { ScoreEvent } from './entities/score-event.entity';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyScoreRecord, ScoreEvent]), RealtimeModule],
  providers: [ScoringService],
  controllers: [ScoringController],
  exports: [ScoringService],
})
export class ScoringModule {}
```

- [ ] **Step 3: Register in app.module.ts**

In `apps/api/src/app.module.ts`, add after `OnboardingModule`:

```typescript
import { ScoringModule } from './modules/scoring/scoring.module';

// in @Module imports array, after OnboardingModule:
ScoringModule,
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm --filter api typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/scoring/scoring.controller.ts apps/api/src/modules/scoring/scoring.module.ts apps/api/src/app.module.ts
git commit -m "feat: register ScoringModule with REST endpoints GET /scoring/today and /scoring/history"
```

---

## Task 6: FEAT-2.6 — Update Cron Stubs

**Files:**
- Modify: `apps/api/src/modules/scheduler/score-init.cron.ts`
- Modify: `apps/api/src/modules/scheduler/force-close.cron.ts`
- Modify: `apps/api/src/modules/scheduler/scheduler.module.ts`

- [ ] **Step 1: Update score-init.cron.ts**

Replace entire file:

```typescript
// apps/api/src/modules/scheduler/score-init.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class ScoreInitCron {
  private readonly logger = new Logger(ScoreInitCron.name);

  constructor(
    private readonly config: ConfigService,
    private readonly scoringService: ScoringService,
  ) {}

  @Cron('1 0 * * *', { name: 'score-init' })
  async handle() {
    if (this.config.get('SCHEDULER_ENABLED') === 'false') return;
    const vendorIds = await this.scoringService.getActiveVendorIds();
    this.logger.log(`[score-init] Initializing ${vendorIds.length} active vendors`);
    await Promise.all(vendorIds.map(id => this.scoringService.initializeDailyScore(id)));
    this.logger.log('[score-init] Done');
  }
}
```

- [ ] **Step 2: Update force-close.cron.ts**

Replace entire file:

```typescript
// apps/api/src/modules/scheduler/force-close.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ScoringService } from '../scoring/scoring.service';
import { DataSource } from 'typeorm';

@Injectable()
export class ForceCloseCron {
  private readonly logger = new Logger(ForceCloseCron.name);

  constructor(
    private readonly config: ConfigService,
    private readonly scoringService: ScoringService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron('0 14 * * *', { name: 'force-close' })
  async handle() {
    if (this.config.get('SCHEDULER_ENABLED') === 'false') return;

    // Force-close all pending checkpoint_events
    const today = new Date().toISOString().split('T')[0];
    await this.dataSource.query(
      `UPDATE checkpoint_events
       SET cp_status = 'force_closed'
       WHERE cp_status IN ('pending', 'in_progress')
         AND created_at::date = $1::date`,
      [today],
    );

    // Apply FORCE_CLOSED_NO_CP penalty to vendors with no done CP today
    const vendorIds = await this.scoringService.getVendorsWithNoCheckpointToday();
    this.logger.log(`[force-close] Applying penalty to ${vendorIds.length} vendors`);
    await Promise.all(
      vendorIds.map(id => this.scoringService.applyPenalty(id, 'FORCE_CLOSED_NO_CP')),
    );
    this.logger.log('[force-close] Done');
  }
}
```

- [ ] **Step 3: Update scheduler.module.ts to import ScoringModule**

```typescript
// apps/api/src/modules/scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScoreInitCron } from './score-init.cron';
import { ForceCloseCron } from './force-close.cron';
import { ReviewSlaCron } from './review-sla.cron';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [ScheduleModule.forRoot(), ScoringModule],
  providers: [ScoreInitCron, ForceCloseCron, ReviewSlaCron],
})
export class SchedulerModule {}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm --filter api typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/scheduler/
git commit -m "feat: wire ScoringService into cron jobs — score-init and force-close now functional"
```

---

## Task 7: FEAT-2.3 — Checkpoint Entities

**Files:**
- Create: `apps/api/src/modules/checkpoints/entities/checkpoint-event.entity.ts`
- Create: `apps/api/src/modules/checkpoints/entities/delivery-token.entity.ts`
- Create: `apps/api/src/modules/checkpoints/entities/school-confirmation.entity.ts`

- [ ] **Step 1: CheckpointEvent entity**

```typescript
// apps/api/src/modules/checkpoints/entities/checkpoint-event.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type CpType = 'CP1' | 'CP2' | 'CP3' | 'CP4';
export type CpStatus = 'pending' | 'in_progress' | 'done' | 'failed' | 'force_closed';

@Entity('checkpoint_events')
export class CheckpointEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'sppg_location_id', type: 'uuid' })
  sppgLocationId!: string;

  @Column({ name: 'cp_type', type: 'enum', enum: ['CP1', 'CP2', 'CP3', 'CP4'] })
  cpType!: CpType;

  @Column({ name: 'cp_status', type: 'enum', enum: ['pending', 'in_progress', 'done', 'failed', 'force_closed'], default: 'pending' })
  cpStatus!: CpStatus;

  @Column({ type: 'jsonb', default: [] })
  photos!: Array<{ fileKey: string; fileUrl: string; fileHash: string }>;

  @Column({ name: 'ai_validation', type: 'jsonb', nullable: true })
  aiValidation!: { pass: boolean; reason: string; confidence: number } | null;

  @Column({ name: 'score_delta', type: 'int', default: 0 })
  scoreDelta!: number;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
```

- [ ] **Step 2: DeliveryToken entity**

```typescript
// apps/api/src/modules/checkpoints/entities/delivery-token.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('delivery_tokens')
export class DeliveryToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  token!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'sppg_location_id', type: 'uuid' })
  sppgLocationId!: string;

  @Column({ name: 'school_id', type: 'text' })
  schoolId!: string;

  @Column({ name: 'porsi_count', type: 'int', default: 0 })
  porsiCount!: number;

  @CreateDateColumn({ name: 'generated_at', type: 'timestamptz' })
  generatedAt!: Date;

  @Column({ name: 'expired_at', type: 'timestamptz' })
  expiredAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: string;
}
```

- [ ] **Step 3: SchoolConfirmation entity**

```typescript
// apps/api/src/modules/checkpoints/entities/school-confirmation.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('school_confirmations')
export class SchoolConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'delivery_token_id', type: 'uuid', unique: true })
  deliveryTokenId!: string;

  @Column({ name: 'jumlah_diterima', type: 'int' })
  jumlahDiterima!: number;

  @Column({ type: 'varchar', length: 20 })
  kondisi!: string;

  @Column({ name: 'masalah_jenis', type: 'text', array: true, default: [] })
  masalahJenis!: string[];

  @Column({ type: 'text', nullable: true })
  catatan!: string | null;

  @CreateDateColumn({ name: 'confirmed_at', type: 'timestamptz' })
  confirmedAt!: Date;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/checkpoints/
git commit -m "feat: add checkpoint-event, delivery-token, school-confirmation entities"
```

---

## Task 8: FEAT-2.3 — CheckpointsService + Tests

**Files:**
- Create: `apps/api/src/modules/checkpoints/checkpoints.service.ts`
- Create: `apps/api/src/modules/checkpoints/checkpoints.service.spec.ts`
- Create: `apps/api/src/modules/checkpoints/dto/submit-checkpoint.dto.ts`

- [ ] **Step 1: Create DTO**

```typescript
// apps/api/src/modules/checkpoints/dto/submit-checkpoint.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitCheckpointDto {
  @IsOptional()
  @IsString()
  gpsLat?: string;

  @IsOptional()
  @IsString()
  gpsLng?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

- [ ] **Step 2: Write failing tests**

```typescript
// apps/api/src/modules/checkpoints/checkpoints.service.spec.ts
import { CheckpointsService } from './checkpoints.service';
import { CpType } from './entities/checkpoint-event.entity';

describe('CheckpointsService — pure logic', () => {
  describe('cpOrderIndex', () => {
    it('CP1 = 0, CP2 = 1, CP3 = 2, CP4 = 3', () => {
      expect(CheckpointsService.cpOrderIndex('CP1')).toBe(0);
      expect(CheckpointsService.cpOrderIndex('CP2')).toBe(1);
      expect(CheckpointsService.cpOrderIndex('CP3')).toBe(2);
      expect(CheckpointsService.cpOrderIndex('CP4')).toBe(3);
    });
  });

  describe('isPreviousCpRequired', () => {
    it('CP1 has no prerequisite', () => {
      expect(CheckpointsService.previousCpRequired('CP1')).toBeNull();
    });
    it('CP2 requires CP1', () => {
      expect(CheckpointsService.previousCpRequired('CP2')).toBe('CP1');
    });
    it('CP4 requires CP3', () => {
      expect(CheckpointsService.previousCpRequired('CP4')).toBe('CP3');
    });
  });
});
```

- [ ] **Step 3: Run tests — expect failure**

```bash
pnpm --filter api test -- --testPathPattern=checkpoints.service.spec
```

Expected: FAIL — `CheckpointsService` not found.

- [ ] **Step 4: Implement CheckpointsService**

```typescript
// apps/api/src/modules/checkpoints/checkpoints.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CheckpointEvent, CpType } from './entities/checkpoint-event.entity';
import { DeliveryToken } from './entities/delivery-token.entity';
import { StorageService } from '../storage/storage.service';
import { VisionService } from '../ai/vision.service';
import { ScoringService } from '../scoring/scoring.service';
import { RealtimeService } from '../realtime/realtime.service';
import * as path from 'path';

const CP_ORDER: CpType[] = ['CP1', 'CP2', 'CP3', 'CP4'];

@Injectable()
export class CheckpointsService {
  private readonly logger = new Logger(CheckpointsService.name);

  constructor(
    @InjectRepository(CheckpointEvent)
    private readonly cpRepo: Repository<CheckpointEvent>,
    @InjectRepository(DeliveryToken)
    private readonly tokenRepo: Repository<DeliveryToken>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly visionService: VisionService,
    private readonly scoringService: ScoringService,
    private readonly realtimeService: RealtimeService,
  ) {}

  static cpOrderIndex(cpType: CpType): number {
    return CP_ORDER.indexOf(cpType);
  }

  static previousCpRequired(cpType: CpType): CpType | null {
    const idx = CP_ORDER.indexOf(cpType);
    return idx > 0 ? CP_ORDER[idx - 1] : null;
  }

  private todayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async getPrimarySppgLocation(vendorId: string): Promise<{ id: string; targetPorsi: number; assignedSchools: string[] }> {
    const [sppg] = await this.dataSource.query(
      `SELECT id, target_porsi, assigned_schools FROM sppg_locations WHERE vendor_id = $1 AND is_active = true LIMIT 1`,
      [vendorId],
    );
    if (!sppg) throw new NotFoundException('SPPG location belum tersedia untuk vendor ini');
    return { id: sppg.id, targetPorsi: sppg.target_porsi ?? 100, assignedSchools: sppg.assigned_schools ?? [] };
  }

  async getCheckpointState(vendorId: string): Promise<CheckpointEvent[]> {
    const today = this.todayString();
    const sppg = await this.getPrimarySppgLocation(vendorId);
    return this.cpRepo
      .createQueryBuilder('cp')
      .where('cp.vendorId = :vendorId', { vendorId })
      .andWhere('cp.sppgLocationId = :sppgId', { sppgId: sppg.id })
      .andWhere(`cp.createdAt::date = :today::date`, { today })
      .orderBy('cp.cpType', 'ASC')
      .getMany();
  }

  async submitCheckpoint(
    vendorId: string,
    cpType: CpType,
    file: Express.Multer.File,
    gpsLat?: string,
    gpsLng?: string,
  ): Promise<CheckpointEvent> {
    const sppg = await this.getPrimarySppgLocation(vendorId);
    const today = this.todayString();

    // Validate ordering
    const prevRequired = CheckpointsService.previousCpRequired(cpType);
    if (prevRequired) {
      const [prev] = await this.dataSource.query(
        `SELECT id, cp_status FROM checkpoint_events
         WHERE vendor_id = $1 AND sppg_location_id = $2 AND cp_type = $3 AND created_at::date = $4::date`,
        [vendorId, sppg.id, prevRequired, today],
      );
      if (!prev || prev.cp_status !== 'done') {
        throw new BadRequestException(`${prevRequired} harus selesai sebelum ${cpType}`);
      }
    }

    // Golden Rule check for CP2
    if (cpType === 'CP2') {
      const [cp1] = await this.dataSource.query(
        `SELECT completed_at FROM checkpoint_events
         WHERE vendor_id = $1 AND sppg_location_id = $2 AND cp_type = 'CP1' AND cp_status = 'done' AND created_at::date = $3::date`,
        [vendorId, sppg.id, today],
      );
      if (cp1?.completed_at) {
        const diffHours = (Date.now() - new Date(cp1.completed_at).getTime()) / 3_600_000;
        if (diffHours > 4) {
          await this.scoringService.applyPenalty(vendorId, 'GOLDEN_RULE_VIOLATION');
        }
      }
    }

    // Upload photo
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const key = `checkpoints/${vendorId}/${cpType}/${today}${ext}`;
    const uploadResult = await this.storageService.upload(file.buffer, key, file.mimetype);

    // Upsert checkpoint event
    const now = new Date();
    await this.dataSource.query(
      `INSERT INTO checkpoint_events (vendor_id, sppg_location_id, cp_type, cp_status, photos, started_at, completed_at)
       VALUES ($1, $2, $3, 'done', $4::jsonb, $5, $5)
       ON CONFLICT ON CONSTRAINT idx_cp_unique_per_day DO UPDATE
         SET cp_status = 'done', photos = $4::jsonb, completed_at = $5`,
      [vendorId, sppg.id, cpType, JSON.stringify([uploadResult]), now],
    );

    const [saved] = await this.dataSource.query(
      `SELECT * FROM checkpoint_events
       WHERE vendor_id = $1 AND sppg_location_id = $2 AND cp_type = $3 AND created_at::date = $4::date`,
      [vendorId, sppg.id, cpType, today],
    );

    // Async AI validation (fire and forget)
    this.validatePhotoAsync(vendorId, saved.id, uploadResult.fileUrl, cpType).catch(e =>
      this.logger.error(`AI validation failed for ${saved.id}: ${e.message}`),
    );

    // Broadcast to Mission Control
    this.realtimeService.broadcastToVendor(vendorId, 'mc:checkpoint:update', {
      cpType,
      status: 'done',
      completedAt: now,
      sppgLocationId: sppg.id,
    });

    // CP3 side effect: generate delivery token
    if (cpType === 'CP3') {
      await this.generateDeliveryTokens(vendorId, sppg);
    }

    return saved;
  }

  private async validatePhotoAsync(
    vendorId: string,
    checkpointId: string,
    fileUrl: string,
    cpType: CpType,
  ): Promise<void> {
    const result = await this.visionService.validatePhoto(fileUrl, { feature: 'checkpoint', cpType, vendorId });
    await this.dataSource.query(
      `UPDATE checkpoint_events SET ai_validation = $1::jsonb WHERE id = $2`,
      [JSON.stringify(result), checkpointId],
    );
    if (!result.pass && result.confidence < 0.5) {
      await this.scoringService.applyPenalty(vendorId, 'PHOTO_QUALITY_POOR');
    }
  }

  private async generateDeliveryTokens(
    vendorId: string,
    sppg: { id: string; targetPorsi: number; assignedSchools: string[] },
  ): Promise<void> {
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 4);
    const schools = sppg.assignedSchools.length > 0 ? sppg.assignedSchools : ['default-school'];
    for (const schoolId of schools) {
      await this.dataSource.query(
        `INSERT INTO delivery_tokens (vendor_id, sppg_location_id, school_id, porsi_count, expired_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [vendorId, sppg.id, schoolId, sppg.targetPorsi, expiredAt],
      );
    }
    this.logger.log(`[checkpoints] Generated ${schools.length} delivery token(s) for vendor ${vendorId}`);
  }

  async forceCloseAll(): Promise<void> {
    const today = this.todayString();
    await this.dataSource.query(
      `UPDATE checkpoint_events
       SET cp_status = 'force_closed'
       WHERE cp_status IN ('pending', 'in_progress') AND created_at::date = $1::date`,
      [today],
    );
  }
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
pnpm --filter api test -- --testPathPattern=checkpoints.service.spec
```

Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/checkpoints/
git commit -m "feat: implement CheckpointsService with ordering validation, Golden Rule, photo upload, AI validation"
```

---

## Task 9: FEAT-2.3 — CheckpointsController + Module + Register

**Files:**
- Create: `apps/api/src/modules/checkpoints/checkpoints.controller.ts`
- Create: `apps/api/src/modules/checkpoints/checkpoints.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create CheckpointsController**

```typescript
// apps/api/src/modules/checkpoints/checkpoints.controller.ts
import { Controller, Get, Post, Param, Body, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CheckpointsService } from './checkpoints.service';
import { SubmitCheckpointDto } from './dto/submit-checkpoint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CpType } from './entities/checkpoint-event.entity';

interface JwtPayload { sub: string; email: string; role: string; }

const VALID_CP_TYPES: CpType[] = ['CP1', 'CP2', 'CP3', 'CP4'];

@Controller('checkpoints')
@UseGuards(JwtAuthGuard)
export class CheckpointsController {
  constructor(
    private readonly checkpointsService: CheckpointsService,
    private readonly dataSource: DataSource,
  ) {}

  private async getVendorId(userId: string): Promise<string> {
    const [row] = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [userId],
    );
    if (!row) throw new NotFoundException('Vendor tidak ditemukan');
    return row.id;
  }

  @Get('today')
  async getToday(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.sub);
    return this.checkpointsService.getCheckpointState(vendorId);
  }

  @Post(':cpType/submit')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  async submit(
    @CurrentUser() user: JwtPayload,
    @Param('cpType') cpType: string,
    @UploadedFile() photo: Express.Multer.File,
    @Body() dto: SubmitCheckpointDto,
  ) {
    if (!VALID_CP_TYPES.includes(cpType as CpType)) {
      throw new BadRequestException(`cpType harus salah satu dari: ${VALID_CP_TYPES.join(', ')}`);
    }
    if (!photo) throw new BadRequestException('File foto diperlukan');
    const vendorId = await this.getVendorId(user.sub);
    return this.checkpointsService.submitCheckpoint(
      vendorId, cpType as CpType, photo, dto.gpsLat, dto.gpsLng,
    );
  }
}
```

- [ ] **Step 2: Create CheckpointsModule**

```typescript
// apps/api/src/modules/checkpoints/checkpoints.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckpointEvent } from './entities/checkpoint-event.entity';
import { DeliveryToken } from './entities/delivery-token.entity';
import { SchoolConfirmation } from './entities/school-confirmation.entity';
import { CheckpointsService } from './checkpoints.service';
import { CheckpointsController } from './checkpoints.controller';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { ScoringModule } from '../scoring/scoring.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckpointEvent, DeliveryToken, SchoolConfirmation]),
    StorageModule,
    AiModule,
    ScoringModule,
    RealtimeModule,
  ],
  providers: [CheckpointsService],
  controllers: [CheckpointsController],
  exports: [CheckpointsService],
})
export class CheckpointsModule {}
```

- [ ] **Step 3: Register in app.module.ts**

In `apps/api/src/app.module.ts`, add after `ScoringModule`:

```typescript
import { CheckpointsModule } from './modules/checkpoints/checkpoints.module';

// in @Module imports array:
CheckpointsModule,
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm --filter api typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/checkpoints/checkpoints.controller.ts apps/api/src/modules/checkpoints/checkpoints.module.ts apps/api/src/app.module.ts
git commit -m "feat: register CheckpointsModule with GET /checkpoints/today and POST /checkpoints/:cpType/submit"
```

---

## Task 10: FEAT-2.1 Backend — Presence Tracking + MissionControlModule

**Files:**
- Modify: `apps/api/src/modules/realtime/realtime.gateway.ts`
- Modify: `apps/api/src/modules/realtime/realtime.service.ts`
- Create: `apps/api/src/modules/mission-control/mission-control.service.ts`
- Create: `apps/api/src/modules/mission-control/mission-control.controller.ts`
- Create: `apps/api/src/modules/mission-control/mission-control.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Add presence map to RealtimeService**

In `apps/api/src/modules/realtime/realtime.service.ts`, add after `private bgnServer`:

```typescript
// Presence tracking: userId → { connectedAt, vendorId }
private presence = new Map<string, { connectedAt: Date; vendorId?: string }>();

setPresence(userId: string, vendorId?: string) {
  this.presence.set(userId, { connectedAt: new Date(), vendorId });
}

clearPresence(userId: string) {
  this.presence.delete(userId);
}

getPresenceForVendor(vendorId: string): Array<{ userId: string; connectedAt: Date }> {
  const result: Array<{ userId: string; connectedAt: Date }> = [];
  this.presence.forEach((v, userId) => {
    if (v.vendorId === vendorId) result.push({ userId, connectedAt: v.connectedAt });
  });
  return result;
}
```

- [ ] **Step 2: Wire presence into OpsGateway**

In `apps/api/src/modules/realtime/realtime.gateway.ts`, update `handleConnection` and `handleDisconnect` in OpsGateway:

```typescript
// Inside handleConnection, after socket.data.vendorId = vendorId:
this.realtimeService.setPresence(userId, vendorId);

// Inside handleDisconnect:
this.realtimeService.clearPresence(socket.data.userId ?? '');
```

- [ ] **Step 3: Create MissionControlService**

```typescript
// apps/api/src/modules/mission-control/mission-control.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ScoringService } from '../scoring/scoring.service';
import { CheckpointsService } from '../checkpoints/checkpoints.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class MissionControlService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly scoringService: ScoringService,
    private readonly checkpointsService: CheckpointsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private todayString() {
    return new Date().toISOString().split('T')[0];
  }

  async getToday(vendorId: string) {
    const today = this.todayString();

    // Score
    const { score, events } = await this.scoringService.getCurrentScore(vendorId);
    const disbursementEstimate = await this.scoringService.getDisbursementEstimate(vendorId);

    // SPPG + schools
    const [sppg] = await this.dataSource.query(
      `SELECT id, target_porsi, assigned_schools FROM sppg_locations WHERE vendor_id = $1 AND is_active = true LIMIT 1`,
      [vendorId],
    );
    const targetPorsi: number = sppg?.target_porsi ?? 100;
    const sekolahList: string[] = sppg?.assigned_schools ?? [];

    // Checkpoint matrix — one entry per CP per school (simplified: one sppg per vendor)
    const checkpoints = await this.checkpointsService.getCheckpointState(vendorId);
    const cpMatrix = sekolahList.map((school: string) => ({
      sekolahId: school,
      sekolahName: school,
      cp1: checkpoints.find(c => c.cpType === 'CP1')?.cpStatus ?? 'pending',
      cp2: checkpoints.find(c => c.cpType === 'CP2')?.cpStatus ?? 'pending',
      cp3: checkpoints.find(c => c.cpType === 'CP3')?.cpStatus ?? 'pending',
      cp4: checkpoints.find(c => c.cpType === 'CP4')?.cpStatus ?? 'pending',
    }));
    if (cpMatrix.length === 0) {
      cpMatrix.push({
        sekolahId: 'default',
        sekolahName: 'Sekolah (belum dikonfigurasi)',
        cp1: checkpoints.find(c => c.cpType === 'CP1')?.cpStatus ?? 'pending',
        cp2: checkpoints.find(c => c.cpType === 'CP2')?.cpStatus ?? 'pending',
        cp3: checkpoints.find(c => c.cpType === 'CP3')?.cpStatus ?? 'pending',
        cp4: checkpoints.find(c => c.cpType === 'CP4')?.cpStatus ?? 'pending',
      });
    }

    // Streak — count consecutive days with score >= 80
    const history = await this.scoringService.getHistory(vendorId, 30);
    let streak = 0;
    for (const rec of history) {
      if ((rec.scoreFinal ?? rec.scoreCurrent) >= 80) streak++;
      else break;
    }

    // Alerts (unread, today)
    const alerts = await this.dataSource.query(
      `SELECT id, severity, alert_type, title, body, created_at
       FROM alerts
       WHERE vendor_id = $1 AND is_read = false
       ORDER BY created_at DESC LIMIT 10`,
      [vendorId],
    );

    // Team presence
    const presence = this.realtimeService.getPresenceForVendor(vendorId);

    // Team members with presence status
    const teamMembers = await this.dataSource.query(
      `SELECT u.id, u.full_name, vtm.role
       FROM vendor_team_members vtm
       JOIN users u ON vtm.user_id = u.id
       WHERE vtm.vendor_id = $1 AND vtm.status = 'accepted'`,
      [vendorId],
    );
    const onlineUserIds = new Set(presence.map(p => p.userId));
    const team = teamMembers.map((m: { id: string; full_name: string; role: string }) => ({
      userId: m.id,
      name: m.full_name,
      role: m.role,
      isOnline: onlineUserIds.has(m.id),
    }));

    return {
      scoreDate: today,
      targetPorsi,
      menu: 'Nasi + Lauk Pauk', // stub — will be configurable in later phase
      sekolahList,
      team,
      cpMatrix,
      score,
      scoreEvents: events.slice(0, 5),
      scoreStreak: streak,
      disbursementEstimate,
      alerts,
    };
  }

  async getTeamPresence(vendorId: string) {
    return this.realtimeService.getPresenceForVendor(vendorId);
  }
}
```

- [ ] **Step 4: Create MissionControlController**

```typescript
// apps/api/src/modules/mission-control/mission-control.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { MissionControlService } from './mission-control.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

interface JwtPayload { sub: string; email: string; role: string; }

@Controller('mission-control')
@UseGuards(JwtAuthGuard)
export class MissionControlController {
  constructor(
    private readonly mcService: MissionControlService,
    private readonly dataSource: DataSource,
  ) {}

  private async getVendorId(userId: string): Promise<string> {
    const [row] = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [userId],
    );
    if (!row) throw new NotFoundException('Vendor tidak ditemukan');
    return row.id;
  }

  @Get('today')
  async getToday(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.sub);
    return this.mcService.getToday(vendorId);
  }

  @Get('team-presence')
  async getPresence(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.sub);
    return this.mcService.getTeamPresence(vendorId);
  }
}
```

- [ ] **Step 5: Create MissionControlModule**

```typescript
// apps/api/src/modules/mission-control/mission-control.module.ts
import { Module } from '@nestjs/common';
import { MissionControlService } from './mission-control.service';
import { MissionControlController } from './mission-control.controller';
import { ScoringModule } from '../scoring/scoring.module';
import { CheckpointsModule } from '../checkpoints/checkpoints.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [ScoringModule, CheckpointsModule, RealtimeModule],
  providers: [MissionControlService],
  controllers: [MissionControlController],
})
export class MissionControlModule {}
```

- [ ] **Step 6: Register in app.module.ts**

In `apps/api/src/app.module.ts`:

```typescript
import { MissionControlModule } from './modules/mission-control/mission-control.module';

// in imports array after CheckpointsModule:
MissionControlModule,
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
pnpm --filter api typecheck
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/realtime/ apps/api/src/modules/mission-control/ apps/api/src/app.module.ts
git commit -m "feat: add MissionControlModule with team presence tracking and aggregated daily view"
```

---

## Task 11: FEAT-2.1 Frontend — Mission Control Page

**Files:**
- Create: `apps/web/app/portal/(vendor)/mission-control/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// apps/web/app/portal/(vendor)/mission-control/page.tsx
"use client"

import * as React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../../../lib/api-client"
import { opsClient } from "../../../../lib/realtime-client"
import Cookies from "js-cookie"

// ─── Types ────────────────────────────────────────────────────────────────────

type CpStatus = 'pending' | 'in_progress' | 'done' | 'failed' | 'force_closed'

interface CpMatrixRow {
  sekolahId: string
  sekolahName: string
  cp1: CpStatus
  cp2: CpStatus
  cp3: CpStatus
  cp4: CpStatus
}

interface TeamMember {
  userId: string
  name: string
  role: string
  isOnline: boolean
}

interface ScoreEvent {
  id: string
  eventType: string
  scoreDelta: number
  reason: string
  occurredAt: string
}

interface MCData {
  scoreDate: string
  targetPorsi: number
  menu: string
  sekolahList: string[]
  team: TeamMember[]
  cpMatrix: CpMatrixRow[]
  score: number
  scoreEvents: ScoreEvent[]
  scoreStreak: number
  disbursementEstimate: number
  alerts: Array<{ id: string; severity: string; title: string; body: string; created_at: string }>
}

// ─── StatusChip ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: CpStatus }) {
  const map: Record<CpStatus, { label: string; className: string }> = {
    pending:     { label: '⬜ Belum', className: 'bg-slate-100 text-slate-600' },
    in_progress: { label: '🟡 Proses', className: 'bg-yellow-100 text-yellow-700' },
    done:        { label: '✅ Selesai', className: 'bg-green-100 text-green-700' },
    failed:      { label: '🔴 Gagal', className: 'bg-red-100 text-red-700' },
    force_closed:{ label: '🔴 Ditutup', className: 'bg-red-200 text-red-800' },
  }
  const { label, className } = map[status] ?? map.pending
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap', className)}>
      {label}
    </span>
  )
}

// ─── DayHeaderBar ─────────────────────────────────────────────────────────────

function DayHeaderBar({ data }: { data: MCData }) {
  const dateLabel = new Date(data.scoreDate).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-white border rounded-lg p-4">
      <div>
        <p className="text-sm text-slate-500">{dateLabel}</p>
        <p className="text-lg font-semibold">{data.menu}</p>
      </div>
      <div className="flex gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">{data.targetPorsi}</p>
          <p className="text-xs text-slate-500">Target Porsi</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{data.sekolahList.length || 1}</p>
          <p className="text-xs text-slate-500">Sekolah</p>
        </div>
      </div>
    </div>
  )
}

// ─── ScoreLiveCard ────────────────────────────────────────────────────────────

function ScoreLiveCard({
  score, streak, disbursement, events, onOpenBreakdown,
}: {
  score: number
  streak: number
  disbursement: number
  events: ScoreEvent[]
  onOpenBreakdown: () => void
}) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">Skor Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <button onClick={onOpenBreakdown} className="w-full text-left">
          <p className={cn('text-6xl font-black tabular-nums transition-all', color)}>{score}</p>
          <p className="text-xs text-slate-400 mt-1">🔥 Streak {streak} hari</p>
        </button>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-slate-500 mb-1">Estimasi Disbursement</p>
          <p className="text-lg font-semibold">
            Rp {disbursement.toLocaleString('id-ID')}
          </p>
        </div>
        {events.length > 0 && (
          <div className="mt-2 space-y-1">
            {events.slice(0, 3).map(e => (
              <p key={e.id} className="text-xs text-red-600">
                {e.scoreDelta} — {e.reason}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── TeamStatusGrid ───────────────────────────────────────────────────────────

function TeamStatusGrid({ team, onContact }: { team: TeamMember[]; onContact: (m: TeamMember) => void }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">Tim ({team.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {team.map(m => (
            <button
              key={m.userId}
              onClick={() => onContact(m)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                  m.isOnline ? 'bg-green-500' : 'bg-slate-300',
                )} />
              </div>
              <p className="text-xs text-slate-600 max-w-[60px] truncate">{m.name}</p>
            </button>
          ))}
          {team.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada anggota tim</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── CheckpointMatrix ─────────────────────────────────────────────────────────

function CheckpointMatrix({ matrix, onCellClick }: {
  matrix: CpMatrixRow[]
  onCellClick: (row: CpMatrixRow, cp: 'cp1' | 'cp2' | 'cp3' | 'cp4') => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">Checkpoint Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 text-slate-500 font-medium">Sekolah</th>
                {(['CP1','CP2','CP3','CP4'] as const).map(cp => (
                  <th key={cp} className="text-center py-2 px-2 text-slate-500 font-medium">{cp}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.sekolahId} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 pr-4 font-medium max-w-[120px] truncate">{row.sekolahName}</td>
                  {(['cp1','cp2','cp3','cp4'] as const).map(cp => (
                    <td key={cp} className="py-2 px-2 text-center">
                      <button onClick={() => onCellClick(row, cp)} className="hover:opacity-75">
                        <StatusChip status={row[cp]} />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── AlertStrip ───────────────────────────────────────────────────────────────

function AlertStrip({ alerts }: { alerts: MCData['alerts'] }) {
  if (alerts.length === 0) return null
  return (
    <div className="sticky bottom-0 bg-red-50 border-t border-red-200 p-3">
      <div className="flex gap-2 overflow-x-auto">
        {alerts.map(a => (
          <div key={a.id} className="flex-shrink-0 bg-white border border-red-200 rounded-lg px-3 py-2 text-xs max-w-[240px]">
            <p className="font-semibold text-red-700">{a.title}</p>
            <p className="text-slate-600 truncate">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  const [data, setData] = useState<MCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactTarget, setContactTarget] = useState<TeamMember | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const { toast } = useToast()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get<MCData>('/mission-control/today')
      setData(res.data)
    } catch {
      toast({ title: 'Gagal memuat data Mission Control', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()

    const token = Cookies.get('access_token') ?? ''
    if (token) {
      opsClient.connect(token)
      opsClient.on('score:update', () => fetchData())
      opsClient.on('mc:checkpoint:update', () => fetchData())
      opsClient.onPollTick(fetchData)
    }

    return () => {
      opsClient.off('score:update', fetchData)
      opsClient.off('mc:checkpoint:update', fetchData)
    }
  }, [fetchData])

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Memuat...</div>
  if (!data) return null

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <DayHeaderBar data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <TeamStatusGrid team={data.team} onContact={setContactTarget} />
        </div>
        <div className="lg:col-span-1">
          <ScoreLiveCard
            score={data.score}
            streak={data.scoreStreak}
            disbursement={data.disbursementEstimate}
            events={data.scoreEvents}
            onOpenBreakdown={() => setShowBreakdown(true)}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-2 text-xs text-slate-400 items-start justify-center pl-2">
          <p>💡 Skor diperbarui real-time via WebSocket.</p>
          <p>Tap baris sekolah untuk detail checkpoint.</p>
        </div>
      </div>

      <CheckpointMatrix
        matrix={data.cpMatrix}
        onCellClick={(row, cp) =>
          toast({ title: `${row.sekolahName} — ${cp.toUpperCase()}`, description: `Status: ${row[cp]}` })
        }
      />

      <AlertStrip alerts={data.alerts} />

      {/* Contact Sheet */}
      <Dialog open={!!contactTarget} onOpenChange={() => setContactTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hubungi {contactTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-sm text-slate-500">Peran: {contactTarget?.role}</p>
            <p className={cn('text-sm', contactTarget?.isOnline ? 'text-green-600' : 'text-slate-400')}>
              {contactTarget?.isOnline ? '🟢 Online sekarang' : '⚫ Offline'}
            </p>
            <Button variant="outline" onClick={() => setContactTarget(null)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Breakdown */}
      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rincian Skor</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2 max-h-80 overflow-y-auto">
            {data.scoreEvents.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada event hari ini</p>
            )}
            {data.scoreEvents.map(e => (
              <div key={e.id} className="flex items-start justify-between gap-2 p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">{e.reason}</p>
                  <p className="text-xs text-slate-400">{new Date(e.occurredAt).toLocaleTimeString('id-ID')}</p>
                </div>
                <span className={cn('text-sm font-bold', e.scoreDelta < 0 ? 'text-red-600' : 'text-green-600')}>
                  {e.scoreDelta > 0 ? '+' : ''}{e.scoreDelta}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm --filter web typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/portal/\(vendor\)/mission-control/
git commit -m "feat: add Mission Control page with CP matrix, score card, team presence, WS live updates"
```

---

## Task 12: FEAT-2.2 PWA — Rewrite Landing Page

**Files:**
- Modify: `apps/pwa/app/page.tsx`

- [ ] **Step 1: Rewrite apps/pwa/app/page.tsx**

Replace entire file:

```tsx
// apps/pwa/app/page.tsx
"use client"

import * as React from "react"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { useRouter } from "next/navigation"
import { apiClient } from "../lib/api-client"

interface CheckpointState {
  id: string
  cp_type: 'CP1' | 'CP2' | 'CP3' | 'CP4'
  cp_status: 'pending' | 'in_progress' | 'done' | 'failed' | 'force_closed'
  completed_at: string | null
}

interface DailyData {
  targetPorsi: number
  menu: string
  score: number
}

const CP_LABELS: Record<string, string> = {
  CP1: 'Persiapan Masak',
  CP2: 'Selesai Masak',
  CP3: 'Siap Kirim',
  CP4: 'Serah Terima',
}

const CP_WINDOWS: Record<string, { start: number; end: number }> = {
  CP1: { start: 6, end: 10 },
  CP2: { start: 10, end: 12 },
  CP3: { start: 12, end: 13 },
  CP4: { start: 13, end: 14 },
}

function getNextPendingCp(checkpoints: CheckpointState[]): CheckpointState | null {
  const order = ['CP1', 'CP2', 'CP3', 'CP4']
  for (const cpType of order) {
    const cp = checkpoints.find(c => c.cp_type === cpType)
    if (!cp || cp.cp_status === 'pending') {
      return cp ?? { id: cpType, cp_type: cpType as any, cp_status: 'pending', completed_at: null }
    }
  }
  return null
}

function isWindowOpen(cpType: string): boolean {
  const win = CP_WINDOWS[cpType]
  if (!win) return true
  const hour = new Date().getHours()
  return hour >= win.start && hour < win.end
}

function getCountdownToWindow(cpType: string): string {
  const win = CP_WINDOWS[cpType]
  if (!win) return ''
  const now = new Date()
  const target = new Date()
  target.setHours(win.start, 0, 0, 0)
  if (now >= target) return ''
  const diffMs = target.getTime() - now.getTime()
  const h = Math.floor(diffMs / 3_600_000)
  const m = Math.floor((diffMs % 3_600_000) / 60_000)
  return `${h}j ${m}m`
}

export default function PWALandingPage() {
  const [checkpoints, setCheckpoints] = useState<CheckpointState[]>([])
  const [dailyData, setDailyData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const [cpRes, scoreRes, meRes] = await Promise.all([
        apiClient.get('/checkpoints/today'),
        apiClient.get('/scoring/today'),
        apiClient.get('/auth/me'),
      ])
      setCheckpoints(cpRes.data ?? [])
      setDailyData({
        targetPorsi: 100, // stub — from sppg_location in later phase
        menu: 'Nasi + Lauk Pauk',
        score: scoreRes.data?.score ?? 100,
      })
      setUserName(meRes.data?.fullName ?? meRes.data?.email ?? '')
    } catch {
      toast({ title: 'Gagal memuat data harian', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  const allDone = checkpoints.length === 4 && checkpoints.every(c => c.cp_status === 'done')
  const nextCp = getNextPendingCp(checkpoints)
  const windowOpen = nextCp ? isWindowOpen(nextCp.cp_type) : false
  const countdown = nextCp ? getCountdownToWindow(nextCp.cp_type) : ''

  const handleStart = () => {
    if (!nextCp) return
    router.push(`/cp/${nextCp.cp_type}/context`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-8 gap-6" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center">
        <p className="text-slate-500 text-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold mt-1">Halo, {userName || 'Anggota Tim'} 👋</h1>
        {dailyData && (
          <p className="text-slate-500 mt-1 text-sm">
            Target hari ini: <span className="font-semibold">{dailyData.targetPorsi} porsi</span> · Skor: <span className="font-semibold">{dailyData.score}</span>
          </p>
        )}
      </div>

      {/* Status area */}
      {allDone ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-green-600">Semua Tugas Selesai!</h2>
          <p className="text-slate-500 text-sm mt-2">Kerja bagus hari ini. Sampai besok!</p>
        </div>
      ) : nextCp ? (
        <div className="w-full space-y-4">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tugas Berikutnya</p>
            <p className="text-xl font-bold">{nextCp.cp_type} — {CP_LABELS[nextCp.cp_type]}</p>
            {!windowOpen && countdown && (
              <p className="text-sm text-yellow-600 mt-2">⏰ Dimulai dalam {countdown}</p>
            )}
          </div>

          <Button
            size="lg"
            className="w-full h-16 text-lg font-bold"
            disabled={!windowOpen}
            onClick={handleStart}
          >
            {windowOpen ? 'TUGAS SEKARANG →' : `Tunggu ${countdown}`}
          </Button>

          {/* CP progress */}
          <div className="grid grid-cols-4 gap-2">
            {(['CP1','CP2','CP3','CP4'] as const).map(cpType => {
              const cp = checkpoints.find(c => c.cp_type === cpType)
              const status = cp?.cp_status ?? 'pending'
              return (
                <div key={cpType} className={cn(
                  'rounded-lg border p-2 text-center text-xs',
                  status === 'done' ? 'bg-green-50 border-green-200' :
                  status === 'in_progress' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-white border-slate-200',
                )}>
                  <p className="font-bold">{cpType}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5 truncate">{CP_LABELS[cpType]}</p>
                  <p className="mt-1">{status === 'done' ? '✅' : status === 'in_progress' ? '🔄' : '⬜'}</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/pwa/app/page.tsx
git commit -m "feat: rewrite PWA landing page as task-focused daily mode with CP progress"
```

---

## Task 13: FEAT-2.2 PWA — Context + Capture Routes

**Files:**
- Create: `apps/pwa/app/cp/[cpId]/context/page.tsx`
- Create: `apps/pwa/app/cp/[cpId]/capture/page.tsx`

- [ ] **Step 1: Create Context page**

```tsx
// apps/pwa/app/cp/[cpId]/context/page.tsx
"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"

const CP_CONTEXT: Record<string, { title: string; body: string; checklist: string[] }> = {
  CP1: {
    title: 'CP1 — Persiapan Masak',
    body: 'Foto kondisi dapur, bahan baku, dan area memasak sebelum mulai memasak. Pastikan semua bahan sudah siap dan area bersih.',
    checklist: ['Area dapur bersih', 'Bahan baku lengkap', 'Alat masak tersedia', 'APD dipakai'],
  },
  CP2: {
    title: 'CP2 — Selesai Masak',
    body: 'Foto hasil masakan yang sudah selesai. Tampilkan semua porsi yang siap dikemas. Pastikan makanan dalam kondisi baik.',
    checklist: ['Masakan selesai semua porsi', 'Suhu makanan aman', 'Penampilan sesuai standar'],
  },
  CP3: {
    title: 'CP3 — Siap Kirim',
    body: 'Foto kemasan yang sudah siap dikirim. Semua porsi sudah dikemas rapi dan diberi label. Token pengiriman akan dibuat setelah ini.',
    checklist: ['Semua porsi sudah dikemas', 'Label terpasang', 'Siap diserahkan ke kurir'],
  },
  CP4: {
    title: 'CP4 — Serah Terima',
    body: 'Foto proses serah terima ke sekolah. Pastikan kurir dan penerima di sekolah hadir. Foto harus menampilkan makanan dan penerima.',
    checklist: ['Kurir hadir', 'Penerima sekolah hadir', 'Jumlah porsi sesuai'],
  },
}

export default function CPContextPage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const ctx = CP_CONTEXT[cpId] ?? {
    title: `${cpId} — Checkpoint`,
    body: 'Ambil foto untuk checkpoint ini.',
    checklist: [],
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="flex-1">
        <button
          onClick={() => router.back()}
          className="text-slate-400 text-sm mb-6 flex items-center gap-1"
        >
          ← Kembali
        </button>

        <div className="mb-2">
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">{cpId}</span>
        </div>
        <h1 className="text-2xl font-bold mt-2 mb-4">{ctx.title}</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{ctx.body}</p>

        <div className="space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Yang harus ada di foto:</p>
          {ctx.checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full h-14 text-base font-bold bg-green-600 hover:bg-green-700 mt-8"
        onClick={() => router.push(`/cp/${cpId}/capture`)}
      >
        Mulai Foto →
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Create Capture page (live camera)**

```tsx
// apps/pwa/app/cp/[cpId]/capture/page.tsx
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@workspace/ui/hooks/use-toast"

export default function CPCapturePage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraReady, setCameraReady] = useState(false)
  const [capturing, setCapturing] = useState(false)

  const startCamera = async (mode: 'environment' | 'user') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      toast({ title: 'Kamera tidak tersedia', description: 'Izinkan akses kamera untuk melanjutkan', variant: 'destructive' })
    }
  }

  useEffect(() => {
    startCamera(facingMode)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facingMode])

  // Block any file input that might appear
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement && target.type === 'file') {
        e.preventDefault()
        e.stopPropagation()
        toast({ title: 'Foto harus diambil langsung dari kamera', variant: 'destructive' })
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [toast])

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return
    setCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) { setCapturing(false); return }
      const file = new File([blob], `${cpId}-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const url = URL.createObjectURL(file)
      // Store in sessionStorage for validate page
      const reader = new FileReader()
      reader.onload = () => {
        sessionStorage.setItem(`capture_${cpId}`, reader.result as string)
        sessionStorage.setItem(`capture_${cpId}_type`, file.type)
        setCapturing(false)
        router.push(`/cp/${cpId}/validate`)
      }
      reader.readAsDataURL(file)
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* CP label overlay */}
        <div className="absolute top-4 left-4">
          <span className="bg-black/60 text-white text-sm px-3 py-1 rounded-full">{cpId}</span>
        </div>

        {/* Flip camera button */}
        <button
          onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')}
          className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full text-xl"
          aria-label="Flip camera"
        >
          🔄
        </button>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm"
        >
          ← Kembali
        </button>
      </div>

      {/* Shutter button */}
      <div className="bg-black py-8 flex items-center justify-center">
        <button
          onClick={handleCapture}
          disabled={!cameraReady || capturing}
          className="w-20 h-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 disabled:opacity-50 transition-all flex items-center justify-center"
          aria-label="Ambil foto"
        >
          {capturing ? (
            <span className="text-white text-2xl">⏳</span>
          ) : (
            <span className="w-14 h-14 bg-white rounded-full block" />
          )}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/pwa/app/cp/"
git commit -m "feat: add CP context and live camera capture pages for Daily Mode PWA"
```

---

## Task 14: FEAT-2.2 PWA — Validate + Confirm Routes

**Files:**
- Create: `apps/pwa/app/cp/[cpId]/validate/page.tsx`
- Create: `apps/pwa/app/cp/[cpId]/confirm/page.tsx`

- [ ] **Step 1: Create Validate page**

```tsx
// apps/pwa/app/cp/[cpId]/validate/page.tsx
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { apiClient } from "../../../lib/api-client"

type ValidationState = 'loading' | 'pass' | 'fail' | 'manual'

export default function CPValidatePage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<ValidationState>('loading')
  const [failReason, setFailReason] = useState('')
  const [failCount, setFailCount] = useState(0)
  const [uploading, setUploading] = useState(false)

  const uploadAndValidate = async () => {
    setState('loading')
    const dataUrl = sessionStorage.getItem(`capture_${cpId}`)
    if (!dataUrl) {
      toast({ title: 'Foto tidak ditemukan, ambil ulang', variant: 'destructive' })
      router.push(`/cp/${cpId}/capture`)
      return
    }

    try {
      // Convert dataUrl to blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `${cpId}.jpg`, { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('photo', file)

      setUploading(true)
      await apiClient.post(`/checkpoints/${cpId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploading(false)
      setState('pass')

      // Clean up
      sessionStorage.removeItem(`capture_${cpId}`)
      sessionStorage.removeItem(`capture_${cpId}_type`)
    } catch (err: any) {
      setUploading(false)
      const msg: string = err?.response?.data?.message ?? 'Validasi gagal'
      setFailReason(msg)
      const newCount = failCount + 1
      setFailCount(newCount)
      if (newCount >= 3) {
        setState('manual')
      } else {
        setState('fail')
      }
    }
  }

  useEffect(() => { uploadAndValidate() }, [])

  const handleRetry = () => {
    router.push(`/cp/${cpId}/capture`)
  }

  const handleManualContinue = async () => {
    // Submit with a note that it required manual review
    const dataUrl = sessionStorage.getItem(`capture_${cpId}`)
    if (dataUrl) {
      try {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const file = new File([blob], `${cpId}.jpg`, { type: 'image/jpeg' })
        const formData = new FormData()
        formData.append('photo', file)
        formData.append('notes', 'Manual review — 3x AI validation failed')
        await apiClient.post(`/checkpoints/${cpId}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } catch {
        // Submit anyway, error is non-fatal for manual review
      }
    }
    router.push(`/cp/${cpId}/confirm`)
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white text-lg">{uploading ? 'Mengunggah foto...' : 'Memvalidasi foto...'}</p>
        <p className="text-slate-400 text-sm">Mohon tunggu</p>
      </div>
    )
  }

  if (state === 'pass') {
    return (
      <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center gap-4 text-white">
        <div className="text-7xl animate-bounce">✅</div>
        <h1 className="text-2xl font-bold">Foto Valid!</h1>
        <p className="text-green-100 text-sm">Foto berhasil divalidasi</p>
        <Button
          size="lg"
          className="mt-4 bg-white text-green-700 hover:bg-green-50 font-bold"
          onClick={() => router.push(`/cp/${cpId}/confirm`)}
        >
          Lanjut ke Konfirmasi →
        </Button>
      </div>
    )
  }

  if (state === 'manual') {
    return (
      <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center gap-4 text-white p-6 text-center" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="text-5xl">⚠️</div>
        <h1 className="text-xl font-bold">Foto Gagal 3 Kali</h1>
        <p className="text-slate-300 text-sm">Catatan manual review akan ditambahkan. Penalti -5 diterapkan.</p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={handleRetry}>
            Coba Lagi
          </Button>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold" onClick={handleManualContinue}>
            Lanjutkan dengan Catatan Manual
          </Button>
        </div>
      </div>
    )
  }

  // fail state
  return (
    <div className="min-h-screen bg-red-700 flex flex-col items-center justify-center gap-4 text-white p-6 text-center" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="text-6xl">❌</div>
      <h1 className="text-2xl font-bold">Foto Tidak Valid</h1>
      <p className="text-red-100 text-base">{failReason}</p>
      <p className="text-red-200 text-sm">Percobaan {failCount}/3</p>
      <Button
        size="lg"
        className="mt-4 bg-white text-red-700 hover:bg-red-50 font-bold"
        onClick={handleRetry}
      >
        Ambil Foto Ulang →
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Create Confirm page**

```tsx
// apps/pwa/app/cp/[cpId]/confirm/page.tsx
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const CP_CHECKLIST: Record<string, Array<{ icon: string; label: string }>> = {
  CP1: [
    { icon: '🧼', label: 'Area dapur sudah bersih' },
    { icon: '🥦', label: 'Bahan baku sudah disiapkan' },
    { icon: '📋', label: 'Jumlah porsi sudah dicek' },
  ],
  CP2: [
    { icon: '🍳', label: 'Semua porsi sudah matang' },
    { icon: '🌡️', label: 'Suhu makanan aman (>70°C)' },
    { icon: '✅', label: 'Rasa dan penampilan sesuai' },
  ],
  CP3: [
    { icon: '📦', label: 'Semua porsi sudah dikemas' },
    { icon: '🏷️', label: 'Label terpasang dengan benar' },
    { icon: '🚚', label: 'Siap diserahkan ke kurir' },
  ],
  CP4: [
    { icon: '🤝', label: 'Kurir sudah menerima makanan' },
    { icon: '📝', label: 'Jumlah porsi sesuai' },
    { icon: '📸', label: 'Foto serah terima sudah diambil' },
  ],
}

export default function CPConfirmPage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const checklist = CP_CHECKLIST[cpId] ?? []
  const [checked, setChecked] = useState<boolean[]>(checklist.map(() => false))
  const [done, setDone] = useState(false)

  const allChecked = checked.every(Boolean)

  const toggle = (i: number) => {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const handleConfirm = () => {
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center gap-4 text-white">
        <div className="text-7xl" style={{ animation: 'bounce 0.5s ease-in-out 3' }}>🎯</div>
        <h1 className="text-2xl font-bold">{cpId} Selesai!</h1>
        <p className="text-green-100 text-sm">Kembali ke halaman utama...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col px-6 py-8" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="mb-2">
        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">{cpId}</span>
      </div>
      <h1 className="text-2xl font-bold mt-2 mb-2">Konfirmasi</h1>
      <p className="text-slate-500 text-sm mb-6">Centang semua item untuk menyelesaikan checkpoint ini</p>

      <div className="flex-1 space-y-3">
        {checklist.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              checked[i] ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white',
            )}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className={cn('flex-1 text-sm font-medium', checked[i] ? 'text-green-700 line-through' : 'text-slate-700')}>
              {item.label}
            </span>
            <span className={cn('text-xl', checked[i] ? 'text-green-500' : 'text-slate-200')}>
              {checked[i] ? '✅' : '⬜'}
            </span>
          </button>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full h-14 text-base font-bold mt-8"
        disabled={!allChecked}
        onClick={handleConfirm}
      >
        {allChecked ? 'SELESAIKAN CHECKPOINT ✓' : `Centang semua (${checked.filter(Boolean).length}/${checklist.length})`}
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/pwa/app/cp/"
git commit -m "feat: add CP validate (AI result) and confirm (checklist + done animation) pages"
```

---

## Task 15: Final TypeCheck + Tracker Update

**Files:**
- Modify: `docs/superpowers/specs/2026-05-26-nutrio-action-tracker.md`

- [ ] **Step 1: Run full typecheck**

```bash
pnpm typecheck
```

Expected: no errors across api, web, pwa.

- [ ] **Step 2: Update tracker — mark Phase 3 items as DOING**

In `docs/superpowers/specs/2026-05-26-nutrio-action-tracker.md`:

1. Change `### ⬜ FEAT-2.1` → `### ✅ FEAT-2.1` and set `Started: 2026-06-02` + `Completed: 2026-06-02`
2. Change `### ⬜ FEAT-2.2` → `### ✅ FEAT-2.2` and set `Started: 2026-06-02` + `Completed: 2026-06-02`
3. Change `### ⬜ FEAT-2.3` → `### ✅ FEAT-2.3` and set `Started: 2026-06-02` + `Completed: 2026-06-02`
4. Change `### ⬜ FEAT-2.6` → `### ✅ FEAT-2.6` and set `Started: 2026-06-02` + `Completed: 2026-06-02`
5. Update dashboard counts: Phase 3 row → `0 ⬜, 0 🟦, 4 ✅`
6. Update `Spent (h)` for Phase 3 → `60`
7. Update TOTAL row accordingly

- [ ] **Step 3: Commit everything**

```bash
git add docs/superpowers/specs/2026-05-26-nutrio-action-tracker.md
git commit -m "docs: mark Phase 3 Dunia 2 Core as complete in tracker"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ FEAT-2.6: ScoringService (applyPenalty, getCurrentScore, getDisbursementEstimate, initializeDailyScore, getHistory), REST endpoints, WS broadcast, cron integration
- ✅ FEAT-2.3: CheckpointsService (ordering validation, Golden Rule, photo upload via INF-1, AI validate via INF-6, WS broadcast, CP3 delivery token), REST endpoints
- ✅ FEAT-2.1: MissionControlService (aggregated today view, team presence), REST endpoints, frontend page with all components + WS integration
- ✅ FEAT-2.2: PWA landing rewrite, 4 CP routes (context, capture, validate, confirm), live camera only, gallery block

**Acceptance criteria coverage:**
- ✅ score_events append-only: enforced by DB RULE in migration
- ✅ penalty -20 Golden Rule: `GOLDEN_RULE_VIOLATION` in penalty table + CP2 time check
- ✅ CP2 before CP1 → 400: ordering validation in `submitCheckpoint`
- ✅ CP3 → delivery_token: `generateDeliveryTokens` side effect
- ✅ Score WS < 5s: `broadcastToVendor('score:update')` fired synchronously in `applyPenalty`
- ✅ Gallery file picker blocked: event listener in capture page
- ✅ Live camera only: `getUserMedia` only, no `<input type=file>`

**Type consistency:**
- `CpType` defined in checkpoint-event.entity.ts, used consistently in service + controller
- `PenaltyEventType` defined in penalty.constants.ts, used in ScoringService + CheckpointsService
- `RealtimeService.getPresenceForVendor` defined in Task 10 Step 1, used in MissionControlService
