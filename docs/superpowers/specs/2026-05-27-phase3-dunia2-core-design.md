# Design: PHASE 3 — Dunia 2 Core Implementation

**Tanggal:** 2026-05-27  
**Status:** Approved  
**Companion ke:** [action-tracker](./2026-05-26-nutrio-action-tracker.md) · [PRD v2 §5](./2026-05-26-nutrio-prd-v2.md)  
**Covers:** FEAT-2.6, FEAT-2.3, FEAT-2.1, FEAT-2.2

---

## Scope

PHASE 3 terdiri dari 4 fitur:

| Feature | Type | Est | Depends on |
|---------|------|-----|------------|
| FEAT-2.6 Scoring Engine | Backend | 14h | INF-2, INF-3, FEAT-1.6 |
| FEAT-2.3 Checkpoint Flow | Backend | 24h | FEAT-2.6, INF-1, INF-2, INF-6 |
| FEAT-2.1 Mission Control | Backend + Web Frontend | 14h | FEAT-2.3, INF-2 |
| FEAT-2.2 Daily Mode PWA | PWA Frontend | 16h | FEAT-2.3 |

**Implementation order:** FEAT-2.6 → FEAT-2.3 (serial, backend batch) → FEAT-2.1 + FEAT-2.2 (parallel, frontend batch)

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mission Control real-time | WebSocket (INF-2 `/ops` namespace) + polling fallback 10s | INF-2 sudah siap, polling sebagai safety net |
| PWA Camera | Full MediaDevices API — `getUserMedia`, shutter, flip | Sesuai spec PRD §5.2, no file picker |
| SPPG Resolution | Auto: ambil first sppg_location by vendor_id | 1 vendor = 1 SPPG per spec |
| AI Photo Validation | Async — call vision.service setelah upload, update checkpoint | Tidak block submission |
| Score Events | Append-only via DB rule `ON UPDATE DO NOTHING` | Immutability requirement PRD §5.6 |

---

## Section A — FEAT-2.6: Scoring Engine Real-Time

### Database Schema

```sql
-- New migration: 1710900000000-AddScoringTables.ts

CREATE TYPE score_event_type AS ENUM (
  'cp_late_under_15min',    -- -2
  'cp_late_15_to_60min',    -- -5
  'golden_rule_violation',  -- -20
  'portion_short',          -- -2 per porsi
  'photo_fail_3x',          -- -5
  'school_confirm_problem', -- -10
  'no_checkpoint_today',    -- -50
  'manual_review',          -- -5
  'day_init'                -- 0 (skor dimulai 100)
);

CREATE TABLE daily_score_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id     UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  score_date    DATE NOT NULL,
  score_current INTEGER NOT NULL DEFAULT 100,
  score_final   INTEGER,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at  TIMESTAMPTZ,
  UNIQUE(vendor_id, score_date)
);

CREATE TABLE score_events (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_score_record_id UUID NOT NULL REFERENCES daily_score_records(id),
  event_type            score_event_type NOT NULL,
  score_delta           INTEGER NOT NULL DEFAULT 0,
  reason                TEXT NOT NULL,
  regulation_ref        VARCHAR(100),
  metadata              JSONB,
  occurred_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutability: append-only
CREATE RULE no_update_score_events AS ON UPDATE TO score_events DO INSTEAD NOTHING;
CREATE RULE no_delete_score_events AS ON DELETE TO score_events DO INSTEAD NOTHING;

CREATE INDEX idx_score_records_vendor_date ON daily_score_records(vendor_id, score_date DESC);
CREATE INDEX idx_score_events_record       ON score_events(daily_score_record_id, occurred_at DESC);
```

### Penalty Table (dari PRD §5.6)

```typescript
export const PENALTY_TABLE: Record<ScoreEventType, number> = {
  cp_late_under_15min:    -2,
  cp_late_15_to_60min:    -5,
  golden_rule_violation:  -20,
  portion_short:          -2,  // per porsi
  photo_fail_3x:          -5,
  school_confirm_problem: -10,
  no_checkpoint_today:    -50,
  manual_review:          -5,
  day_init:               0,
};
```

### ScoringService API

```typescript
// apps/api/src/modules/scoring/scoring.service.ts

applyPenalty(vendorId: string, eventType: ScoreEventType, context: {
  reason: string;
  regulationRef?: string;
  metadata?: Record<string, any>;
}): Promise<{ newScore: number; delta: number }>

getCurrentScore(vendorId: string): Promise<{
  score: number;
  events: ScoreEvent[];
  date: string;
}>

getDisbursementEstimate(vendorId: string): Promise<{
  estimatedAmount: number;
  targetPorsi: number;
  baseRate: number;
  scoreMultiplier: number;
}>

finalizeDay(vendorId: string): Promise<void>
```

**Disbursement formula:** `target_porsi × base_rate × (score / 100)`  
- `target_porsi`: `sppg_locations.assigned_schools.length × 60` (default 60 porsi/sekolah)  
- `base_rate`: dari ENV `DISBURSEMENT_BASE_RATE` (default: `Rp 20.000`)

### Endpoints

```
GET  /scoring/today          → { score, events[], disbursement_estimate }
GET  /scoring/history?days=N → [{ date, score_final, events[] }]
```

### WebSocket Broadcasts

```typescript
// Setelah setiap applyPenalty():
realtimeService.broadcastToVendor(vendorId, 'score:update', { score, delta, event })

// Saat score < 60:
realtimeService.broadcastToBGN('score:critical', { vendorId, score, reason })
```

### Cron Integration

`score-init.cron.ts` (sudah ada, 00:01 daily) → upsert `daily_score_records` untuk semua vendor ACTIVE.  
`force-close.cron.ts` (sudah ada, 14:00 daily) → apply `no_checkpoint_today` penalty untuk vendor tanpa CP.

---

## Section B — FEAT-2.3: Checkpoint Flow CP1–CP4

### Database Schema

```sql
-- New migration: 1710900000001-AddCheckpointTables.ts

CREATE TYPE cp_type AS ENUM ('CP1', 'CP2', 'CP3', 'CP4');
CREATE TYPE cp_status AS ENUM ('pending', 'in_progress', 'done', 'failed', 'force_closed');
CREATE TYPE delivery_token_status AS ENUM ('active', 'waiting_school_confirm', 'completed', 'expired', 'used');

CREATE TABLE checkpoint_events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id        UUID NOT NULL REFERENCES vendors(id),
  sppg_location_id UUID NOT NULL REFERENCES sppg_locations(id),
  cp_type          cp_type NOT NULL,
  cp_status        cp_status NOT NULL DEFAULT 'pending',
  photos           JSONB NOT NULL DEFAULT '[]',  -- [{file_key, file_url, file_hash, gps_lat, gps_lng, captured_at}]
  ai_validation    JSONB,                         -- {pass: bool, reason: string, confidence: float}
  score_delta      INTEGER NOT NULL DEFAULT 0,
  manual_review    BOOLEAN NOT NULL DEFAULT FALSE,
  data_hash        VARCHAR(64),                   -- SHA-256(sorted JSON of event) for audit
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  UNIQUE(vendor_id, cp_type, started_at::date)  -- 1 CP per type per day
);

CREATE TABLE delivery_tokens (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token            UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  vendor_id        UUID NOT NULL REFERENCES vendors(id),
  sppg_location_id UUID NOT NULL REFERENCES sppg_locations(id),
  school_id        VARCHAR(255) NOT NULL,         -- dari assigned_schools array
  porsi_count      INTEGER NOT NULL,
  status           delivery_token_status NOT NULL DEFAULT 'active',
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expired_at       TIMESTAMPTZ NOT NULL,          -- generated_at + 4h
  used_at          TIMESTAMPTZ
);

CREATE TABLE school_confirmations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_token_id UUID NOT NULL UNIQUE REFERENCES delivery_tokens(id),
  jumlah_diterima   INTEGER NOT NULL,
  kondisi           VARCHAR(20) NOT NULL,          -- 'baik' | 'ada_masalah'
  masalah_jenis     TEXT[] NOT NULL DEFAULT '{}',
  catatan           TEXT,
  confirmed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cp_events_vendor_date ON checkpoint_events(vendor_id, started_at DESC);
CREATE INDEX idx_delivery_tokens_token ON delivery_tokens(token);
CREATE INDEX idx_delivery_tokens_vendor ON delivery_tokens(vendor_id, generated_at DESC);
```

### CheckpointsService Logic

```
POST /checkpoints/:cpType/submit
  1. Resolve sppg_location_id (vendor's only SPPG)
  2. Validate CP ordering (CP2 requires CP1.done, etc.)
  3. Validate Golden Rule: if cpType=CP2 and CP1.completed_at + 4h < now → apply -20 penalty
  4. Upload photo → StorageService → {file_key, file_url, file_hash}
  5. Save GPS in photos array
  6. Save checkpoint_event with status='in_progress'
  7. Queue async: VisionService.validatePhoto() → update ai_validation
     - If fail and attempts >= 3: mark manual_review=true, apply -5 penalty
  8. Mark status='done'
  9. Compute data_hash = SHA-256(JSON.stringify(sortedFields))
  10. Audit log via DataSource transaction
  11. Side effects:
      - CP3 done → generate delivery_token
      - CP4 done → finalize score + TODO: trigger debrief (FEAT-2.7)
  12. Broadcast mc:checkpoint:update via RealtimeService
```

### Endpoints

```
GET  /checkpoints/today           → { cp1, cp2, cp3, cp4 } each with status + timestamps
POST /checkpoints/:cpType/submit  → multipart: foto + gps_lat + gps_lng + metadata
GET  /checkpoints/delivery-token  → { token, url, expired_at } (CP3 done)
```

### Force-Close Integration

`force-close.cron.ts` dipatch ke `CheckpointsService.forceCloseDay()` yang:
1. Set semua CP `pending` → `force_closed`
2. Untuk vendor tanpa CP hari ini → `ScoringService.applyPenalty('no_checkpoint_today')`

---

## Section C — FEAT-2.1: Mission Control (Owner)

### MissionControlModule (Backend Aggregator)

```
GET /mission-control/today → {
  date: string,
  targetPorsi: number,
  menu: string,
  checkpoints: { cp1, cp2, cp3, cp4 }[],  // per sppg
  teamPresence: { userId, name, isOnline, role }[],
  score: { current, events[] },
  disbursementEstimate: { amount, targetPorsi, baseRate },
  streak: number,
  alerts: []
}
GET /mission-control/team-presence → { members[] }
```

### Frontend Architecture

**Route:** `apps/web/app/portal/(vendor)/mission-control/page.tsx`

**Data fetching strategy:**
1. Initial load: `GET /mission-control/today`
2. Polling: `setInterval(10_000)` → re-fetch `/mission-control/today`
3. WebSocket: connect ke `/ops`, listen `mc:checkpoint:update` → update state tanpa full re-fetch
4. WebSocket: listen `score:update` → update score card

**Component tree:**
```
MissionControlPage
├── DayHeaderBar          — tanggal + total porsi + menu
├── TeamStatusGrid         — avatar grid + online dots
├── CheckpointMatrix       — rows=sekolah, cols=CP1-4, StatusChips
│   └── CheckpointDetailModal  — on row tap
├── ScoreLiveCard          — animated score + trend arrow + streak
│   └── ScoreBreakdownModal  — on tap
├── DisbursementEstimate   — Rp formatted + basis
└── AlertStrip (sticky)    — priority-sorted alerts
```

**StatusChip variants:** `pending`(⬜), `in_progress`(🟡), `done`(✅), `failed`/`force_closed`(🔴)

---

## Section D — FEAT-2.2: Daily Mode PWA (Staff)

### Route Structure

```
apps/pwa/app/
├── page.tsx                     ← Rewrite: VendorHome → PWALanding
└── cp/
    └── [cpId]/
        ├── context/page.tsx     ← CONTEXT: instruksi + info (cpId = CP1|CP2|CP3|CP4)
        ├── capture/page.tsx     ← CAPTURE: live camera
        ├── validate/page.tsx    ← VALIDATE: loading + AI result
        └── confirm/page.tsx     ← CONFIRM: checklist + submit
```

### PWALanding (page.tsx rewrite)

- Ambil `GET /checkpoints/today` → determine current CP to do
- Jika semua done: "Semua tugas selesai" state
- Jika window belum buka: countdown timer
- Jika ada CP aktif: tombol besar "TUGAS SEKARANG" → `/cp/CP1/context`
- Zero navigation (no hamburger, no bottom bar) saat CP flow

### LiveCameraCapture (capture/page.tsx)

```typescript
// Core camera setup
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: facingMode }  // 'environment' | 'user'
})
videoRef.current.srcObject = stream

// Shutter: capture ke canvas
const canvas = document.createElement('canvas')
canvas.width = videoRef.current.videoWidth
canvas.height = videoRef.current.videoHeight
canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.8))
```

- **Shutter button**: fixed bottom center, 64px diameter, one-thumb reachable
- **Flip button**: top right corner, toggles `facingMode` state
- **NO `<input type="file">`** di mana pun
- GPS captured via `navigator.geolocation.getCurrentPosition()` saat shutter pressed

### Validate Screen (validate/page.tsx)

- Upload foto + GPS ke `POST /checkpoints/CP1/submit`
- Tampilkan loading animation selama request
- AI result dari response:
  - PASS: full-screen green overlay + konfeti → auto-proceed ke confirm
  - FAIL (attempt 1-2): red overlay + pesan spesifik AI + "Coba Lagi" → back ke capture
  - FAIL (attempt 3): red overlay + "Lanjutkan dengan catatan manual review" CTA

### Confirm Screen (confirm/page.tsx)

- Checklist visual icons (sesuai CP type)
- Submit → `POST /checkpoints/:cpType/submit` dengan `confirmed=true`
- `CPDoneAnimation`: CSS checkmark + score flash
- Auto-return ke landing setelah 2 detik

---

## Integration Points

```
PWA Capture → POST /checkpoints/:cpType/submit
                  ↓
           ScoringService.applyPenalty() [if violations]
                  ↓
           RealtimeService.broadcastToVendor() ← Mission Control WS listener
                  ↓
           VisionService.validatePhoto() [async]
                  ↓ CP3 done
           Generate delivery_token
```

---

## What's NOT in PHASE 3 (deferred per tracker)

- FEAT-2.4: Delivery Token kurir flow (PHASE 4)
- FEAT-2.5: School Confirmation (PHASE 4)
- FEAT-2.7: Daily Debrief generation — CP4 side effect hanya placeholder (PHASE 4)
- INF-4: Notification Service (PHASE 4)
- Push notification on score drop > 10 — stub (PHASE 4)

---

## File Inventory (yang akan dibuat/diubah)

### Backend (apps/api)

```
src/database/migrations/
  1710900000000-AddScoringTables.ts       ← NEW
  1710900000001-AddCheckpointTables.ts    ← NEW

src/modules/scoring/
  scoring.module.ts                        ← NEW
  scoring.service.ts                       ← NEW
  scoring.controller.ts                    ← NEW
  entities/
    daily-score-record.entity.ts           ← NEW
    score-event.entity.ts                  ← NEW
  dto/
    scoring-response.dto.ts                ← NEW

src/modules/checkpoints/
  checkpoints.module.ts                    ← NEW
  checkpoints.service.ts                   ← NEW
  checkpoints.controller.ts               ← NEW
  entities/
    checkpoint-event.entity.ts             ← NEW
    delivery-token.entity.ts              ← NEW
    school-confirmation.entity.ts          ← NEW
  dto/
    submit-checkpoint.dto.ts               ← NEW

src/modules/mission-control/
  mission-control.module.ts               ← NEW
  mission-control.service.ts              ← NEW
  mission-control.controller.ts           ← NEW

src/modules/scheduler/
  score-init.cron.ts                       ← UPDATE (implement actual logic)
  force-close.cron.ts                      ← UPDATE (implement actual logic)

src/app.module.ts                          ← UPDATE (register 3 new modules)
```

### Frontend Web (apps/web)

```
app/portal/(vendor)/mission-control/
  page.tsx                                 ← NEW
  components/
    DayHeaderBar.tsx                       ← NEW
    TeamStatusGrid.tsx                     ← NEW
    CheckpointMatrix.tsx                   ← NEW
    StatusChip.tsx                         ← NEW
    ScoreLiveCard.tsx                      ← NEW
    DisbursementEstimate.tsx              ← NEW
    AlertStrip.tsx                         ← NEW
    CheckpointDetailModal.tsx             ← NEW
    ScoreBreakdownModal.tsx               ← NEW
```

### Frontend PWA (apps/pwa)

```
app/
  page.tsx                                 ← REWRITE
  cp/[cpId]/
    context/page.tsx                       ← NEW
    capture/page.tsx                       ← NEW
    validate/page.tsx                      ← NEW
    confirm/page.tsx                       ← NEW
  components/
    PWALanding.tsx                         ← NEW
    CPContextCard.tsx                      ← NEW
    LiveCameraCapture.tsx                  ← NEW
    AIValidationScreen.tsx                 ← NEW
    ConfirmChecklist.tsx                   ← NEW
    CPDoneAnimation.tsx                    ← NEW
```

---

## Acceptance Criteria Summary

### FEAT-2.6
- [ ] Score update < 5 detik via WS setelah event
- [ ] `score_events` tidak bisa UPDATE/DELETE (SQL rule test)
- [ ] Penalti -20 applied saat CP2 > 4j dari CP1

### FEAT-2.3
- [ ] CP2 submit sebelum CP1 → 400 error
- [ ] CP3 submit success → delivery_token tercipta
- [ ] Audit log entry per CP done (dengan data_hash)

### FEAT-2.1
- [ ] All info kritika visible above-the-fold
- [ ] Score update < 5 detik (WS) atau < 15 detik (polling)
- [ ] Tap row CheckpointMatrix → modal detail muncul

### FEAT-2.2
- [ ] Staff selesai 1 CP penuh tanpa instruksi tambahan
- [ ] CP flow selesai < 3 menit
- [ ] Gallery/file picker tidak ada → tidak bisa diakses
- [ ] Camera flip works (front/back toggle)
