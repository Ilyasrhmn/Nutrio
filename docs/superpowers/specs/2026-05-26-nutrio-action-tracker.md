# Nutrio — Action Tracker

**Versi:** 1.0 · **Tanggal mulai:** 2026-05-26
**Companion ke:** [gap-analysis & action plan](2026-05-26-nutrio-gap-analysis-action-plan.md) — referensi konteks per item ada di sana.
**Cara pakai:** Edit checkbox `[ ]` → `[x]` saat sub-task selesai. Ubah icon status item (⬜/🟦/✅/🟥/⏸) saat berubah. Update field `Started/Completed/Spent` sesuai progress nyata.

---

## Status Legend

| Icon | Status | Arti |
|------|--------|------|
| ⬜ | TODO | Belum mulai |
| 🟦 | DOING | Sedang dikerjakan |
| ✅ | DONE | Selesai (isi `Completed` date) |
| 🟥 | BLOCKED | Tertahan — isi `Blockers` |
| ⏸ | DEFERRED | Ditunda post-hackathon |

**Quick filter (grep dari root):**
```bash
grep -c "^### 🟦" docs/superpowers/specs/2026-05-26-nutrio-action-tracker.md   # count DOING
grep -n "^### 🟥" docs/superpowers/specs/2026-05-26-nutrio-action-tracker.md   # list BLOCKED with line numbers
grep -B1 "^- \[ \]" docs/superpowers/specs/2026-05-26-nutrio-action-tracker.md # all open sub-tasks
```

---

## Dashboard

> Update kolom counts manual saat status berubah. `Hours spent` diisi cumulative.

| Phase | Items | ⬜ | 🟦 | ✅ | 🟥 | ⏸ | Est (h) | Spent (h) |
|-------|------:|---:|---:|---:|---:|---:|--------:|----------:|
| 0 Cleanup            | 4 | 0 | 0 | 4 | 0 | 0 | 8   | 8 |
| 1 Fondasi            | 5 | 5 | 0 | 0 | 0 | 0 | 31  | 0 |
| 2 Dunia 1 Skinny     | 2 | 2 | 0 | 0 | 0 | 0 | 28  | 0 |
| 3 Dunia 2 Core       | 4 | 4 | 0 | 0 | 0 | 0 | 60  | 0 |
| 4 Closing the Loop   | 4 | 4 | 0 | 0 | 0 | 0 | 32  | 0 |
| 5 Dunia 3 + Public   | 2 | 2 | 0 | 0 | 0 | 0 | 24  | 0 |
| 6 Polish & RAG Demo  | 2 | 2 | 0 | 0 | 0 | 0 | 16  | 0 |
| **TOTAL P0/P1 demo** | **23** | **19** | **0** | **4** | **0** | **0** | **199** | **8** |
| Deferred (P1/P2/P3)  | 6 | 0 | 0 | 0 | 0 | 6 | 76 | 0 |

### Critical Path (P0)

Urutan wajib — jangan mulai item di kanan sebelum item di kiri **demoable**:

```
PHASE 0 ─▶ INF-1 ─┬─▶ FEAT-1.6 ─▶ FEAT-1.5 ─▶ FEAT-2.1 ─▶ FEAT-2.3 ─▶ FEAT-2.4 ─▶ FEAT-2.7 ─▶ FEAT-3.1
                  ├─▶ INF-2     ─▶ FEAT-1.1                    ─▶ FEAT-2.2 ─▶ FEAT-2.5
                  ├─▶ INF-3                                    ─▶ FEAT-2.6 ─▶ FEAT-3.6
                  └─▶ INF-6 (mock mode dulu)                                ─▶ FEAT-2.8 (last)
```

---

# PHASE 0 — Cleanup (target: 1 hari · 8h)

---

### ✅ CLEAN-1 — Drop apps/contracts + Remove Blockchain Refs

**Meta:** Priority P0 · Phase 0 · Est 2h · Spent 2h · Impact H × Effort L
**Refs:** [gap-analysis §2.1](2026-05-26-nutrio-gap-analysis-action-plan.md#21-blockchain-stack--hapus)
**Started:** 2026-05-26 · **Completed:** 2026-05-26
**Blockers:** —
**Notes:** `pnpm-workspace.yaml` dan `turbo.json` tidak perlu diubah (pakai glob patterns). `apps/api/package.json` punya dependency `@workspace/contract-types` yang sudah dihapus. Blockchain ENV vars dihapus dari root `.env.example`.

**Tasks:**
- [x] Hapus folder `apps/contracts/`
- [x] Hapus `apps/contracts` dari `pnpm-workspace.yaml` — N/A (glob `apps/*`)
- [x] Hapus `apps/contracts` dari `turbo.json` — N/A (tidak tercantum explicit)
- [x] Hapus package `@workspace/contract-types` (`packages/contract-types/` jika ada folder) + uninstall dari consumers
- [x] Hapus ENV `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_RPC_URL` dari `.env.example` semua app
- [x] Update `CLAUDE.md` — hapus seksi "Smart contracts (apps/contracts)" dan "Chain env for frontends"
- [x] Run `pnpm install` — verify tidak ada broken reference (build di-skip, bisa fail unrelated)

---

### ✅ CLEAN-2 — Refactor UI Mock yang Tidak Match PRD v2

**Meta:** Priority P0 · Phase 0 · Est 4h · Spent 4h · Impact M × Effort M
**Refs:** [gap-analysis §2.3](2026-05-26-nutrio-gap-analysis-action-plan.md#23-ui-mock-yang-tidak-match-flow-prd--refactor)
**Started:** 2026-05-26 · **Completed:** 2026-05-26
**Blockers:** —
**Notes:** Pages diarsipkan ke `_archive/` (bukan dihapus) untuk referensi. PWA page.tsx hanya dihapus referensi blockchain — full rewrite di FEAT-2.2.

**Tasks:**
- [x] Move/disable `apps/web/app/portal/(vendor)/checkpoints/page.tsx` → diarsipkan ke `_archive/`, stub "Coming soon" di tempat asli
- [x] Move/disable `apps/web/app/portal/(vendor)/live/page.tsx` → diarsipkan ke `_archive/`, stub "Coming soon" di tempat asli
- [x] Hide menu di CASL: `OperasionalJadwal`, `OperasionalKalkulasi`, `OperasionalKitchen`, `OperasionalStock` — diganti `cannot` di `apps/web/lib/casl.ts`
- [x] Hapus `apps/web/app/asisten/page.tsx` dan `apps/web/app/portal/(shared)/asisten/page.tsx`
- [x] Sekolah confirm: buat alias route stub di `apps/web/app/sekolah/confirm/[qrToken]/page.tsx` (PWA route tetap ada)
- [x] Refactor `apps/pwa/app/page.tsx` — hapus teks "Blockchain Ledger" dan "berbasis AI dan Blockchain"

---

### ✅ CLEAN-3 — Add CASL Subjects untuk Module Baru

**Meta:** Priority P0 · Phase 0 · Est 1h · Spent 1h · Impact L × Effort L
**Refs:** [packages/common/src/types/casl.ts](../../../packages/common/src/types/casl.ts)
**Started:** 2026-05-26 · **Completed:** 2026-05-26
**Blockers:** —
**Notes:** Migration untuk insert permissions di-skip — seeds idempotent sudah cukup untuk fresh demo DB.

**Tasks:**
- [x] Tambah subject baru ke `AppSubject` union: `Eligibility`, `Document`, `Inspection`, `Onboarding`, `MissionControl`, `Checkpoint`, `DeliveryToken`, `SchoolConfirm`, `Scoring`, `Debrief`, `RAG`, `CommandCenter`, `RiskIntelligence`, `Intervention`, `PublicDashboard`
- [x] Update `apps/api/src/modules/auth/casl-ability.factory.ts` — assign default abilities per role
- [x] Update `apps/web/lib/casl.ts` mirror
- [ ] Buat migration baru untuk insert permissions records sesuai subject baru — SKIP (seeds cukup untuk demo)
- [x] Update seed `permission.seed.ts` dan `role-permission.seed.ts`

---

### ✅ CLEAN-4 — Update CLAUDE.md + ENV Templates

**Meta:** Priority P0 · Phase 0 · Est 1h · Spent 1h
**Started:** 2026-05-26 · **Completed:** 2026-05-26
**Blockers:** —
**Notes:** `apps/web/.env.example` dan `apps/pwa/.env.example` dibuat baru (belum ada sebelumnya).

**Tasks:**
- [x] Hapus seksi "Smart contracts" dari `CLAUDE.md`
- [x] Tambah seksi "AI/LLM integration" dengan ENV vars: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_MOCK`
- [x] Tambah seksi "File storage" dengan ENV: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- [x] Update `apps/api/.env.example` + `apps/web/.env.example` + `apps/pwa/.env.example`

---

# PHASE 1 — Fondasi (target: 4 hari · 31h)

---

### ⬜ INF-1 — File Storage (foto upload)

**Meta:** Priority P0 · Phase 1 · Est 6h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis INF-1](2026-05-26-nutrio-gap-analysis-action-plan.md#inf-1--file-storage-foto-upload)
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** —
**Unblocks:** FEAT-1.2, FEAT-2.3, FEAT-2.4, FEAT-2.5

**Tasks:**
- [ ] Pilih provider: MinIO (Docker) vs Supabase Storage vs S3 (rekomendasi: MinIO Docker)
- [ ] Tambah service MinIO di `docker-compose.yml` (port 9000 + 9001 console)
- [ ] `pnpm add @aws-sdk/client-s3` di `apps/api`
- [ ] Buat `apps/api/src/modules/storage/storage.module.ts` + `storage.service.ts`
- [ ] Method `upload(file, bucket, key)` → return `{file_key, file_url, file_hash (SHA-256)}`
- [ ] Method `getSignedUrl(key, expiresIn)` untuk akses sementara
- [ ] Endpoint `POST /storage/upload` (multipart) — return upload result
- [ ] ENV vars: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`
- [ ] Unit test: hash deterministic untuk file yang sama

**Acceptance:**
- [ ] Upload file 2MB sukses dalam < 3 detik (lokal)
- [ ] file_hash sama jika file identik
- [ ] Signed URL bisa diakses tanpa auth selama belum expired

---

### ⬜ INF-2 — WebSocket Layer

**Meta:** Priority P0 · Phase 1 · Est 6h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis INF-2](2026-05-26-nutrio-gap-analysis-action-plan.md#inf-2--websocket-layer)
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** —
**Unblocks:** FEAT-2.1, FEAT-2.6, FEAT-3.1, INF-4

**Tasks:**
- [ ] `pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io` di `apps/api`
- [ ] Buat `apps/api/src/modules/realtime/realtime.module.ts` + `realtime.gateway.ts`
- [ ] Namespace `/ops` (events vendor) + `/bgn` (events BGN)
- [ ] JWT auth middleware untuk handshake — extract `userId` dari token cookie
- [ ] Room join pattern: vendor join room `vendor:{vendorId}`, BGN join room `bgn:all`
- [ ] Buat helper `realtime.service.ts` dengan method `broadcastToVendor(vendorId, event, payload)` dan `broadcastToBGN(event, payload)`
- [ ] Client wrapper `apps/web/lib/realtime-client.ts` + `apps/pwa/lib/realtime-client.ts`
- [ ] Fallback polling tiap 10s saat disconnected (sesuai PRD §5.1)

**Acceptance:**
- [ ] Owner di Mission Control terima event dalam < 1 detik setelah CP submit (latency lokal)
- [ ] Auto-reconnect saat WS terputus
- [ ] JWT invalid → connection ditolak

---

### ⬜ INF-3 — Cron Scheduler

**Meta:** Priority P0 · Phase 1 · Est 3h · Spent 0h · Impact M × Effort L
**Refs:** [gap-analysis INF-3](2026-05-26-nutrio-gap-analysis-action-plan.md#inf-3--cron-scheduler)
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** —
**Unblocks:** FEAT-1.2 (reminder cron), FEAT-1.4 (SLA cron), FEAT-2.6 (force-close + day init), FEAT-3.2 (risk batch)

**Tasks:**
- [ ] `pnpm add @nestjs/schedule` di `apps/api`
- [ ] Register `ScheduleModule.forRoot()` di `app.module.ts`
- [ ] Buat folder `apps/api/src/modules/scheduler/`
- [ ] Job stub: `score-init.cron.ts` (00:01 daily) — placeholder logging
- [ ] Job stub: `force-close.cron.ts` (14:00 daily) — placeholder logging
- [ ] Job stub: `review-sla.cron.ts` (09:00 daily) — placeholder logging
- [ ] Add ENV flag `SCHEDULER_ENABLED=true` untuk on/off di dev

**Acceptance:**
- [ ] Job stub menyala sekali pada interval test (set ke EVERY_MINUTE saat testing)
- [ ] Job error tidak crash API

---

### ⬜ INF-6 — AI/LLM API Integration (basic, mock mode)

**Meta:** Priority P0 · Phase 1 · Est 8h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis INF-6](2026-05-26-nutrio-gap-analysis-action-plan.md#inf-6--aillm-api-integration-basic)
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** —
**Unblocks:** FEAT-1.1, FEAT-1.2, FEAT-2.3 (AI photo validation), FEAT-2.7, FEAT-2.8, FEAT-3.2

**Tasks:**
- [ ] Pilih provider: Anthropic Claude / OpenAI / Gemini (rekomendasi: Anthropic Claude Sonnet 4.6 untuk reasoning + vision)
- [ ] `pnpm add @anthropic-ai/sdk` (atau equivalent)
- [ ] Buat `apps/api/src/modules/ai/ai.module.ts`
- [ ] `vision.service.ts` — `validatePhoto(imageUrl, context)` → `{pass: bool, reason: string, confidence: float}`
- [ ] `llm.service.ts` — `generate(systemPrompt, userMessage, context)` → `{text, sources?[]}`
- [ ] Integrate dengan existing `apps/api/src/modules/cache/cache.service.ts` (cache response untuk dev hemat token)
- [ ] ENV: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_MOCK=true`
- [ ] Mock mode: jika `AI_MOCK=true`, return canned response per `context.feature`
- [ ] Buat fixture file `apps/api/src/modules/ai/mocks.ts` dengan canned responses

**Acceptance:**
- [ ] Live call ke provider dengan API key valid sukses
- [ ] Mock mode return deterministic response < 50ms
- [ ] Vision validate sample photo → output schema valid

---

### ⬜ FEAT-1.6 — Vendor State Machine (Lifecycle)

**Meta:** Priority P0 · Phase 1 · Est 8h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis FEAT-1.6](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-16--vendor-state-machine-lifecycle) · PRD v2 §3.5.A
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** CLEAN-3 (CASL subject)
**Unblocks:** FEAT-1.1, FEAT-1.2, FEAT-1.3, FEAT-1.4, FEAT-1.5, dst.

**Tasks:**
- [ ] Migration baru: tambah enum `vendor_lifecycle_status` dengan values: `ANONYMOUS, ELIGIBILITY_CHECKED, REGISTERED, PREPARING_DOCS, DOCS_SUBMITTED, INSPECTION_SCHEDULED, INSPECTION_COMPLETED, UNDER_REVIEW, REVISION_REQUESTED, APPROVED, ONBOARDING, ACTIVE, SUSPENDED, REVOKED`
- [ ] Migration baru: tambah kolom `vendors.lifecycle_status` (default 'REGISTERED')
- [ ] Buat `apps/api/src/modules/vendors/state-machine.service.ts`
- [ ] Define allowed transitions map (e.g., `REGISTERED → PREPARING_DOCS`, `PREPARING_DOCS → DOCS_SUBMITTED`, dst.)
- [ ] Method `transition(vendorId, event, actorId, reason?)` — validate, update, audit log
- [ ] Setiap transition: insert ke `audit_logs` dengan `entity_type='vendors', action='status_changed', diff={from, to}`
- [ ] Update `apps/web/proxy.ts` redirect logic berdasarkan `lifecycle_status` (existing proxy hanya cek auth — extend dengan state check)
- [ ] Unit test untuk semua transition path (happy + invalid)

**Acceptance:**
- [ ] Invalid transition throws `BadRequestException` dengan pesan jelas
- [ ] Audit log entry tercipta untuk setiap transition sukses
- [ ] Frontend redirect: vendor ACTIVE → /mission-control, ONBOARDING → /onboarding, REGISTERED → /eligibility (etc.)

---

# PHASE 2 — Dunia 1 Skinny (target: 3 hari · 28h)

---

### ⬜ FEAT-1.1 — Eligibility Wizard

**Meta:** Priority P0 · Phase 2 · Est 12h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis FEAT-1.1](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-11--eligibility-wizard) · PRD v2 §4.1
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** INF-6 (RAG hint), FEAT-1.6 (state machine)
**Unblocks:** FEAT-1.5 onboarding (terhubung via roadmap result)

**Tasks:**
- [ ] Migration baru: tabel `eligibility_sessions` (`id UUID, session_token UUID UNIQUE, answers JSONB, roadmap_result JSONB, created_at, expires_at`)
- [ ] Buat `apps/api/src/modules/eligibility/eligibility.module.ts`
- [ ] Endpoint `POST /eligibility/sessions` — create session, return `{session_token}`
- [ ] Endpoint `PATCH /eligibility/sessions/:token` — save partial answers (`{questionId, answer}`)
- [ ] Endpoint `POST /eligibility/sessions/:token/generate` — call LLM → return `PersonalRoadmap`
- [ ] Endpoint `GET /eligibility/sessions/:token` — read result
- [ ] Schema `PersonalRoadmap` di [packages/common/src/types/eligibility.ts](../../../packages/common/src/types/eligibility.ts) (NEW): `{docsHave[], docsMissing[{name, estimatedDays, estimatedCost, regulationRef}], flags[]}`
- [ ] Definisi 7 pertanyaan + multiple choice options di file constant
- [ ] Frontend: route `apps/web/app/eligibility/page.tsx` (pre-auth) — 7 step wizard sequential
- [ ] Komponen `WizardProgressBar` (di `packages/ui/src/components/wizard-progress-bar.tsx`)
- [ ] Komponen `QuestionCard`, `AnswerOptionCard` (tap-friendly, min 48px height)
- [ ] Komponen `RAGHintAccordion` (collapsed default)
- [ ] Frontend: route `apps/web/app/eligibility/[token]/result/page.tsx`
- [ ] Komponen `DocumentStatusCard` (icon ✅/⏳/⚠️ + estimasi)
- [ ] Komponen `RoadmapResultPage` dengan 3 section (Sudah Punya / Perlu Siapkan / Perlu Perhatian)
- [ ] CTA "Mulai Persiapan Dokumen" → `/register/vendor?from_eligibility=<token>`
- [ ] CTA "Kirim Hasil ke Email" (stub: log ke console, P1 enhancement)
- [ ] Browser back guard: modal "Progress akan hilang. Yakin keluar?"
- [ ] RAG hint: call `/ai/llm/generate` proaktif on tap (lazy)
- [ ] Saat register, link `session_token` → vendor record + migrate roadmap ke `documents` table sebagai pending entries

**Acceptance:**
- [ ] Calon vendor selesai wizard + dapat output dalam < 3 menit (manual stopwatch test)
- [ ] Output menyebutkan dokumen spesifik per jawaban (bukan generic) — verify by switching answers
- [ ] Estimasi waktu + biaya tampil per dokumen
- [ ] Wizard tidak bisa skip — direct URL ke step N tanpa N-1 → redirect ke step 1
- [ ] Tanpa login bisa diakses

---

### ⬜ FEAT-1.5 — Onboarding Wizard

**Meta:** Priority P0 · Phase 2 · Est 16h · Spent 0h · Impact H × Effort H
**Refs:** [gap-analysis FEAT-1.5](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-15--onboarding-wizard) · PRD v2 §4.5
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** Cut scope hackathon: team invite pakai email saja (skip WA), simulation pakai video stub (skip interactive).
**Depends on:** FEAT-1.6 (state machine), INF-4 (notification — bisa stub)
**Unblocks:** FEAT-2.1 (mission control hanya untuk ACTIVE vendor)

**Tasks:**
- [ ] Migration baru: tabel `onboarding_progress` (`id, vendor_id UNIQUE, step1_done, step2_done, step3_done, step4_done, step5_done, completed_at`)
- [ ] Migration baru: tabel `vendor_team_members` (`id, vendor_id, user_id NULLABLE, role (kepala_dapur|staf_masak|admin), invite_token, invite_phone, invite_email, invite_sent_at, accepted_at, status (pending|accepted|expired)`)
- [ ] Buat `apps/api/src/modules/onboarding/onboarding.module.ts`
- [ ] Endpoint `GET /onboarding/state` — return current step + lock status
- [ ] Endpoint `POST /onboarding/step1/profile` — save profil (logo, alamat, phone OTP)
- [ ] Endpoint `POST /onboarding/step2/team/invite` — send invite (stub email)
- [ ] Endpoint `GET /onboarding/step2/team` — poll invite status
- [ ] Endpoint `POST /onboarding/step2/team/accept/:token` — public, no auth, accept invite + create user
- [ ] Endpoint `POST /onboarding/step3/simulation/complete` — ack
- [ ] Endpoint `POST /onboarding/step4/supplier/connect` — link vendor ↔ supplier
- [ ] Endpoint `POST /onboarding/complete` — finalize, set `vendors.lifecycle_status = ACTIVE` via state machine
- [ ] Frontend: route `apps/web/app/portal/(vendor)/onboarding/page.tsx`
- [ ] Komponen `OnboardingStepList` (numbered, locked/unlocked)
- [ ] Step 1 UI: upload logo + form profil + OTP verify HP
- [ ] Step 2 UI: form add team member + `TeamMemberRow` + `InvitationStatusPoller` (poll 10s)
- [ ] Step 3 UI: video stub (e.g., YouTube embed about Daily Mode) + checklist "saya sudah nonton"
- [ ] Step 4 UI: `SupplierSearchCard` + filter by lokasi + tombol "Tambah"
- [ ] Step 5 UI: `StarterKitCard` (jadwal minggu pertama auto-gen + checklist + RAG mentor tips)
- [ ] Block rule: step N+1 disabled sampai step N done
- [ ] Cannot skip — direct URL ke step belum-buka → redirect ke step terkecil yang belum done
- [ ] Finalize screen: confetti animation + "Lihat Mission Control" CTA

**Acceptance:**
- [ ] Vendor selesai onboarding dalam < 30 menit (manual test)
- [ ] Step 2 tidak bisa pass tanpa minimal 1 Kepala Dapur accept
- [ ] Setelah complete: `vendors.lifecycle_status = ACTIVE`, semua team members terdaftar
- [ ] Wizard tidak bisa skip (direct URL test)

---

# PHASE 3 — Dunia 2 Core (target: 5 hari · 60h)

---

### ⬜ FEAT-2.1 — Mission Control (Owner)

**Meta:** Priority P0 · Phase 3 · Est 14h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis FEAT-2.1](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-21--mission-control-owner) · PRD v2 §5.1
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** Jika tight: skip WebSocket, pakai polling 10s saja.
**Depends on:** INF-2 (WebSocket), FEAT-1.5 (vendor ACTIVE)
**Unblocks:** —

**Tasks:**
- [ ] Buat `apps/api/src/modules/mission-control/mission-control.module.ts` (read-only aggregator)
- [ ] Endpoint `GET /mission-control/today` — return target porsi, menu, sekolah list, team presence, CP matrix, score, disbursement estimate, streak
- [ ] Endpoint `GET /mission-control/team-presence` — return online status semua team member
- [ ] WebSocket events di namespace `/ops`: `mc:checkpoint:update`, `mc:score:update`, `mc:team:presence`
- [ ] Frontend: route `apps/web/app/portal/(vendor)/mission-control/page.tsx`
- [ ] Komponen `DayHeaderBar` (tanggal, total porsi, menu)
- [ ] Komponen `TeamStatusGrid` (avatar + online dot + tap untuk contact)
- [ ] Komponen `CheckpointMatrix` (rows = sekolah, cols = CP1-4, cells = StatusChip)
- [ ] Komponen `StatusChip` (⬜🟡✅🔴 color-coded)
- [ ] Komponen `ScoreLiveCard` (angka besar animated, trend arrow, streak)
- [ ] Komponen `DisbursementEstimate` (Rp formatted, basis info)
- [ ] Komponen `AlertStrip` sticky bottom (priority-sorted)
- [ ] Komponen `ContactSheet` modal (tap nama team → WA / in-platform notif)
- [ ] Komponen `CheckpointDetail` modal (tap row → foto, timestamp, AI result)
- [ ] Komponen `ScoreBreakdown` modal (tap score → timeline event)
- [ ] Push notification (via INF-4) saat T-30 menit deadline & saat skor turun > 10
- [ ] Layout responsive: 4-panel desktop, stacked cards mobile

**Acceptance:**
- [ ] All info kritikal visible above-the-fold (no scroll) — manual viewport test
- [ ] Score update < 5 detik setelah event (WS) atau < 15 detik (polling fallback)
- [ ] Tap team member → ContactSheet muncul

---

### ⬜ FEAT-2.2 — Daily Mode PWA (Staff)

**Meta:** Priority P0 · Phase 3 · Est 16h · Spent 0h · Impact H × Effort H
**Refs:** [gap-analysis FEAT-2.2](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-22--daily-mode-pwa-staff) · PRD v2 §5.2
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** Cut scope hackathon: defer offline queue (INF-5) ke post-demo. Saat demo: pastikan WiFi stabil.
**Depends on:** FEAT-2.3 (checkpoint backend)
**Unblocks:** —

**Tasks:**
- [ ] Rewrite `apps/pwa/app/page.tsx` jadi PWA Landing PRD-compliant
- [ ] Hanya tampilkan: nama staf + tanggal + porsi + 1 tombol "TUGAS SEKARANG"
- [ ] Hide semua nav (no hamburger, no bottom bar)
- [ ] Lock tombol + countdown jika window CP belum buka
- [ ] "Semua tugas selesai" state saat done
- [ ] Route `apps/pwa/app/cp/[cpId]/context/page.tsx` — CONTEXT screen
- [ ] Route `apps/pwa/app/cp/[cpId]/capture/page.tsx` — CAPTURE (live camera)
- [ ] Route `apps/pwa/app/cp/[cpId]/validate/page.tsx` — VALIDATE (loading + AI result)
- [ ] Route `apps/pwa/app/cp/[cpId]/confirm/page.tsx` — CONFIRM (checklist)
- [ ] Komponen `PWALanding` (single CTA layout)
- [ ] Komponen `CPContextCard` (full-screen heading + body + CTA)
- [ ] Komponen `LiveCameraCapture` — wraps `navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})`, **NO file input**
- [ ] Shutter button: bottom center, ≥ 64px, one-thumb reachable
- [ ] Tombol flip camera (front/back)
- [ ] Komponen `AIValidationScreen` (full-screen overlay, animated, color-coded)
- [ ] Pesan AI fail spesifik (sesuai PRD §5.2 example: "Mundur sedikit agar semua masuk frame")
- [ ] After 3x fail: CTA "Lanjutkan dengan catatan manual review" + apply -5 penalty
- [ ] Komponen `ConfirmChecklist` (visual icons, tap to check)
- [ ] Komponen `CPDoneAnimation` (CSS / Lottie checkmark)
- [ ] Auto-return ke landing setelah confirm
- [ ] **Test:** Attempt file picker via DevTools → toast block "Foto harus diambil langsung"

**Acceptance:**
- [ ] Staf baru selesai 1 CP penuh tanpa instruksi tambahan (manual user test)
- [ ] CP flow selesai dalam < 3 menit per CP
- [ ] Gallery / file picker rejected dengan toast pesan jelas

---

### ⬜ FEAT-2.3 — Checkpoint Flow CP1–CP4 (Backend)

**Meta:** Priority P0 · Phase 3 · Est 24h · Spent 0h · Impact H × Effort H
**Refs:** [gap-analysis FEAT-2.3](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-23--checkpoint-flow-cp1cp4-backend) · PRD v2 §5.3
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** Cut scope: skip Golden Rule countdown UI di FE, backend tetap validate. Fraud check inline → defer ke FEAT-3.3.
**Depends on:** INF-1, INF-2, INF-6, FEAT-2.6 (scoring), FEAT-1.6
**Unblocks:** FEAT-2.4, FEAT-2.5, FEAT-2.7

**Tasks:**
- [ ] Migration baru: enum `cp_type` (`CP1, CP2, CP3, CP4`), `cp_status` (`pending, in_progress, done, failed, force_closed`)
- [ ] Migration baru: tabel `checkpoint_events` (`id, vendor_id, sppg_location_id, cp_type, cp_status, photos JSONB, ai_validation JSONB, score_delta, started_at, completed_at, gps GEOGRAPHY`)
- [ ] Migration baru: tabel `delivery_tokens` (`id, token UUID UNIQUE, vendor_id, sppg_location_id, school_id, porsi_count, generated_at, expired_at, used_at, status`)
- [ ] Migration baru: tabel `school_confirmations` (`id, delivery_token_id UNIQUE, jumlah_diterima, kondisi, masalah_jenis TEXT[], catatan, confirmed_at`)
- [ ] Buat `apps/api/src/modules/checkpoints/checkpoints.module.ts`
- [ ] Endpoint `GET /checkpoints/today` — return state semua CP hari ini
- [ ] Endpoint `POST /checkpoints/:cpType/submit` — multipart upload foto + GPS + metadata
- [ ] Validate state: CP2 hanya boleh submit setelah CP1 done, dst.
- [ ] Validate Golden Rule: `CP2.timestamp - CP1.timestamp < 4 jam` (else trigger -20 penalty)
- [ ] Upload foto via INF-1 → save file_key, file_hash, GPS
- [ ] Call AI validate (INF-6) async → update `ai_validation` saat selesai
- [ ] Call scoring engine (FEAT-2.6) untuk apply penalti
- [ ] Side effect saat CP3 done: generate `delivery_token` (UUID, expired 4 jam) + URL
- [ ] Side effect saat CP4 dual-confirm: trigger Daily Debrief gen + final score
- [ ] WebSocket broadcast `mc:checkpoint:update` ke vendor room
- [ ] Audit log entry per CP event (replaces blockchain hash) — hash field: SHA-256 dari sorted JSON
- [ ] Force-close cron (INF-3) integration: 14:00 set semua pending CP → `force_closed` + apply -50 jika no CP today

**Acceptance:**
- [ ] CP2 submit sebelum CP1 → 400 error "CP1 harus selesai dulu"
- [ ] CP2 submit > 4 jam dari CP1 → -20 score applied + alert
- [ ] CP3 submit success → delivery_token tercipta + URL valid
- [ ] Audit log entry tercipta untuk setiap CP done

---

### ⬜ FEAT-2.6 — Scoring Engine Real-Time

**Meta:** Priority P0 · Phase 3 · Est 14h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis FEAT-2.6](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-26--scoring-engine-real-time) · PRD v2 §5.6
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** INF-2, INF-3, FEAT-1.6
**Unblocks:** FEAT-2.1, FEAT-2.7, FEAT-3.1

**Tasks:**
- [ ] Migration baru: tabel `daily_score_records` (`id, vendor_id, score_date, score_current, score_final NULLABLE, started_at, finalized_at`)
- [ ] Migration baru: tabel `score_events` (`id, daily_score_record_id, event_type, score_delta, reason, regulation_ref, occurred_at`)
- [ ] Trigger: `CREATE RULE no_update_score_events AS ON UPDATE TO score_events DO INSTEAD NOTHING;` + delete protection (append-only)
- [ ] Buat `apps/api/src/modules/scoring/scoring.module.ts`
- [ ] Service method `applyPenalty(vendorId, eventType, context)` — calculate delta sesuai tabel PRD §5.6
- [ ] Penalty table sebagai const (atau load dari `system_config` jika BGN configurable)
- [ ] Method `getCurrentScore(vendorId)` — read latest from `daily_score_records`
- [ ] Method `getDisbursementEstimate(vendorId)` — `target_porsi × base_rate × (score/100)`
- [ ] Endpoint `GET /scoring/today`
- [ ] Endpoint `GET /scoring/history?days=30`
- [ ] WebSocket broadcast `score:update` ke vendor room + `score:critical` ke BGN room saat skor < 60
- [ ] Push notification (INF-4) saat single event delta > 10
- [ ] Hook ke FEAT-2.3 (checkpoint event) untuk auto-apply
- [ ] Hook ke FEAT-2.5 (school confirm "Ada Masalah") untuk auto-apply
- [ ] Hook ke INF-3 force-close cron 14:00

**Acceptance:**
- [ ] Score update < 5 detik via WebSocket setelah event
- [ ] `score_events` table tidak bisa UPDATE atau DELETE (SQL test)
- [ ] Penalti -20 Golden Rule violation applied saat CP2 > 4j

---

# PHASE 4 — Closing the Loop (target: 3 hari · 32h)

---

### ⬜ FEAT-2.4 — Delivery Token (Kurir, no auth)

**Meta:** Priority P0 · Phase 4 · Est 10h · Spent 0h · Impact M × Effort M
**Refs:** [gap-analysis FEAT-2.4](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-24--delivery-token-kurir-no-auth) · PRD v2 §5.4
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** FEAT-2.3 (token generation)
**Unblocks:** FEAT-2.5

**Tasks:**
- [ ] Endpoint public (no auth): `GET /delivery/:token` — return delivery info
- [ ] Endpoint: `POST /delivery/:token/arrived` — capture GPS + timestamp
- [ ] Endpoint: `POST /delivery/:token/photo` — upload foto serah terima (INF-1)
- [ ] Endpoint: `GET /delivery/:token/qr-payload` — return QR token + status
- [ ] Endpoint: `POST /delivery/:token/complete` — finalize kurir side, set status `waiting_school_confirm`
- [ ] Validate token: exists + not expired + not used
- [ ] Frontend public route `apps/web/app/delivery/[token]/page.tsx`
- [ ] Screen 1: `DeliveryInfoCard` (vendor + sekolah + porsi)
- [ ] Screen 2: `GPSCaptureButton` (Geolocation API)
- [ ] Screen 3: `LiveCameraCapture` (same as PWA, no gallery)
- [ ] Screen 4: `QRDisplay` (qrcode.react) + Screen Wake Lock API
- [ ] Screen 5: `ConfirmationSuccess` (one-time, expired page)
- [ ] Cron / timeout (INF-3): T-30 menit window 13:00 jika belum complete → notif owner via INF-4
- [ ] Error states: GPS denied, link expired, link used

**Acceptance:**
- [ ] Kurir selesai CP4 tanpa install / register (manual test)
- [ ] Token sudah pakai → return 410 Gone
- [ ] Screen wake lock aktif saat QR display (test pada mobile real)

---

### ⬜ FEAT-2.5 — School Confirmation (Public)

**Meta:** Priority P0 · Phase 4 · Est 6h · Spent 0h · Impact M × Effort L
**Refs:** [gap-analysis FEAT-2.5](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-25--school-confirmation-public) · PRD v2 §5.5
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** FEAT-2.3, FEAT-2.4
**Unblocks:** —

**Tasks:**
- [ ] Migrate UI dari `apps/pwa/app/sekolah/confirm` → `apps/web/app/sekolah/confirm/[qrToken]/page.tsx`
- [ ] Endpoint public `GET /sekolah/confirm/:qrToken` — validate, return delivery info
- [ ] Endpoint public `POST /sekolah/confirm/:qrToken` — submit `{jumlah_diterima, kondisi, masalah[]}`
- [ ] Anti-double-submit: unique constraint di `school_confirmations.delivery_token_id` → return 409 jika sudah confirm
- [ ] Side effect "Baik": trigger CP4 complete check (jika kurir juga done → CP4 = DONE)
- [ ] Side effect "Ada Masalah": -10 score via FEAT-2.6 + create BGN alert (insert ke `alerts` table)
- [ ] Komponen `ConfirmationForm` (single-scroll)
- [ ] Komponen `PortionInput` (number + ± buttons, default dari vendor)
- [ ] Komponen `ConditionSelector` (2 tombol besar)
- [ ] Komponen `ProblemMultiSelect` (4 checkbox cards)
- [ ] Komponen `ThankYouScreen` (static, prevents double)

**Acceptance:**
- [ ] Sekolah selesai konfirmasi dalam < 1 menit
- [ ] QR sudah scan → return 409 dengan UI message "Sudah dikonfirmasi sebelumnya"
- [ ] "Ada Masalah" → BGN alert tercipta dalam < 5 detik

---

### ⬜ FEAT-2.7 — Daily Debrief

**Meta:** Priority P0 · Phase 4 · Est 10h · Spent 0h · Impact M × Effort M
**Refs:** [gap-analysis FEAT-2.7](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-27--daily-debrief) · PRD v2 §5.7
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** FEAT-2.3, FEAT-2.6, INF-6
**Unblocks:** —

**Tasks:**
- [ ] Migration baru: tabel `daily_debriefs` (`id, vendor_id, date, score_final, narrative_good TEXT, narrative_improve TEXT, recommendations JSONB, fund_estimate DECIMAL, audit_hash VARCHAR(64), generated_at`)
- [ ] Buat `apps/api/src/modules/debrief/debrief.module.ts`
- [ ] Service `generateDebrief(vendorId, date)` — call LLM (INF-6) untuk narrative + recommendations
- [ ] `audit_hash` = SHA-256(sorted JSON of {vendorId, date, score_final, breakdown})
- [ ] Endpoint `GET /debrief/:date` (date = YYYY-MM-DD)
- [ ] Auto-trigger dari FEAT-2.3 (CP4 last done) atau FEAT-2.6 (force-close cron)
- [ ] Frontend: route `apps/web/app/portal/(vendor)/debrief/[date]/page.tsx`
- [ ] Komponen `ScoreFinalCard` (count-up animation, trend, streak)
- [ ] Komponen `PenaltyAccordion` (timeline events with delta)
- [ ] Komponen `AIInsightPanel` (2 sections: berjalan baik / perlu diperbaiki)
- [ ] Komponen `TomorrowPreview` (menu + bahan order shortcut)
- [ ] Komponen `FundEstimateCard` (Rp + scheduled date)
- [ ] Komponen `AuditHashCard` (hash + link ke verify endpoint — replaces BlockchainAnchorCard)
- [ ] Auto-redirect: owner login setelah CP4 last → redirect ke debrief sekali

**Acceptance:**
- [ ] Debrief ter-generate dalam < 30 detik setelah CP4 last
- [ ] Recommendations spesifik ke penalti hari itu (bukan generic) — verify by varying scenarios
- [ ] Hash bisa dipakai untuk verify via `GET /public/verify/:hash`

---

### ⬜ INF-4 — Notification Service (basic)

**Meta:** Priority P0 · Phase 4 · Est 6h · Spent 0h · Impact M × Effort M
**Refs:** [gap-analysis INF-4](2026-05-26-nutrio-gap-analysis-action-plan.md#inf-4--notification-service-basic)
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** WhatsApp/SMS adalah stub untuk demo — log ke console + DB.
**Depends on:** INF-2
**Unblocks:** —

**Tasks:**
- [ ] Buat `apps/api/src/modules/notifications/notifications.module.ts`
- [ ] Tabel `notifications` sudah ada di schema — reuse
- [ ] Service `send(userId, channel, body, metadata)`
- [ ] Channel `in_app` → push via WebSocket room (INF-2)
- [ ] Channel `email` → integrate Resend / Mailtrap (1 ENV: `EMAIL_API_KEY`)
- [ ] Channel `whatsapp` / `sms` → STUB (insert DB + console.log)
- [ ] Endpoint `GET /notifications/me?unread=true` — list
- [ ] Endpoint `POST /notifications/:id/read`
- [ ] Komponen `<NotificationBell>` di layout header portal
- [ ] Subscribe ke WebSocket event `notification:new` → toast + bell badge update

**Acceptance:**
- [ ] In-app notif sampai ke client < 1 detik
- [ ] Email notif sampai ke inbox dalam < 30 detik (test dengan email real)
- [ ] WA/SMS stub log lengkap di DB & console

---

# PHASE 5 — Dunia 3 + Public (target: 3 hari · 24h)

---

### ⬜ FEAT-3.1 — BGN Command Center

**Meta:** Priority P0 · Phase 5 · Est 14h · Spent 0h · Impact H × Effort M
**Refs:** [gap-analysis FEAT-3.1](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-31--bgn-command-center) · PRD v2 §6.1
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** Cut scope: skip map view (Leaflet) jika tight — pakai list saja.
**Depends on:** INF-2, FEAT-2.6, FEAT-2.3
**Unblocks:** FEAT-3.5

**Tasks:**
- [ ] Buat `apps/api/src/modules/command-center/command-center.module.ts`
- [ ] Endpoint `GET /command-center/overview` — 4 stat cards (aktif, belum mulai, kritis, alert pending)
- [ ] Endpoint `GET /command-center/alerts?priority=critical&zone=...&page=...` — paginated feed
- [ ] Endpoint `GET /command-center/sppg/:vendorId/detail` — full detail untuk SPPGDetailSheet
- [ ] WebSocket namespace `/bgn` join room `bgn:all` — broadcast `alert:new`
- [ ] Auto-create alert dari scoring engine (skor < 60 → KRITIS)
- [ ] Auto-create alert dari school confirmation "Ada Masalah"
- [ ] Frontend: route `apps/web/app/portal/(admin)/command-center/page.tsx`
- [ ] Komponen `StatBar` (4 cards, animated update)
- [ ] Komponen `AlertFeed` (2 kolom: KRITIS + PERLU TINDAKAN)
- [ ] Komponen `AlertCard` (icon + nama SPPG + masalah + skor + quick action)
- [ ] Komponen `SPPGDetailSheet` (slide-over 60% desktop / bottom mobile)
- [ ] Komponen `ScoreTrendSparkline` (30-day mini chart)
- [ ] Komponen `InterventionLog` (immutable list)
- [ ] Komponen `ActionToolbar` sticky bottom — tombol intervention (link ke FEAT-3.5, P1)
- [ ] Filter bar sticky: dropdown zona/kecamatan/masalah, toggle map
- [ ] Update CASL: assign `CommandCenter` ke role `admin_bgn` + `dinkes`

**Acceptance:**
- [ ] BGN identify SPPG bermasalah < 30 detik (manual test)
- [ ] Setiap alert tampilkan context cukup tanpa klik lebih dalam
- [ ] Filter zone berjalan tanpa reload halaman

---

### ⬜ FEAT-3.6 — Public Transparency Dashboard

**Meta:** Priority P1 · Phase 5 · Est 10h · Spent 0h · Impact M × Effort M
**Refs:** [gap-analysis FEAT-3.6](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-36--public-transparency-dashboard) · PRD v2 §6.4 (minus blockchain)
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** Replace blockchain explorer dengan internal audit verification endpoint.
**Depends on:** FEAT-2.6, FEAT-2.7
**Unblocks:** —

**Tasks:**
- [ ] Endpoint public `GET /public/overview` (cached 60s) — agregat stats nasional
- [ ] Endpoint public `GET /public/sppg/search?q=...&city=...` — search SPPG
- [ ] Endpoint public `GET /public/sppg/:id` — public profile (no PII)
- [ ] Endpoint public `GET /public/audit-trail/:vendorId?limit=10` — 10 latest audit_log entries dengan data_hash
- [ ] Endpoint public `GET /public/verify/:dataHash` — return original event data untuk verifikasi
- [ ] Rate limit: 100 req/min per IP (pakai cache module atau express-rate-limit)
- [ ] Frontend public route `apps/web/app/publik/page.tsx`
- [ ] Komponen `PublicStatBar` (4 stats)
- [ ] Komponen `PublicSearchBar` (debounced 300ms)
- [ ] Komponen `PublicSPPGCard` (nama + kota + status + skor 30 hari)
- [ ] Komponen `AuditTrailList` (hash + event + date + verify link — replaces BlockchainHashList)
- [ ] Komponen `VerificationGuide` (step-by-step untuk non-technical)
- [ ] Data exposure: NO PII (no nama staf, no HP, no detail finansial)

**Acceptance:**
- [ ] Halaman load < 3 detik (no auth overhead)
- [ ] Search debounce works (no spam request)
- [ ] Audit hash verify endpoint return correct original data

---

# PHASE 6 — Polish & RAG Demo (target: 2 hari · 16h)

---

### ⬜ FEAT-2.8 — RAG Assistant (minimal demo)

**Meta:** Priority P1 · Phase 6 · Est 12h · Spent 0h · Impact H × Effort H
**Refs:** [gap-analysis FEAT-2.8](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-28--rag-assistant-3-modes) · PRD v2 §5.8
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** Cut scope hackathon: ingest 3-5 dokumen sample saja (bukan full juknis BGN corpus). Integrate di 2-3 titik strategis (eligibility wizard hint + document detail + RAG drawer).
**Depends on:** INF-6
**Unblocks:** —

**Tasks:**
- [ ] Migration baru: `CREATE EXTENSION IF NOT EXISTS vector;` + tabel `rag_documents` (`id, doc_name, content_chunk TEXT, embedding VECTOR(1536), source_pasal, source_url`)
- [ ] Buat `apps/api/src/modules/rag/rag.module.ts`
- [ ] Service `ingestDocument(file, metadata)` — chunk (500 token) + embed (via INF-6) + insert
- [ ] Service `query(question, context)` — embed question → pgvector similarity top-K=5 → LLM dengan context → return `{answer, sources[]}`
- [ ] Service `proactive(screen, feature, vendorProfile)` — context-only no question, generate hint
- [ ] Endpoint `POST /rag/query`
- [ ] Endpoint `POST /rag/proactive`
- [ ] Endpoint `POST /admin/rag/ingest` (admin only)
- [ ] Komponen reusable `<RAGProactiveHint context={...} />` — render hint kontekstual
- [ ] Komponen reusable `<RAGAskButton context={...} />` — "Kenapa ini?" / "Cara perbaiki?"
- [ ] Komponen reusable `<RAGDrawer context={...} />` — bottom sheet / side panel deep dive
- [ ] Ingest 3-5 sample dokumen (juknis BGN snippet, SOP sanitasi, regulasi penalti)
- [ ] Integrate `<RAGProactiveHint>` di eligibility wizard step
- [ ] Integrate `<RAGAskButton>` di document detail card
- [ ] Integrate `<RAGDrawer>` global di layout (button trigger di header)
- [ ] PWA visual mode: response format support `image_example_valid` / `image_example_invalid`

**Acceptance:**
- [ ] Response < 3 detik (p90) — 5x test
- [ ] Setiap response menyertakan source pasal/dokumen
- [ ] Demo: tanya "Bagaimana standar suhu masak daging?" → return correct info dengan source

---

### ⬜ POLISH-1 — Demo Data Seeding & Scripted Demo Path

**Meta:** Priority P0 · Phase 6 · Est 4h · Spent 0h
**Started:** — · **Completed:** —
**Blockers:** —
**Notes:** —
**Depends on:** Semua fitur P0
**Unblocks:** —

**Tasks:**
- [ ] Buat seed `apps/api/src/database/seeds/demo-scenario.seed.ts`
- [ ] Seed: 1 vendor ACTIVE + 4 team members + 3 sekolah assigned + 1 supplier connected
- [ ] Seed: vendor lain di various lifecycle states (1 PREPARING_DOCS, 1 UNDER_REVIEW, 1 REVOKED)
- [ ] Seed: alerts contoh untuk Command Center
- [ ] Seed: 1 vendor dengan 7-day score history untuk sparkline
- [ ] Script `demo-run.sh` — reset DB + run all seeds + start all apps
- [ ] Tulis runbook demo (markdown) di `docs/demo-script.md`: skenario step-by-step yang akan didemokan + handle failures
- [ ] Test full path: register → eligibility → onboarding → daily mode → CP1-4 → debrief → BGN alert → public dashboard

---

# DEFERRED (Post-hackathon)

> Section ini tidak dikerjakan untuk demo. Reference saja.

### ⏸ FEAT-1.2 — Document Kanban + AI Validation
**Priority P0 turun ke P1 setelah scope cut** · Est 18h · [§4.2](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-12--document-kanban--ai-validation)
- Defer reason: untuk demo skinny, upload sederhana tanpa Kanban + tanpa AI feedback sudah cukup. Penuh kembangkan post-demo.

### ⏸ FEAT-1.3 — Inspection Booking & Inspector Form
**Priority P1** · Est 18h · [§4.3](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-13--inspection-booking--inspector-form)
- Defer reason: tidak di critical path demo. Bisa diskip di lifecycle (langsung approve via admin tool).

### ⏸ FEAT-1.4 — Application Review Status Tracker
**Priority P1** · Est 10h · [§4.4](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-14--application-review-status-tracker)
- Defer reason: status tracker bisa di-mock untuk demo. State machine FEAT-1.6 sudah cukup untuk back-end.

### ⏸ FEAT-3.2 — Vendor Risk Score
**Priority P1** · Est 8h · [§6.2](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-32--ai-risk-intelligence-vendor-risk-score)
- Defer reason: butuh data historis (7d trend) yang tidak akan ada di demo segar.

### ⏸ FEAT-3.3 — Fraud Pattern Detection
**Priority P2** · Est 10h · [§6.2](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-33--fraud-pattern-detection)
- Defer reason: rules-based bisa post-demo. Demo path tidak menampilkan fraud scenario.

### ⏸ FEAT-3.4 — Supply Chain Early Warning
**Priority P3** · Est 8h · [§6.2](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-34--supply-chain-early-warning)
- Defer reason: butuh data PO real yang tidak ada di demo.

### ⏸ FEAT-3.5 — Intervention Tools
**Priority P1** · Est 14h · [§6.3](2026-05-26-nutrio-gap-analysis-action-plan.md#feat-35--intervention-tools)
- Defer reason: BGN Command Center (FEAT-3.1) sudah cukup untuk demo Dunia 3. Intervention adalah enhancement.

### ⏸ INF-5 — Offline Queue PWA
**Priority P1** · Est 6h · [INF-5](2026-05-26-nutrio-gap-analysis-action-plan.md#inf-5--offline-queue-pwa-indexeddb--service-worker)
- Defer reason: demo dilakukan dengan WiFi stabil. Offline support adalah robustness feature, bukan demo feature.

---

# Catatan Maintenance

## Saat update progress, lakukan:

1. **Update status icon** di header item (⬜ → 🟦 → ✅)
2. **Centang checkbox sub-task** `[ ]` → `[x]` saat selesai
3. **Update `Started:` date** saat mulai (format: YYYY-MM-DD)
4. **Update `Completed:` date** saat done
5. **Update `Spent:` hours** cumulative (e.g., "Spent 3h" → "Spent 5h" setelah 2 jam lagi)
6. **Tulis `Blockers`** jika ada (format: "YYYY-MM-DD: blocker description") — set status ke 🟥
7. **Update dashboard counts di top** secara berkala (mingguan minimum)

## Saat scope berubah:

- **Tambah item baru**: copy template dari item existing, ID baru (e.g., `FEAT-1.7`, `INF-7`)
- **Defer item**: ubah status ke ⏸, pindahkan ke section "DEFERRED" di bawah
- **Cancel item**: hapus tasks tapi keep header dengan status ✅ + note "CANCELLED YYYY-MM-DD: reason"

## Quick reference shortcut

| Action | grep / search |
|--------|---------------|
| All TODO items | `grep "^### ⬜"` |
| All DOING items | `grep "^### 🟦"` |
| All BLOCKED items | `grep "^### 🟥"` |
| All open sub-tasks | `grep "^- \[ \]"` |
| Items in Phase 3 | `grep -A2 "^### .* — FEAT-2"` |
| Total spent so far | `grep "Spent " \| awk` (sum manual) |

---

**End of Tracker.**
