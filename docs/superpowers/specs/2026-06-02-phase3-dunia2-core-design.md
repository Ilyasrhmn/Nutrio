# Phase 3 — Dunia 2 Core: Design Spec

**Versi:** 1.0 · **Tanggal:** 2026-06-02
**Tracker refs:** FEAT-2.6, FEAT-2.3, FEAT-2.1, FEAT-2.2
**Approach:** Sequential Bottom-Up (A)

---

## Scope

Empat fitur inti Dunia 2 yang membentuk alur operasional harian vendor:

| Fitur | Est | Urutan |
|-------|-----|--------|
| FEAT-2.6 Scoring Engine Real-Time | 14h | 1 |
| FEAT-2.3 Checkpoint Flow CP1–CP4 (Backend) | 24h | 2 |
| FEAT-2.1 Mission Control (Owner) | 14h | 3 |
| FEAT-2.2 Daily Mode PWA (Staff) | 16h | 4 |

**Total:** ~60h. Semua dikerjakan berurutan; setiap layer verify sebelum lanjut.

---

## Constraints & Cut Scope

- Penalty table: hardcoded TypeScript const (bukan DB-configurable)
- Mission Control: WebSocket real-time (INF-2 sudah ada)
- PWA camera: live `getUserMedia` only — no file input gallery
- FEAT-2.3 fraud check: inline skip, defer ke FEAT-3.3
- Golden Rule countdown UI: skip, backend tetap validate
- Offline queue (INF-5): deferred post-demo

---

## 1. Database Migrations

### Migration: `1710900000000-AddScoringTables.ts`

```sql
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

-- Append-only enforcement
CREATE RULE no_update_score_events AS ON UPDATE TO score_events DO INSTEAD NOTHING;
CREATE RULE no_delete_score_events AS ON DELETE TO score_events DO INSTEAD NOTHING;
```

### Migration: `1710900000001-AddCheckpointTables.ts`

```sql
CREATE TYPE cp_type AS ENUM ('CP1', 'CP2', 'CP3', 'CP4');
CREATE TYPE cp_status AS ENUM ('pending', 'in_progress', 'done', 'failed', 'force_closed');

CREATE TABLE checkpoint_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  sppg_location_id  UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE CASCADE,
  cp_type           cp_type NOT NULL,
  cp_status         cp_status NOT NULL DEFAULT 'pending',
  photos            JSONB DEFAULT '[]',
  ai_validation     JSONB,
  score_delta       INTEGER DEFAULT 0,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  gps               GEOGRAPHY(POINT, 4326),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vendor_id, sppg_location_id, cp_type, DATE(created_at))
);

CREATE TABLE delivery_tokens (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token             UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  sppg_location_id  UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE CASCADE,
  school_id         TEXT NOT NULL,
  porsi_count       INTEGER NOT NULL,
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
  masalah_jenis       TEXT[] DEFAULT '{}',
  catatan             TEXT,
  confirmed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 2. Backend Modules

### 2.1 ScoringModule (`apps/api/src/modules/scoring/`)

**Files:**
- `scoring.module.ts` — NestJS module, export ScoringService
- `scoring.service.ts` — core logic
- `scoring.controller.ts` — REST endpoints
- `penalty.constants.ts` — hardcoded penalty table

**Service interface:**
```typescript
initializeDailyScore(vendorId: string): Promise<DailyScoreRecord>
applyPenalty(vendorId: string, eventType: PenaltyEventType, context?: object): Promise<ScoreEvent>
getCurrentScore(vendorId: string): Promise<{ score: number; record: DailyScoreRecord }>
getDisbursementEstimate(vendorId: string): Promise<number>
finalizeScore(vendorId: string): Promise<DailyScoreRecord>
```

**Penalty constants (PRD §5.6 sample):**
```typescript
export const PENALTY_TABLE: Record<PenaltyEventType, { delta: number; ref: string }> = {
  GOLDEN_RULE_VIOLATION: { delta: -20, ref: 'PRD §5.6.A' },
  AI_VALIDATION_FAIL_3X:  { delta: -5,  ref: 'PRD §5.6.B' },
  FORCE_CLOSED_NO_CP:     { delta: -50, ref: 'PRD §5.6.C' },
  SCHOOL_COMPLAINT:       { delta: -10, ref: 'PRD §5.6.D' },
  // ... others per PRD
};
```

**Endpoints:**
- `GET /scoring/today` — current score + events list
- `GET /scoring/history?days=30` — 30-day history

**WebSocket side effects:**
- After every `applyPenalty`: broadcast `score:update` to `vendor:{vendorId}` room
- If score < 60: also broadcast `score:critical` to `bgn:all` room

**Cron integration:**
- `score-init.cron.ts` (00:01 daily): replace stub with real `initializeDailyScore` for all ACTIVE vendors
- `force-close.cron.ts` (14:00 daily): replace stub with `applyPenalty(FORCE_CLOSED_NO_CP)` for vendors with no CP today

---

### 2.2 CheckpointsModule (`apps/api/src/modules/checkpoints/`)

**Files:**
- `checkpoints.module.ts`
- `checkpoints.service.ts`
- `checkpoints.controller.ts`
- `dto/submit-checkpoint.dto.ts`

**Service logic:**
- `getCheckpointState(vendorId): Promise<CheckpointState>` — today's CP statuses
- `submitCheckpoint(vendorId, cpType, file, gps, metadata)`:
  1. Validate ordering: CP2 requires CP1 done, etc.
  2. Upload photo via StorageService → file_key, file_hash
  3. Call VisionService async (AI validate) → update ai_validation later
  4. Call ScoringService.applyPenalty if needed
  5. Broadcast `mc:checkpoint:update` via RealtimeService
  6. Side effects: CP3 → generateDeliveryToken; CP4 dual-confirm → stub debrief trigger

**Golden Rule validation:**
```typescript
if (cpType === 'CP2') {
  const cp1 = await this.getCP1(vendorId, today);
  const diffHours = (now - cp1.completed_at) / 3600000;
  if (diffHours > 4) await this.scoringService.applyPenalty(vendorId, 'GOLDEN_RULE_VIOLATION');
}
```

**Endpoints:**
- `GET /checkpoints/today` — all CP states for today
- `POST /checkpoints/:cpType/submit` — multipart (photo + GPS + metadata)

---

### 2.3 MissionControlModule (`apps/api/src/modules/mission-control/`)

**Files:**
- `mission-control.module.ts`
- `mission-control.service.ts` — read-only aggregator
- `mission-control.controller.ts`

**Endpoints:**
- `GET /mission-control/today` — aggregates: target_porsi, menu, sekolah list, CP matrix, score, disbursement estimate, streak
- `GET /mission-control/team-presence` — online status dari WebSocket handshake tracking

**Team presence implementation:** Track sebagai in-memory `Map<userId, { connectedAt, vendorId }>` di RealtimeGateway. On connect → set; on disconnect → delete. GET /team-presence queries this map. Acceptable for demo (restarts lose presence, fine).

**WebSocket (receive-only):** Listens to `score:update` + `mc:checkpoint:update` events, no additional emit needed.

---

## 3. Frontend

### 3.1 Mission Control (`apps/web/app/portal/(vendor)/mission-control/page.tsx`)

**Layout:**
- Desktop: 4-panel grid (DayHeaderBar full-width, TeamStatusGrid | CheckpointMatrix | ScoreLiveCard + DisbursementEstimate)
- Mobile: stacked cards

**Components:**
| Component | Responsibility |
|-----------|---------------|
| `DayHeaderBar` | Tanggal, total porsi, menu hari ini |
| `TeamStatusGrid` | Avatar grid, online dot, tap → ContactSheet modal |
| `CheckpointMatrix` | Table: sekolah rows × CP1-4 cols, StatusChip cells |
| `StatusChip` | Color: ⬜ pending, 🟡 in_progress, ✅ done, 🔴 failed/force_closed |
| `ScoreLiveCard` | Angka besar animated, trend arrow, streak |
| `DisbursementEstimate` | Rp formatted, basis formula |
| `AlertStrip` | Sticky bottom, priority-sorted |
| `ContactSheet` | Modal: tap nama → WA link / in-platform |
| `CheckpointDetail` | Modal: tap row → foto, timestamp, AI result |
| `ScoreBreakdown` | Modal: tap score → timeline events |

**WebSocket integration:**
- Subscribe to `/ops` namespace on mount
- Handle `score:update` → update ScoreLiveCard
- Handle `mc:checkpoint:update` → update CheckpointMatrix cell
- Fallback: refetch every 10s if WS disconnected

---

### 3.2 Daily Mode PWA (5 routes)

**Routes (linear flow):**

```
/                           → PWALanding
/cp/[cpId]/context          → CPContextCard
/cp/[cpId]/capture          → LiveCameraCapture
/cp/[cpId]/validate         → AIValidationScreen
/cp/[cpId]/confirm          → ConfirmChecklist + CPDoneAnimation
```

**Key components:**

| Component | Detail |
|-----------|--------|
| `PWALanding` | Nama staf + tanggal + porsi + "TUGAS SEKARANG". Lock + countdown jika window belum buka. "Semua selesai" state. |
| `CPContextCard` | Full-screen heading + body + CTA "Mulai Foto" |
| `LiveCameraCapture` | `getUserMedia({video:{facingMode:'environment'}})`. Shutter ≥ 64px bottom-center. Flip button. NO file input. Intercept file picker → toast block. |
| `AIValidationScreen` | Full-screen overlay animated. Pass → green. Fail → red + spesifik message. 3x fail → "Lanjutkan dengan catatan manual review" |
| `ConfirmChecklist` | Visual icon checklist, tap-to-check |
| `CPDoneAnimation` | CSS/Lottie checkmark. Auto-return ke landing setelah 2s. |

**No nav bars, no hamburger** — PWA hanya tampil task-focused layout.

---

## 4. Integration Points

```
score-init.cron (00:01) → ScoringService.initializeDailyScore (all ACTIVE vendors)
force-close.cron (14:00) → ScoringService.applyPenalty(FORCE_CLOSED_NO_CP) + CheckpointsService.forceCloseAll

CheckpointsService.submit
  → StorageService.upload (photo)
  → VisionService.validatePhoto (async)
  → ScoringService.applyPenalty (if violation)
  → RealtimeService.broadcastToVendor (mc:checkpoint:update)
  → [CP3] DeliveryTokenService.generate
  → [CP4] stub debrief trigger

ScoringService.applyPenalty
  → RealtimeService.broadcastToVendor (score:update)
  → [score<60] RealtimeService.broadcastToBGN (score:critical)

MissionControl page
  → GET /mission-control/today (initial load)
  → WS /ops subscribe (score:update, mc:checkpoint:update)
  → Fallback poll every 10s
```

---

## 5. Acceptance Criteria Summary

| Feature | Critical criteria |
|---------|------------------|
| FEAT-2.6 | score_events append-only; penalty -20 Golden Rule applied; WS < 5s |
| FEAT-2.3 | CP2 before CP1 → 400; CP2 > 4h → -20 applied; CP3 → delivery_token created |
| FEAT-2.1 | Above-fold visible; score update < 5s (WS) / < 15s (poll); ContactSheet tap works |
| FEAT-2.2 | Staff selesai 1 CP < 3 menit; gallery file picker blocked; live camera only |
