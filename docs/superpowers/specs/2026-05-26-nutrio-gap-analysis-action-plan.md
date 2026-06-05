# Nutrio — Gap Analysis & Action Plan

**Versi:** 1.0
**Tanggal:** 26 Mei 2026
**Author:** Product Audit
**Source of Truth:** PRD v1 + PRD v2 (superset)
**Scope audit code:** `apps/api`, `apps/web`, `apps/pwa`
**Out of scope:** `apps/contracts` (blockchain di-drop — alasan cost + literasi stakeholder)
**Asumsi tim:** 1 solo fullstack developer
**Skala bobot:** Priority (P0/P1/P2/P3) + Impact (H/M/L) × Effort (H/M/L)

> 📋 **Companion tracker (untuk eksekusi & progress):** [2026-05-26-nutrio-action-tracker.md](2026-05-26-nutrio-action-tracker.md)
>
> Dokumen ini adalah **referensi statis** (the "why" + analisis lengkap). Tracker adalah **dokumen kerja** dengan checkbox per sub-task, status icon (⬜🟦✅🟥⏸), dan field untuk track waktu yang sudah dihabiskan. Edit tracker harian — edit dokumen ini hanya jika scope/diagnosis berubah.

---

## Daftar Isi

- [0. Executive Summary](#0-executive-summary)
- [1. Sudah Terimplementasi](#1-sudah-terimplementasi)
- [2. Implementasi Tidak Perlu / Harus Dihapus](#2-implementasi-tidak-perlu--harus-dihapus)
- [3. Belum Terimplementasi (Action Items)](#3-belum-terimplementasi-action-items)
- [4. Roadmap Hackathon Solo Dev](#4-roadmap-hackathon-solo-dev)
- [5. Risiko & Mitigasi](#5-risiko--mitigasi)

---

## 0. Executive Summary

### Diagnosis

| Layer | Status |
|---|---|
| Authentication (JWT + cookies + refresh) | ✅ Solid |
| RBAC (CASL + DB-backed roles/permissions/menus) | ✅ Solid (over-engineered untuk hackathon) |
| Database schema (15+ tabel: vendors, documents, inspections, SOP, risk, QR, alerts, audit, training, marketplace, suppliers, PO flow) | ✅ Schema ada — ❌ tidak ada module NestJS yang menggunakannya |
| Business logic (NestJS modules) | ❌ Belum ada selain auth/users/access-control |
| Frontend (web portal + PWA) | ⚠️ ~30 halaman UI mock dengan data hardcoded — belum tersambung ke backend |
| Three Worlds dari PRD (Perizinan / Operasional / Pengawasan) | ❌ Belum satupun yang fully wired (FE↔BE) |
| AI/ML (RAG, Vision validation, Risk model) | ❌ Belum ada |
| Real-time layer (WebSocket) | ❌ Belum ada |
| File storage (foto checkpoint) | ❌ Belum ada |

### Estimasi Total Effort

| Kategori | Jam |
|---|---|
| Removal & cleanup (Section 2) | ~12 jam |
| P0 (MVP demo wajib) | ~152 jam (≈ 19 working days) |
| P1 (high-value enhancement) | ~88 jam (≈ 11 working days) |
| P2 (nice-to-have demo polish) | ~54 jam (≈ 7 working days) |
| P3 (defer post-hackathon) | ~46 jam |
| **Total full PRD coverage** | **~352 jam (≈ 44 working days)** |

> Realita hackathon solo dev: target **P0 only** untuk demo. Jangan kejar 100% PRD — kejar **demo path yang lengkap** untuk 3 dunia.

### Top 5 Prioritas Mendesak

1. **Drop `apps/contracts` + cleanup referensi blockchain** — 1 jam, unblock decision
2. **Vendor state machine + onboarding flow** (Dunia 1 backbone) — tanpa ini, Dunia 2 tidak punya context vendor aktif
3. **Checkpoint module CP1–CP4** (Dunia 2 jantung produk) — fitur demo paling kuat
4. **Scoring engine real-time** — kalkulasi penalti, tanpa ini Daily Debrief & Mission Control kosong
5. **BGN Command Center basic** — tanpa Dunia 3, value prop "transparansi & pengawasan" tidak terdemo

---

## 1. Sudah Terimplementasi

### 1.1 Authentication & Identity

| Komponen | Lokasi | Catatan |
|---|---|---|
| Login / Register / Refresh JWT | [auth.controller.ts](apps/api/src/modules/auth/auth.controller.ts), [auth.service.ts](apps/api/src/modules/auth/auth.service.ts) | Cookie-based, auto refresh on 401 |
| JWT strategy + guards | [apps/api/src/modules/auth/strategies/jwt.strategy.ts](apps/api/src/modules/auth/strategies/jwt.strategy.ts), [guards/](apps/api/src/modules/auth/guards/) | Functional |
| Refresh token entity & rotation | [refresh-token.entity.ts](apps/api/src/modules/auth/entities/refresh-token.entity.ts) | Per-device tracking |
| Frontend axios interceptor + cookie storage | [apps/web/lib/api-client.ts](apps/web/lib/api-client.ts) | Queue & retry on 401 |
| Login pages | [apps/web/app/login/page.tsx](apps/web/app/login/page.tsx), [apps/pwa/app/login/page.tsx](apps/pwa/app/login/page.tsx) | Functional |
| User entity + seed (admin/vendor/inspector/coordinator/dinkes/school/parent) | [user.entity.ts](apps/api/src/modules/users/entities/user.entity.ts), [user.seed.ts](apps/api/src/database/seeds/user.seed.ts) | Verifikasi di SEEDERS.md |

**Status:** ✅ Cukup untuk demo. Bukan area yang perlu kerja lagi.

### 1.2 Access Control (RBAC + CASL)

| Komponen | Lokasi |
|---|---|
| DB-backed roles/permissions/menus | [apps/api/src/modules/access-control/](apps/api/src/modules/access-control/) |
| CASL ability factory (BE) + mirror (FE) | [casl-ability.factory.ts](apps/api/src/modules/auth/casl-ability.factory.ts), [apps/web/lib/casl.ts](apps/web/lib/casl.ts) |
| Admin pages (roles/permissions/menus CRUD) | [apps/web/app/portal/(admin)/admin/](apps/web/app/portal/(admin)/admin/) |
| Subject/action types | [packages/common/src/types/casl.ts](packages/common/src/types/casl.ts) |
| Seeders | [role.seed.ts](apps/api/src/database/seeds/role.seed.ts), [permission.seed.ts](apps/api/src/database/seeds/permission.seed.ts), [menu.seed.ts](apps/api/src/database/seeds/menu.seed.ts), [role-permission.seed.ts](apps/api/src/database/seeds/role-permission.seed.ts), [role-menu.seed.ts](apps/api/src/database/seeds/role-menu.seed.ts) |

**Status:** ✅ Lebih kuat dari yang dibutuhkan PRD. Tinggal extend subject list saat menambah modul baru (Eligibility, Checkpoint, Score, Intervention, dll.) — lihat Section 3 per fitur.

### 1.3 Database Schema (Migrations)

| Migration | Cakupan |
|---|---|
| [1710400000000-InitialSchema](apps/api/src/database/migrations/1710400000000-InitialSchema.ts) | users, refresh_tokens, **vendors, sppg_locations, documents, sop_templates, sop_template_items, inspections, inspection_items, inspection_photos, risk_scores, qr_codes, qr_scans, alerts, notifications, citizen_reports, marketplace_listings, marketplace_applications, payments, audit_logs (immutable), analytics_daily_snapshots, analytics_regional_snapshots, training_modules, training_module_questions, vendor_training_progress, external_api_logs, open_data_exports, system_config**. PostGIS, full-text, RLS policies, triggers (audit, alerts, sync), views (vendor_dashboard_view, public_vendor_view, inspection_compliance_summary). |
| [1710400000001-SupplierSchema](apps/api/src/database/migrations/1710400000001-SupplierSchema.ts) | suppliers, supplier_documents, supplier_products, supplier_product_photos, purchase_orders, purchase_order_items, po_status_logs, supplier_contracts, supplier_invoices, supplier_reviews + RLS + triggers + views |
| [1710500000000-CreateAccessControlTables](apps/api/src/database/migrations/1710500000000-CreateAccessControlTables.ts) | roles, permissions, role_permissions, menus, role_menus |
| [1710600000000-MigrateUserRoleToRelation](apps/api/src/database/migrations/1710600000000-MigrateUserRoleToRelation.ts) | users.role_id FK, role_legacy untuk backward-compat |
| [1710600000001-AddSupplierToUserRoleEnum](apps/api/src/database/migrations/1710600000001-AddSupplierToUserRoleEnum.ts) | Add `supplier` ke user_role enum |

**Status:** ✅ **Asset terbesar yang sudah ada.** Banyak tabel sudah siap untuk feature PRD. Tapi banyak juga yang tidak align dengan PRD v2 — lihat Section 2.

### 1.4 Frontend UI Shells (Mock)

| Area | Halaman yang sudah ada (UI only, data hardcoded) |
|---|---|
| Landing public | [apps/web/app/page.tsx](apps/web/app/page.tsx) (Hero, Problem, Features, DashboardPreview, Cta dari @workspace/modules/landing) |
| Auth pages | [/login](apps/web/app/login/page.tsx), [/register](apps/web/app/register/page.tsx), [/register/vendor](apps/web/app/register/vendor/page.tsx), [/register/supplier](apps/web/app/register/supplier/page.tsx), [/demo-accounts](apps/web/app/demo-accounts/page.tsx) |
| Vendor portal | [/portal/(vendor)/checkpoints](apps/web/app/portal/(vendor)/checkpoints/page.tsx), [/live](apps/web/app/portal/(vendor)/live/page.tsx), [/incidents](apps/web/app/portal/(vendor)/incidents/page.tsx), [/marketplace](apps/web/app/portal/(vendor)/marketplace/page.tsx), [/menu](apps/web/app/portal/(vendor)/menu/page.tsx), [/operasional/jadwal](apps/web/app/portal/(vendor)/operasional/jadwal/page.tsx), [kalkulasi-bahan](apps/web/app/portal/(vendor)/operasional/kalkulasi-bahan/page.tsx), [kitchen-sop](apps/web/app/portal/(vendor)/operasional/kitchen-sop/page.tsx), [stock-opname](apps/web/app/portal/(vendor)/operasional/stock-opname/page.tsx) |
| Admin BGN portal | [/portal/(admin)/audit](apps/web/app/portal/(admin)/audit/page.tsx), [/funds](apps/web/app/portal/(admin)/funds/page.tsx), [/logistics](apps/web/app/portal/(admin)/logistics/page.tsx), [/map](apps/web/app/portal/(admin)/map/page.tsx), [/reports](apps/web/app/portal/(admin)/reports/page.tsx) |
| Supplier | [/portal/(supplier)/supplier/chat](apps/web/app/portal/(supplier)/supplier/chat/page.tsx), [/products](apps/web/app/portal/(supplier)/supplier/products/page.tsx), [/products/add](apps/web/app/portal/(supplier)/supplier/products/add/page.tsx), [/shop](apps/web/app/portal/(supplier)/supplier/shop/page.tsx) |
| Shared | [/portal/(shared)/asisten](apps/web/app/portal/(shared)/asisten/page.tsx), [/sop](apps/web/app/portal/(shared)/sop/page.tsx), [/settings](apps/web/app/portal/(shared)/settings/page.tsx) |
| PWA | [/](apps/pwa/app/page.tsx), [/operasional/live](apps/pwa/app/operasional/live/page.tsx), [/operasional/history](apps/pwa/app/operasional/history/page.tsx), [/operasional/score](apps/pwa/app/operasional/score/page.tsx), [/orders](apps/pwa/app/orders/page.tsx), [/orders/[id]](apps/pwa/app/orders/[id]/page.tsx), [/sekolah](apps/pwa/app/sekolah/page.tsx), [/sekolah/confirm](apps/pwa/app/sekolah/confirm/page.tsx), [/notifications](apps/pwa/app/notifications/page.tsx), [/publik](apps/pwa/app/publik/page.tsx) |

**Status:** ⚠️ UI shells bagus untuk demo prototype, tapi **tidak ada satupun yang fetch data dari API**. Semua `useState` dengan literal hardcoded. Most layout & visual sudah on-brand — yang dibutuhkan adalah **wiring ke backend + menyesuaikan flow ke PRD v2**.

---

## 2. Implementasi Tidak Perlu / Harus Dihapus

> "Tidak perlu" = di-implementasi tapi tidak ada di PRD v1+v2, atau bertentangan dengan keputusan stakeholder.

### 2.1 Blockchain Stack — ❌ HAPUS

| Item | Aksi | Effort |
|---|---|---|
| `apps/contracts` folder (Foundry + viem deploy script) | Hapus folder + reference di root `pnpm-workspace.yaml`, `turbo.json` | 1 jam |
| `@workspace/contract-types` package | Hapus + uninstall di consumers | 0.5 jam |
| ENV vars `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_RPC_URL` | Hapus dari `.env.example` setiap app | 0.25 jam |
| Referensi "blockchain hash" di UI mock + PRD comment | Replace dengan "audit trail Postgres" terminology di UI yang akan dibuat | inline |
| Update CLAUDE.md → hapus seksi `apps/contracts` | Edit doc | 0.25 jam |

**Alternatif untuk "audit trail":** Pakai existing `audit_logs` table (sudah immutable via `CREATE RULE no_update/no_delete`) + hash kolom optional untuk fingerprint. Sudah ada di [InitialSchema migration line 645–663](apps/api/src/database/migrations/1710400000000-InitialSchema.ts).

**Total effort:** ~2 jam · **Priority: P0** (block keputusan PRD lain)

### 2.2 Schema Overbuilt vs PRD — ⚠️ DEFER / SIMPLIFY

PRD v2 (Section 4.5 step 4) hanya butuh **vendor connect ke supplier saja** (1 langkah onboarding) — tidak butuh full marketplace e-commerce dengan PO, kontrak, invoice, payment, review.

| Tabel | Status | Aksi rekomendasi |
|---|---|---|
| `suppliers`, `supplier_documents`, `supplier_products`, `supplier_product_photos` | Keep | Pakai sebagai katalog supplier untuk onboarding step 4 |
| `purchase_orders`, `purchase_order_items`, `po_status_logs` | Defer | Bukan v1 scope. Tabel boleh tetap, tapi **jangan bangun module/UI untuk hackathon** |
| `supplier_contracts`, `supplier_invoices` | Defer | Sama. Lewati untuk hackathon. |
| `supplier_reviews` | Defer | Sama. |
| `marketplace_listings`, `marketplace_applications` | Defer | Konsep "job board" BGN → vendor tidak ada di PRD v2. Skip untuk hackathon. |
| `payments` (BI SNAP) | Defer + redesign nanti | PRD v2 pakai konsep **disbursement** (BGN → vendor based on skor), bukan vendor bayar subscription. Tabel ini reusable, tapi flow-nya beda. |
| `training_modules`, `training_module_questions`, `vendor_training_progress` | ⚠️ Replace concept | PRD v2 pakai **onboarding wizard interaktif** (Section 4.5), bukan video + quiz formal. Tabel boleh tetap, tapi tidak dibangun module untuknya. |
| `citizen_reports` | Repurpose | Bisa repurpose untuk "Ada Masalah" (Section 5.5) di sekolah confirmation. |
| `analytics_regional_snapshots`, `open_data_exports` | Defer | Bukan v1 scope. |
| `qr_codes`, `qr_scans` | Repurpose | Bisa repurpose untuk delivery token + sekolah confirmation. Schema mostly OK. |

**Aksi konkret:**
- ✅ **JANGAN bangun module/service NestJS untuk PO, contract, invoice, review, marketplace, training, payment, open_data_exports.**
- ✅ **Biarkan schema-nya** (drop migration bisa nanti) supaya tidak mengganggu schema lain.
- ✅ Saat butuh ruang baru untuk fitur PRD (lihat Section 3), tambah migration baru — **jangan modifikasi migration lama yang sudah dipakai**.

**Total effort cleanup:** ~3 jam (mostly review keputusan; tidak ada code yang harus dihapus karena belum dibangun) · **Priority: P1**

### 2.3 UI Mock yang Tidak Match Flow PRD — 🔄 REFACTOR

| Halaman | Masalah | Aksi |
|---|---|---|
| [apps/web/app/portal/(vendor)/checkpoints/page.tsx](apps/web/app/portal/(vendor)/checkpoints/page.tsx) | Pakai jam 02:00 / 05:00 / 07:30 yang tidak match PRD v2 (07:00–13:00). Konsep CP1–CP4 kurang jelas. | Rewrite ke struktur PRD v2 Section 5.3 — atau buang dan ganti dengan Mission Control |
| [apps/web/app/portal/(vendor)/live/page.tsx](apps/web/app/portal/(vendor)/live/page.tsx) | Mencampur konsep dispatch + tiba di sekolah di web portal vendor — di PRD ini di PWA staf, bukan web portal | Pindahkan ke PWA, ubah jadi Mission Control style |
| [apps/web/app/portal/(vendor)/operasional/](apps/web/app/portal/(vendor)/operasional/) (jadwal/kalkulasi-bahan/kitchen-sop/stock-opname) | Tidak ada di PRD v2. Konsep "stock opname" dan "kalkulasi bahan" lebih ke ERP, bukan platform compliance | Skip untuk hackathon. Hide menu via CASL |
| [apps/pwa/app/operasional/](apps/pwa/app/operasional/) (history/live/score) | Live page UI tidak match Daily Mode ultra-minimal di PRD v2 Section 5.2 | Rewrite jadi single-task PWA |
| [apps/pwa/app/orders/](apps/pwa/app/orders/) | Tidak ada di PRD. Konsep "orders" tidak match | Skip atau repurpose untuk daftar sekolah delivery hari ini |
| [apps/pwa/app/sekolah/confirm/page.tsx](apps/pwa/app/sekolah/confirm/page.tsx) | Existing UI bagus & on-track — **PWA scan sendiri**. Tapi PRD v2: sekolah scan QR dari HP biasa tanpa app | Pindah ke web route public (no PWA install needed) atau dual-mode |
| [apps/web/app/asisten/page.tsx](apps/web/app/asisten/page.tsx) + [/portal/(shared)/asisten](apps/web/app/portal/(shared)/asisten/page.tsx) | "Halaman Asisten terpisah" bertentangan dengan PRD v2 Section 5.8 yang explicit: RAG **bukan halaman terpisah**, harus mengalir di seluruh platform | Hapus halaman terpisah, ganti dengan RAG drawer komponen yang dipanggil dari setiap layar relevan |

**Total effort refactor:** ~16 jam · **Priority: P1**

---

## 3. Belum Terimplementasi (Action Items)

> **Format setiap item:**
> - **ID** | **Priority** (P0=demo wajib, P1=demo polish, P2=post-demo, P3=defer) | **Impact** × **Effort** | **Est. hours**
> - **Spec ref:** PRD section
> - **Step-by-step:** detail aksi solo dev

---

### 3.0 Infrastructure (Fondasi) — P0

Tanpa fondasi ini, fitur P0 lain tidak bisa dibangun.

#### INF-1 — File Storage (foto upload)
- **P0** | Impact H × Effort M | **6 jam**
- **Why:** CP1–CP4 foto, dokumen upload (4.2), bukti delivery — semuanya butuh storage.
- **Steps:**
  1. Pilih: MinIO self-hosted (Docker) vs Supabase Storage vs S3-compatible cloud. Rekomendasi **MinIO** untuk demo (1 docker-compose service).
  2. Tambah service di `docker-compose.yml` (jika ada) atau jalankan terpisah di port 9000.
  3. Buat module `apps/api/src/modules/storage/` dengan service `upload(file, bucket, key)`, `getSignedUrl(key)`, `getHash(buffer)`.
  4. Dependency: `@aws-sdk/client-s3` (works dengan MinIO), `crypto` untuk SHA-256.
  5. Tambah ENV: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
  6. Buat helper endpoint `POST /storage/upload` (multipart) — return `{file_key, file_url, file_hash}`.
  7. Tulis 1 unit test untuk hash deterministic.

#### INF-2 — WebSocket Layer
- **P0** | Impact H × Effort M | **6 jam**
- **Why:** Mission Control real-time (5.1), scoring (5.6), BGN Command Center (6.1).
- **Steps:**
  1. Pilih: Socket.io vs native WebSocket (NestJS Gateway). Rekomendasi **Socket.io** (room support out-of-box).
  2. `pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io` di `apps/api`.
  3. Buat module `apps/api/src/modules/realtime/realtime.gateway.ts` dengan namespace `/ops` (operational events) + `/bgn` (BGN events).
  4. Implement room per `vendor_id` — owner join room saat login.
  5. JWT auth middleware untuk handshake.
  6. Buat client wrapper di `apps/web/lib/realtime-client.ts` dan `apps/pwa/lib/realtime-client.ts`.
  7. Fallback polling tiap 10 detik jika disconnected (sesuai PRD 5.1).

#### INF-3 — Cron Scheduler
- **P0** | Impact M × Effort L | **3 jam**
- **Why:** Force-close 14:00 (5.6), SLA cron review (4.4), daily score record init 00:01, risk batch.
- **Steps:**
  1. `pnpm add @nestjs/schedule` di `apps/api`.
  2. Register `ScheduleModule.forRoot()` di `app.module.ts`.
  3. Buat folder `apps/api/src/modules/scheduler/` dengan jobs:
     - `score-init.cron.ts` (00:01 daily) — init `daily_score_record` untuk semua vendor ACTIVE.
     - `force-close.cron.ts` (14:00 daily) — close open checkpoints, apply -50 penalty jika kosong.
     - `review-sla.cron.ts` (09:00 daily) — flag aplikasi review > 10 hari kerja.
  4. Test manual via `@Cron(CronExpression.EVERY_MINUTE)` lalu ganti ke production schedule.

#### INF-4 — Notification Service (basic)
- **P0** | Impact M × Effort M | **6 jam**
- **Why:** Push notification owner saat skor turun (5.6), undangan tim (4.5), peringatan formal (6.3).
- **Steps:**
  1. Tabel `notifications` sudah ada di schema (Section 8).
  2. Buat module `apps/api/src/modules/notifications/` dengan service `send(userId, channel, body)`.
  3. Channel `in_app` — push via WebSocket ke user room (pakai INF-2).
  4. Channel `email` — pakai Resend / Mailtrap untuk demo (1 ENV var).
  5. Channel `whatsapp`/`sms` — **STUB saja** untuk demo, log ke console + insert ke DB. Sebut "WA stub" saat demo.
  6. Frontend: tambah `<NotificationBell>` komponen di header portal yang subscribe ke websocket + show toast.

#### INF-5 — Offline Queue PWA (IndexedDB + Service Worker)
- **P0** | Impact H × Effort M | **6 jam**
- **Why:** PRD 5.2 — staf dapur sinyal buruk, foto harus tetap submit.
- **Steps:**
  1. `apps/pwa` sudah pakai `@ducanh2912/next-pwa` (cek `next.config.js`).
  2. Tambah `idb` package: `pnpm add idb`.
  3. Buat `apps/pwa/lib/offline-queue.ts` dengan API: `enqueue(checkpointPayload)`, `process()`, `count()`.
  4. Service Worker: register sync event saat kembali online → trigger flush queue.
  5. UI: banner kuning persistent saat offline + counter "X foto menunggu".
  6. Saat sukses upload: tandai item di IDB sebagai synced, hapus dari queue.

#### INF-6 — AI/LLM API Integration (basic)
- **P0** | Impact H × Effort M | **8 jam**
- **Why:** RAG (5.8), AI photo validation (CP1–CP4), AI narrative (5.7), Risk Intelligence (6.2).
- **Steps:**
  1. Pilih provider: **Anthropic Claude** atau OpenAI. Untuk hackathon Indonesia, Gemini juga viable.
  2. Tambah module `apps/api/src/modules/ai/` dengan dua service:
     - `vision.service.ts` — `validatePhoto(imageUrl, context)` → return `{pass: bool, reason: string, confidence: float}`.
     - `llm.service.ts` — `generate(systemPrompt, userMessage, context)` → return text + sources.
  3. ENV: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`.
  4. Implement caching layer (pakai existing `apps/api/src/modules/cache/cache.service.ts`) untuk hemat token saat development.
  5. Mock mode flag `AI_MOCK=true` untuk demo offline — return canned response.
  6. **Hackathon hack:** untuk AI validation di demo, threshold confidence rendah (selalu pass) supaya flow tidak gagal di panggung.

**Total Section 3.0:** ~35 jam

---

### 3.1 Dunia 1 — Perizinan

#### FEAT-1.1 — Eligibility Wizard
- **P0** | Impact H × Effort M | **12 jam**
- **Spec ref:** PRD v2 Section 4.1
- **Steps:**
  1. Backend: tabel baru `eligibility_sessions` (migration). Fields: `id, session_token (UUID, no user_id), answers JSONB, roadmap_result JSONB, created_at`.
  2. Backend: module `apps/api/src/modules/eligibility/` dengan endpoint:
     - `POST /eligibility/sessions` — create session, return token
     - `PATCH /eligibility/sessions/:token` — save answer per step
     - `POST /eligibility/sessions/:token/generate` — call LLM, generate `PersonalRoadmap`
  3. Frontend: route `apps/web/app/eligibility/page.tsx` (pre-auth) — 7-step wizard
     - Component `WizardProgressBar`, `QuestionCard`, `AnswerOptionCard`, `RAGHintAccordion`
     - Question schema didefinisikan di [packages/common/src/types/eligibility.ts](packages/common/src/types/eligibility.ts) (NEW)
  4. Frontend: route `/eligibility/[token]/result/page.tsx` — render `RoadmapResultPage`
     - Component `DocumentStatusCard` untuk tiap dokumen
     - CTA "Mulai Persiapan Dokumen" → redirect `/register/vendor?from_eligibility=<token>`
  5. Saat user register, link session token ke vendor record → roadmap dipindahkan ke `documents` table sebagai `pending`.
  6. RAG hint: panggil `/ai/llm/generate` proaktif per pertanyaan (lazy, on tap).

#### FEAT-1.2 — Document Kanban + AI Validation
- **P0** | Impact H × Effort H | **18 jam**
- **Spec ref:** PRD v2 Section 4.2
- **Steps:**
  1. Backend: module `apps/api/src/modules/documents/` (tabel `documents` sudah ada).
     - `GET /documents` — list per vendor with status
     - `POST /documents/:type/upload` — multipart, save to S3, AI validate, return result
     - `GET /documents/:id` — detail + signed URL
     - `POST /documents/:id/replace` — re-upload (e.g., setelah AI fail)
  2. AI validation step: call `vision.service.validatePhoto(url, {docType, vendorName})` → save result ke `documents.status` + `rejection_reason`.
  3. Frontend: `apps/web/app/portal/(vendor)/dokumen/page.tsx` (NEW route)
     - Component `KanbanBoard` (3 kolom)
     - Component `DocumentCard` + `DocumentDetailSheet` (Bottom sheet)
     - Component `UploadDropzone` + `AIValidationToast`
     - Component `RAGDrawer` untuk pertanyaan kontekstual per dokumen
  4. Auto-save progress — store last_edited di `localStorage` + sync ke server.
  5. Cron reminder: integrate ke INF-3, job daily yang flag doc TO DO > 7 hari → notif via INF-4.
  6. Tambah subject `Document` ke [packages/common/src/types/casl.ts](packages/common/src/types/casl.ts).

#### FEAT-1.3 — Inspection Booking & Inspector Form
- **P1** | Impact M × Effort H | **18 jam**
- **Spec ref:** PRD v2 Section 4.3
- **Steps:**
  1. Backend: module `apps/api/src/modules/inspections/` (tabel `inspections` + `inspection_items` + `inspection_photos` + `sop_templates` semua sudah ada).
     - `GET /inspections/slots?city=...` — available slots
     - `POST /inspections/book` — vendor book slot
     - `GET /inspections/:id` — detail
     - `POST /inspections/:id/checklist` — inspector submit checklist items (mobile)
     - `POST /inspections/:id/complete` — finalize inspection
     - Auto-trigger: H-3 cron untuk kirim pre-inspection checklist via INF-4
  2. Frontend (vendor): `/portal/(vendor)/inspeksi/page.tsx` — calendar booking flow
     - Component `CalendarPicker`, `TimeSlotList`, `InspectorCard`, `ChecklistAccordion`
  3. Frontend (inspector): bisa pakai `apps/pwa` atau dedicated route `/portal/(admin)/inspector/[inspectionId]/form/page.tsx` — mobile form untuk BGN officer di lapangan
     - Component `InspectionFormCard` per item, `InspectionResultCard` untuk hasil
  4. Vendor melihat hasil di `/portal/(vendor)/inspeksi/[id]/result/page.tsx` dengan plain-language translation via RAG.

#### FEAT-1.4 — Application Review Status Tracker
- **P1** | Impact M × Effort M | **10 jam**
- **Spec ref:** PRD v2 Section 4.4
- **Steps:**
  1. Backend: module `apps/api/src/modules/applications/` (gunakan `vendors.status` field + `audit_logs` untuk timeline).
     - State machine: ANONYMOUS → ELIGIBILITY_CHECKED → REGISTERED → PREPARING_DOCS → DOCS_SUBMITTED → INSPECTION_SCHEDULED → INSPECTION_COMPLETED → UNDER_REVIEW → APPROVED / REVISION_REQUESTED / REJECTED → ONBOARDING → ACTIVE
     - Tambah ENUM `vendor_lifecycle_status` (migration baru — JANGAN ubah existing `vendor_status`).
     - Endpoints: `GET /applications/me/status`, `GET /applications/me/timeline`, `POST /applications/me/resubmit`
     - BGN side: `POST /applications/:id/approve`, `POST /applications/:id/request_revision`, `POST /applications/:id/reject`
  2. Frontend: `/portal/(vendor)/aplikasi/status/page.tsx`
     - Component `ApplicationStepper`, `TimelineEntry`, `RevisionCard`, `SLAWarningBanner`
  3. SLA cron (INF-3): scan UNDER_REVIEW > 10 working days → trigger SLA warning + notification ke vendor + admin BGN.

#### FEAT-1.5 — Onboarding Wizard
- **P0** | Impact H × Effort H | **16 jam**
- **Spec ref:** PRD v2 Section 4.5
- **Steps:**
  1. Backend: module `apps/api/src/modules/onboarding/` — track step completion in new table `onboarding_progress` (migration baru).
  2. Tabel `vendor_team_members` (migration baru): `id, vendor_id, user_id (nullable, after accept), role (kepala_dapur|staf_masak|admin), invite_token, invite_phone, invite_sent_at, accepted_at, status`.
  3. Backend endpoints:
     - `GET /onboarding/state` — current step + lock status
     - `POST /onboarding/profile` — step 1
     - `POST /onboarding/team/invite` — step 2 (send WA/SMS via INF-4 stub)
     - `GET /onboarding/team` — poll invite status
     - `POST /onboarding/simulation/complete` — step 3 mark done (no validation, hanya ack)
     - `POST /onboarding/supplier/connect` — step 4 (link vendor ↔ supplier)
     - `POST /onboarding/complete` — final, set `vendors.status = ACTIVE`
  4. Frontend: `/portal/(vendor)/onboarding/page.tsx` — 5-step wizard, tidak boleh skip
     - Komponen `OnboardingStepList`, `TeamMemberRow`, `InvitationStatusPoller` (poll tiap 10s), `SimulationOverlay`, `SupplierSearchCard`, `StarterKitCard`
  5. Setelah complete: redirect ke `/portal/(vendor)/mission-control` (5.1) + confetti animation.
  6. Block rule: jika `vendors.status != ACTIVE`, semua route operasional redirect ke `/onboarding`.

#### FEAT-1.6 — Vendor State Machine (Lifecycle)
- **P0** | Impact H × Effort M | **8 jam**
- **Spec ref:** PRD v2 Section 3.5.A
- **Steps:**
  1. Migration baru: tambah enum `vendor_lifecycle_status` + kolom `vendors.lifecycle_status` (default 'REGISTERED').
  2. Buat `apps/api/src/modules/vendors/state-machine.service.ts` dengan method `transition(vendorId, event)` yang validasi allowed transitions.
  3. Setiap module yang transition state (eligibility, documents, inspection, application, onboarding, BGN intervention) panggil service ini — bukan langsung update kolom.
  4. Setiap transition: insert ke `audit_logs` dengan diff.
  5. Frontend guard di `apps/web/proxy.ts` (existing): redirect based on lifecycle (e.g., ACTIVE → mission-control, ONBOARDING → /onboarding, dst.)

**Total Section 3.1:** ~82 jam (P0 saja: 54 jam)

---

### 3.2 Dunia 2 — Operasional Harian

#### FEAT-2.1 — Mission Control (Owner)
- **P0** | Impact H × Effort M | **14 jam**
- **Spec ref:** PRD v2 Section 5.1
- **Steps:**
  1. Backend: module `apps/api/src/modules/mission-control/` — read-only aggregator.
     - `GET /mission-control/today` — return: target porsi hari ini, menu, list sekolah, team presence, CP matrix, live score, disbursement estimate, streak.
     - `GET /mission-control/team-presence` — return online status setiap team member.
  2. WebSocket events (INF-2 namespace `/ops`):
     - `mc:checkpoint:update` — broadcast saat CP submit
     - `mc:score:update` — broadcast saat skor berubah
     - `mc:team:presence` — broadcast saat user login/logout
  3. Frontend: `/portal/(vendor)/mission-control/page.tsx`
     - Komponen `DayHeaderBar`, `TeamStatusGrid`, `CheckpointMatrix`, `StatusChip`, `ScoreLiveCard`, `DisbursementEstimate`, `AlertStrip`
     - Layout responsive: 4-panel desktop, stacked mobile
  4. Push notification (INF-4) saat:
     - Deadline approaching (T-30 menit) → ke owner
     - Skor turun > 10 poin single event → ke owner
  5. Tambah CASL subject `MissionControl`.

#### FEAT-2.2 — Daily Mode PWA (Staff)
- **P0** | Impact H × Effort H | **16 jam**
- **Spec ref:** PRD v2 Section 5.2
- **Steps:**
  1. Rewrite [apps/pwa/app/page.tsx](apps/pwa/app/page.tsx) jadi PRD-compliant Landing:
     - Hanya tampilkan nama staf + tanggal + porsi hari ini + 1 tombol "TUGAS SEKARANG"
     - Lock dengan countdown jika window belum buka
     - Hide semua nav lain (hamburger, bottom bar)
  2. Buat flow CONTEXT → CAPTURE → VALIDATE → CONFIRM sebagai 4 routes:
     - `/cp/[cpId]/context` — penjelasan
     - `/cp/[cpId]/capture` — live camera (lihat FEAT-2.3 detail)
     - `/cp/[cpId]/validate` — loading + result
     - `/cp/[cpId]/confirm` — checklist visual + submit
  3. Component baru di [packages/ui/src/components/](packages/ui/src/components/):
     - `PWALanding` — single CTA landing
     - `CPContextCard` — full-screen context
     - `LiveCameraCapture` — wraps `navigator.mediaDevices.getUserMedia`, **block file input**
     - `AIValidationScreen` — full-screen overlay
     - `ConfirmChecklist` — visual icons (bukan teks)
     - `OfflineBanner` — sticky atas saat offline (pakai INF-5)
     - `CPDoneAnimation` — Lottie / CSS checkmark
  4. **Gallery block:** Tidak boleh ada `<input type="file" accept="image/*">`. Hanya `getUserMedia`. Test di Chrome DevTools "Network: Offline" + manual file drag attempt → toast block.

#### FEAT-2.3 — Checkpoint Flow CP1–CP4 (Backend)
- **P0** | Impact H × Effort H | **24 jam**
- **Spec ref:** PRD v2 Section 5.3
- **Steps:**
  1. Migration baru: tabel `checkpoint_events` (`id, vendor_id, sppg_location_id, cp_type (CP1|CP2|CP3|CP4), status, photos JSONB (array of {file_key, file_hash, gps, timestamp}), ai_validation JSONB, score_delta, created_at`).
  2. Migration baru: tabel `delivery_tokens` (`id, token UUID, vendor_id, sppg_location_id, school_id, porsi_count, generated_at, expired_at, used_at, status`).
  3. Migration baru: tabel `school_confirmations` (`id, delivery_token_id, jumlah_diterima, kondisi (baik|masalah), masalah_jenis TEXT[], catatan, confirmed_at`).
  4. Backend: module `apps/api/src/modules/checkpoints/`:
     - `GET /checkpoints/today` — return today's checkpoint state
     - `POST /checkpoints/:cpType/submit` — submit foto + metadata, trigger AI validate + scoring + WebSocket broadcast
     - Validate state transitions: CP2 hanya bisa submit setelah CP1, dst.
     - Golden Rule check: validate `CP2.timestamp - CP1.timestamp < 4 jam`
  5. Side effects flow saat CP3 submit:
     - Create `delivery_token` (single-use, 4 jam expiry)
     - Generate URL `https://[domain]/delivery/[token]` (handled in FEAT-2.4)
  6. Side effects saat CP4 dual-confirm (kurir + sekolah keduanya done):
     - Trigger Daily Debrief generation (FEAT-2.7)
     - Update scoring
     - Write audit_log entry (alternative untuk "blockchain hash")
  7. Foto upload via INF-1 → simpan `file_key` + `file_hash` + GPS dari client.
  8. AI validation via INF-6 — async setelah submit, update `checkpoint_events.ai_validation` saat selesai.

#### FEAT-2.4 — Delivery Token (Kurir, no auth)
- **P0** | Impact M × Effort M | **10 jam**
- **Spec ref:** PRD v2 Section 5.4
- **Steps:**
  1. Backend endpoint public (no auth, token in URL):
     - `GET /delivery/:token` — return info (vendor name, school name, porsi) jika valid
     - `POST /delivery/:token/arrived` — capture GPS, mark "tiba"
     - `POST /delivery/:token/photo` — upload foto serah terima
     - `GET /delivery/:token/qr-payload` — return QR token untuk display
     - `POST /delivery/:token/complete` — finalize kurir side, set status `waiting_school_confirm`
  2. Frontend public route `/delivery/[token]/page.tsx` di `apps/web` (atau dedicated subdomain) — 4 screen flow (info → arrived/GPS → foto → QR display)
  3. Component baru: `DeliveryInfoCard`, `GPSCaptureButton` (Geolocation API), `QRDisplay` (gunakan `qrcode.react`), `ConfirmationSuccess`.
  4. Screen wake-lock API saat QR ditampilkan supaya HP kurir tidak sleep.
  5. Cron / timeout (INF-3): T-30 menit sebelum window 13:00, jika `delivery_tokens.status != complete` → notif owner.

#### FEAT-2.5 — School Confirmation (Public)
- **P0** | Impact M × Effort L | **6 jam**
- **Spec ref:** PRD v2 Section 5.5
- **Steps:**
  1. Refactor existing [apps/pwa/app/sekolah/confirm/page.tsx](apps/pwa/app/sekolah/confirm/page.tsx) → pindah ke `apps/web/app/sekolah/confirm/[qrToken]/page.tsx` (no PWA install needed per PRD).
  2. Backend endpoint public:
     - `GET /sekolah/confirm/:qrToken` — validate token, return delivery info
     - `POST /sekolah/confirm/:qrToken` — submit `{jumlah_diterima, kondisi, masalah[]}`
  3. Anti-double-submit: tabel `school_confirmations` ada unique constraint on `delivery_token_id`. Return 409 jika sudah confirm.
  4. Side effect "Ada Masalah" → -10 score + create BGN alert flag.
  5. Component: `ConfirmationForm`, `PortionInput`, `ConditionSelector`, `ProblemMultiSelect`, `ThankYouScreen`.

#### FEAT-2.6 — Scoring Engine Real-Time
- **P0** | Impact H × Effort M | **14 jam**
- **Spec ref:** PRD v2 Section 5.6
- **Steps:**
  1. Migration baru: tabel `daily_score_records` (`id, vendor_id, score_date, score_current, score_final NULLABLE, started_at, finalized_at`).
  2. Migration baru: tabel `score_events` (`id, daily_score_record_id, event_type, score_delta, reason, regulation_ref, occurred_at`) — append-only via trigger.
  3. Backend: module `apps/api/src/modules/scoring/`:
     - `applyPenalty(vendorId, eventType, context)` — calculate delta, insert event, update record, broadcast via WebSocket.
     - Penalty table di [system_config](apps/api/src/database/migrations/1710400000000-InitialSchema.ts:1126) atau hardcoded const sesuai PRD v2 Section 5.6 (kept configurable for BGN).
     - `GET /scoring/today` — current day record + events
     - `GET /scoring/history?days=30` — 30-day trend
     - `getDisbursementEstimate(vendorId)` — return `target_porsi × base_rate × (score/100)`.
  4. Hook ke modules lain:
     - `checkpoints` module → call `applyPenalty('CP_LATE_15M', ...)` saat terlambat
     - `school_confirmations` module → call `applyPenalty('PORSI_KURANG', count) atau ('CP4_PROBLEM', ...)` saat ada masalah
     - INF-3 force-close cron 14:00 → call `applyPenalty('NO_CHECKPOINT', ...)` jika zero
  5. WebSocket event `score:update` (FEAT-2.1 sudah subscribe).
  6. Push notif (INF-4) untuk skor turun > 10 single event.

#### FEAT-2.7 — Daily Debrief
- **P0** | Impact M × Effort M | **10 jam**
- **Spec ref:** PRD v2 Section 5.7
- **Steps:**
  1. Backend: module `apps/api/src/modules/debrief/`:
     - `generateDebrief(vendorId, date)` — triggered saat CP4 last done atau force-close cron.
     - Call LLM (INF-6) untuk generate narrative berbasis `score_events` hari itu.
     - Save ke tabel baru `daily_debriefs` (`id, vendor_id, date, score_final, narrative_good, narrative_improve, recommendations, fund_estimate, audit_hash, generated_at`).
     - `audit_hash` = SHA-256 dari JSON sorted (alternatif blockchain — tetap immutable, simpan di `audit_logs`).
     - `GET /debrief/:date` — return record.
  2. Frontend: `/portal/(vendor)/debrief/[date]/page.tsx`
     - Component `ScoreFinalCard`, `PenaltyAccordion`, `AIInsightPanel`, `TomorrowPreview`, `FundEstimateCard`, `AuditHashCard` (replaces BlockchainAnchorCard).
  3. Auto-redirect: owner login setelah CP4 last selesai → redirect ke debrief halaman hari itu (sekali saja).

#### FEAT-2.8 — RAG Assistant (3 modes)
- **P1** | Impact H × Effort H | **20 jam**
- **Spec ref:** PRD v2 Section 5.8
- **Steps:**
  1. Setup pgvector di Postgres — sudah ada extension yang biasa dimuat (uuid-ossp, postgis, pg_trgm). Tambah `CREATE EXTENSION IF NOT EXISTS vector;` di migration baru.
  2. Migration baru: tabel `rag_documents` (id, doc_name, content_chunk TEXT, embedding VECTOR(1536), source_pasal, source_url).
  3. Backend: module `apps/api/src/modules/rag/`:
     - `ingestDocument(file, metadata)` — chunk + embed + insert (admin tool)
     - `query(question, context)` — embed question → vector search top-K → call LLM dengan context → return `{answer, sources[]}`
     - `proactive(screen, feature, vendorProfile)` — generate proactive hint without question
  4. Endpoint:
     - `POST /rag/query` (semua user)
     - `POST /rag/proactive` (semua user)
     - `POST /admin/rag/ingest` (admin only)
  5. Frontend: komponen reusable, **bukan halaman terpisah**:
     - `<RAGProactiveHint context={...} />` — render kontekstual di setiap layar (Eligibility Q, Document card, CP fail, dst.)
     - `<RAGAskButton context={...} />` — "Kenapa ini?" / "Cara perbaiki?"
     - `<RAGDrawer context={...} />` — bottom sheet / side panel deep dive
  6. PWA visual mode: response format mendukung `image_example_valid` / `image_example_invalid` untuk staff dapur.
  7. Hapus halaman terpisah [apps/web/app/asisten/](apps/web/app/asisten/) dan [apps/web/app/portal/(shared)/asisten/](apps/web/app/portal/(shared)/asisten/) — ganti dengan global drawer di layout.
  8. Hackathon hack: untuk demo, ingest 3–5 dokumen sample (juknis BGN snippet, SOP sanitasi) — bukan full corpus.

**Total Section 3.2:** ~114 jam (P0 saja: 94 jam)

---

### 3.3 Dunia 3 — Pengawasan

#### FEAT-3.1 — BGN Command Center
- **P0** | Impact H × Effort M | **14 jam**
- **Spec ref:** PRD v2 Section 6.1
- **Steps:**
  1. Backend: module `apps/api/src/modules/command-center/`:
     - `GET /command-center/overview` — 4 stat cards (SPPG aktif, belum mulai, kritis, alert pending)
     - `GET /command-center/alerts?priority=critical&zone=...` — paginated alert feed
     - `GET /command-center/sppg/:vendorId/detail` — full detail untuk slide-over panel
     - Tabel `alerts` sudah ada. Auto-create alert dari scoring engine + fraud detection.
  2. WebSocket namespace `/bgn` — broadcast new critical alert ke semua BGN user.
  3. Frontend: `/portal/(admin)/command-center/page.tsx` (NEW)
     - Komponen `StatBar`, `AlertFeed` (2 kolom), `AlertCard`, `SPPGDetailSheet` (slide-over), `ScoreTrendSparkline`, `InterventionLog`, `ActionToolbar`.
  4. Filter sticky bar: zone, kecamatan, masalah type. Filter berjalan tanpa reload (client-side).
  5. Map view: integrate Leaflet / Mapbox dengan `vendor.coordinates` + pin color berdasarkan skor. P2 enhancement — skip jika tight.
  6. Tambah CASL subject `CommandCenter` + assign ke role `admin_bgn`.

#### FEAT-3.2 — AI Risk Intelligence (Vendor Risk Score)
- **P1** | Impact M × Effort M | **8 jam**
- **Spec ref:** PRD v2 Section 6.2 (Vendor Risk Score)
- **Steps:**
  1. Migration baru: tabel `vendor_risk_assessments` (`id, vendor_id, risk_score (0-100), probability_suspend_30d, primary_factors JSONB, calculated_at`).
  2. Backend: module `apps/api/src/modules/risk-intelligence/` dengan service `calculateVendorRisk(vendorId)`.
  3. **MVP rules-based** (tidak butuh ML model untuk hackathon):
     - Feature: 7-day avg score
     - Feature: checkpoint completion rate 7d
     - Feature: staff turnover events (count `vendor_team_members` changes)
     - Feature: school complaint rate 7d
     - Rules: weighted sum → risk score
  4. Cron INF-3 daily 02:00 — recalculate semua vendor ACTIVE.
  5. Output muncul di `SPPGDetailSheet` (FEAT-3.1) sebagai "Indikator Kesehatan Jangka Panjang".
  6. Alert: `risk_score > 70` → auto-create alert priority PERLU TINDAKAN.

#### FEAT-3.3 — Fraud Pattern Detection
- **P2** | Impact M × Effort H | **10 jam**
- **Spec ref:** PRD v2 Section 6.2 (Fraud Detection)
- **Steps:**
  1. Migration baru: tabel `fraud_flags` (`id, vendor_id, checkpoint_event_id, signal_type, confidence, details JSONB, reviewed, created_at`).
  2. Backend: module `apps/api/src/modules/fraud-detection/` dengan rules:
     - Burst photos: interval antar foto < 10 detik → flag "foto diduga diambil sekaligus"
     - GPS inconsistency: CP2.gps ≠ CP1.gps > 500m (haversine) → flag
     - Porsi inflation: vendor claim > sekolah confirmed by > 10% → flag
  3. Trigger di module `checkpoints` setelah CP submit — call `fraudDetection.checkAll(event)`.
  4. High confidence (>= 0.7) → alert KRITIS otomatis di Command Center.
  5. Low confidence (<0.5) → masuk queue review BGN.
  6. Skip ML model untuk hackathon — rules-based cukup.

#### FEAT-3.4 — Supply Chain Early Warning
- **P3** | Impact L × Effort H | **8 jam**
- **Spec ref:** PRD v2 Section 6.2 (Supply Chain)
- **Steps:** Defer post-hackathon. Butuh data PO real yang tidak akan ada di demo.

#### FEAT-3.5 — Intervention Tools
- **P1** | Impact M × Effort M | **14 jam**
- **Spec ref:** PRD v2 Section 6.3
- **Steps:**
  1. Migration baru: tabel `interventions` (`id, vendor_id, type (warning|suspend|revoke|inspection|coaching), actor_id, status, level1_approval, level2_approval, reason, supporting_docs JSONB, executed_at, created_at`).
  2. Backend: module `apps/api/src/modules/interventions/`:
     - `POST /interventions/warning` — instant send, no approval
     - `POST /interventions/suspend/request` — create pending, notify L2
     - `POST /interventions/suspend/approve` — L2 approve, execute → `vendors.status = SUSPENDED`
     - `POST /interventions/revoke/...` — similar 2-level approval
     - `POST /interventions/inspection-mendadak` — auto-assign nearest inspector
  3. Frontend (di `SPPGDetailSheet` action toolbar):
     - `<InterventionModal type="warning|suspend|revoke|inspection-mendadak" />`
     - `<ApprovalChainTracker />` — show L1 ✓ / L2 ⏳ / Executed
     - `<WarningLetterPreview />` — rendered surat resmi format
     - `<ImpactWarning />` — red alert sebelum execute suspend/revoke
  4. Notif vendor (INF-4) real-time untuk semua aksi terhadap mereka.
  5. Audit: setiap action insert ke `audit_logs` (existing immutable rule).

#### FEAT-3.6 — Public Transparency Dashboard
- **P1** | Impact M × Effort M | **10 jam**
- **Spec ref:** PRD v2 Section 6.4 (minus blockchain — diganti audit_log hash)
- **Steps:**
  1. Backend public endpoints (no auth):
     - `GET /public/overview` — agregat stats (cached 60s)
     - `GET /public/sppg/search?q=...` — search by nama atau kota
     - `GET /public/sppg/:id` — public profile
     - `GET /public/audit-trail/:vendorId?limit=10` — 10 latest audit_log entries (data_hash)
     - `GET /public/verify/:dataHash` — return original event data (for verifikasi independen)
  2. Frontend public route `/publik/page.tsx` di `apps/web` (atau bisa juga PWA).
     - Komponen `PublicStatBar`, `PublicSearchBar`, `PublicSPPGCard`, `AuditTrailList` (replaces BlockchainHashList — tetap show hash tapi link ke `/public/verify/:hash` bukan blockchain explorer), `VerificationGuide`.
  3. Rate limit: 100 req/min per IP via Cache module / nginx.
  4. **Important:** Hapus semua reference "blockchain explorer" di UI — ganti dengan "Pengecekan Audit Internal" / "Verifikasi Independen".

**Total Section 3.3:** ~64 jam (P0+P1 saja: 38 jam, +14 P1 intervention = 52)

---

## 4. Roadmap Hackathon Solo Dev

### Strategi: kejar **demo path lengkap**, bukan PRD coverage.

> Target demo: end-to-end satu vendor melewati 3 dunia, dilihat BGN, dan publik bisa lihat data agregat. RAG demo di 2–3 titik kontekstual.

### Phase 0 — Cleanup (1 hari, ~8 jam)

| Task | Hours |
|---|---|
| Drop apps/contracts + remove blockchain refs (2.1) | 2 |
| Refactor UI mock yang tidak match flow (2.3) | 4 |
| Add CASL subjects untuk semua module baru | 1 |
| Update CLAUDE.md + ENV templates | 1 |

### Phase 1 — Fondasi (3 hari, ~24 jam)

| Task | Priority | Hours |
|---|---|---|
| INF-1 File Storage (MinIO) | P0 | 6 |
| INF-2 WebSocket | P0 | 6 |
| INF-3 Cron Scheduler | P0 | 3 |
| INF-6 AI/LLM API (mock mode) | P0 | 8 |
| FEAT-1.6 Vendor State Machine | P0 | 8 (overlap dengan INF) |

**Catatan:** INF-4 (notification) dan INF-5 (offline PWA) lebih masuk Phase 2/3.

### Phase 2 — Dunia 1 Skinny (3 hari, ~24 jam)

| Task | Priority | Hours |
|---|---|---|
| FEAT-1.1 Eligibility Wizard | P0 | 12 |
| FEAT-1.5 Onboarding Wizard | P0 | 16 (cut scope: skip team invite via WA, pakai email/manual; skip simulation interaktif, pakai video stub) |
| **Skip P0:** Document Kanban full AI — pakai upload sederhana tanpa AI feedback dulu | — | — |

### Phase 3 — Dunia 2 Core (5 hari, ~40 jam)

| Task | Priority | Hours |
|---|---|---|
| FEAT-2.1 Mission Control | P0 | 14 |
| FEAT-2.3 Checkpoint Backend CP1–CP4 | P0 | 16 (cut: skip Golden Rule countdown UI; skip fraud check inline) |
| FEAT-2.2 Daily Mode PWA | P0 | 16 (cut: offline queue defer ke P1) |
| FEAT-2.6 Scoring Engine | P0 | 14 |

**Phase 3 over budget — tight.** Jika lewat, potong Mission Control jadi static dashboard (no websocket realtime — pakai polling).

### Phase 4 — Closing the Loop (3 hari, ~24 jam)

| Task | Priority | Hours |
|---|---|---|
| FEAT-2.4 Delivery Token | P0 | 10 |
| FEAT-2.5 School Confirmation | P0 | 6 |
| FEAT-2.7 Daily Debrief | P0 | 10 |
| INF-4 Notification Service basic | P0 | 6 |

### Phase 5 — Dunia 3 + Public (3 hari, ~24 jam)

| Task | Priority | Hours |
|---|---|---|
| FEAT-3.1 BGN Command Center | P0 | 14 |
| FEAT-3.6 Public Dashboard | P1 | 10 |

### Phase 6 — Polish & RAG Demo (2 hari, ~16 jam)

| Task | Priority | Hours |
|---|---|---|
| FEAT-2.8 RAG Assistant (minimal — ingest 3 docs, 2 contextual hits, 1 drawer) | P1 | 12 |
| Demo data seeding + scripted demo path | — | 4 |

### Total Phase 0–6: ~160 jam (~20 working days)

Sisa fitur (P1/P2): Document AI validation full, Inspection booking, Application review, Risk Intelligence, Fraud Detection, Intervention Tools, Supply Chain — **defer post-hackathon**.

---

## 5. Risiko & Mitigasi

| Risiko | Probabilitas | Mitigasi |
|---|---|---|
| AI API rate limit / cost saat demo live | Tinggi | Implement `AI_MOCK=true` mode + cache + pre-bake demo responses |
| WebSocket flaky di lingkungan demo (firewall) | Sedang | Fallback polling tiap 10s sudah di spec (PRD 5.1) |
| Live camera + getUserMedia tidak work di laptop demo | Sedang | Test di Chrome + browser fallback message + opsi "demo mode" yang pakai static image |
| Pgvector belum terinstall di Postgres demo | Rendah | Test setup awal Phase 0 + dockumentasi step di CLAUDE.md |
| File storage download speed lambat | Rendah | MinIO local + signed URL cache |
| Scope creep — tergoda implementasi P1/P2 lebih dulu | Tinggi | **Strict gating:** Phase X tidak mulai sebelum Phase X-1 demoable end-to-end |
| Database schema migration conflict | Sedang | JANGAN ubah migration existing. Buat migration baru bertahap |
| Solo dev burnout | Tinggi | Skip P1/P2 tanpa rasa bersalah. Demo path harus solid > feature coverage |

---

## Apendix A — Mapping PRD Section ke Action Item

| PRD v2 Section | Action ID | Phase |
|---|---|---|
| 3.5 Integration Map (state machine) | FEAT-1.6 | 1 |
| 4.1 Eligibility | FEAT-1.1 | 2 |
| 4.2 Document Kanban | FEAT-1.2 | Defer (P0 skinny) |
| 4.3 Inspection Booking | FEAT-1.3 | Defer (P1) |
| 4.4 Application Review | FEAT-1.4 | Defer (P1) |
| 4.5 Onboarding | FEAT-1.5 | 2 |
| 5.1 Mission Control | FEAT-2.1 | 3 |
| 5.2 Daily Mode PWA | FEAT-2.2 | 3 |
| 5.3 Checkpoint CP1–CP4 | FEAT-2.3 | 3 |
| 5.4 Delivery Token | FEAT-2.4 | 4 |
| 5.5 School Confirmation | FEAT-2.5 | 4 |
| 5.6 Scoring Engine | FEAT-2.6 | 3 |
| 5.7 Daily Debrief | FEAT-2.7 | 4 |
| 5.8 RAG Assistant | FEAT-2.8 | 6 |
| 6.1 BGN Command Center | FEAT-3.1 | 5 |
| 6.2 Vendor Risk Score | FEAT-3.2 | Defer (P1) |
| 6.2 Fraud Detection | FEAT-3.3 | Defer (P2) |
| 6.2 Supply Chain | FEAT-3.4 | Defer (P3) |
| 6.3 Intervention Tools | FEAT-3.5 | Defer (P1) |
| 6.4 Public Dashboard | FEAT-3.6 | 5 |
| 6.5 Blockchain | — | **DROPPED** |

---

## Apendix B — Mapping Action Item ke Tabel DB

| Action ID | Tabel yang dipakai/dibuat |
|---|---|
| FEAT-1.1 | `eligibility_sessions` (NEW migration) |
| FEAT-1.2 | `documents` (sudah ada) |
| FEAT-1.3 | `inspections`, `inspection_items`, `inspection_photos`, `sop_templates`, `sop_template_items` (semua sudah ada) |
| FEAT-1.4 | `vendors.lifecycle_status` (NEW kolom + enum), `audit_logs` (sudah ada) |
| FEAT-1.5 | `onboarding_progress` (NEW), `vendor_team_members` (NEW) |
| FEAT-1.6 | `vendors`, `audit_logs` (sudah ada) + state machine service |
| FEAT-2.1 | Read-only aggregator — no new table |
| FEAT-2.2 | Frontend only — no new table |
| FEAT-2.3 | `checkpoint_events` (NEW), `delivery_tokens` (NEW), `school_confirmations` (NEW) |
| FEAT-2.4 | `delivery_tokens` (dari FEAT-2.3) |
| FEAT-2.5 | `school_confirmations` (dari FEAT-2.3), `citizen_reports` (existing, repurpose untuk "Ada Masalah") |
| FEAT-2.6 | `daily_score_records` (NEW), `score_events` (NEW append-only) |
| FEAT-2.7 | `daily_debriefs` (NEW), `audit_logs` (sudah ada) |
| FEAT-2.8 | `rag_documents` (NEW + pgvector ext) |
| FEAT-3.1 | `alerts` (sudah ada), aggregator |
| FEAT-3.2 | `vendor_risk_assessments` (NEW) |
| FEAT-3.3 | `fraud_flags` (NEW) |
| FEAT-3.5 | `interventions` (NEW), `audit_logs` (sudah ada) |
| FEAT-3.6 | View-only on existing tables |

---

**End of Document.**
