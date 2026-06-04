# Nutrio — Skenario Testing Lengkap

> Versi dokumen: 2026-06-03  
> Cakupan: `apps/api` (NestJS), `apps/web` (portal Next.js), `apps/pwa` (field PWA Next.js)

---

## Daftar Isi

1. [Persiapan Lingkungan](#1-persiapan-lingkungan)
2. [Akun Test](#2-akun-test)
3. [Alur Autentikasi — Web Portal](#3-alur-autentikasi--web-portal)
4. [Alur Autentikasi — PWA](#4-alur-autentikasi--pwa)
5. [Matriks Akses Per Role](#5-matriks-akses-per-role)
6. [Skenario: Vendor — Siklus Harian (CP1–CP4)](#6-skenario-vendor--siklus-harian-cp1cp4)
7. [Skenario: Delivery Token Lifecycle](#7-skenario-delivery-token-lifecycle)
8. [Skenario: School Confirm via QR](#8-skenario-school-confirm-via-qr)
9. [Skenario: Vendor Onboarding (5 Step)](#9-skenario-vendor-onboarding-5-step)
10. [Skenario: Eligibility Assessment](#10-skenario-eligibility-assessment)
11. [Skenario: Vendor Lifecycle State Machine](#11-skenario-vendor-lifecycle-state-machine)
12. [Skenario: Scoring & Penalti](#12-skenario-scoring--penalti)
13. [Skenario: Debrief Harian](#13-skenario-debrief-harian)
14. [Skenario: Admin / Command Center](#14-skenario-admin--command-center)
15. [Skenario: PWA Field Operations](#15-skenario-pwa-field-operations)
16. [API Endpoint Reference](#16-api-endpoint-reference)
17. [Edge Cases & Negative Scenarios](#17-edge-cases--negative-scenarios)
18. [WebSocket / Realtime Events](#18-websocket--realtime-events)

---

## 1. Persiapan Lingkungan

### Prasyarat

| Komponen | Versi |
|----------|-------|
| Node.js | >= 20 |
| pnpm | 10.4.1 |
| PostgreSQL | running, `DATABASE_URL` di-set |
| MinIO (S3 lokal) | running di port 9000 |

### Setup Awal

```bash
# Install dependencies
pnpm install

# Jalankan migrations
pnpm db:migrate

# Seed test accounts
pnpm db:seed

# Jalankan semua apps
pnpm dev
```

| App | URL Default |
|-----|-------------|
| API (NestJS) | http://localhost:3333 |
| Web Portal (Next.js) | http://localhost:3000 |
| PWA (Next.js) | http://localhost:3001 |

### Variabel Lingkungan Wajib

**`apps/api/.env`**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/nutrio
AI_MOCK=true
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=nutrio-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3333
```

**`apps/pwa/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3333
```

---

## 2. Akun Test

> Semua akun di-seed oleh `pnpm db:seed`. Semua `isEmailVerified: true`.

### Web Portal (JWT Auth)

| Email | Password | Role | Deskripsi |
|-------|----------|------|-----------|
| `admin@bgn.go.id` | `Admin123!` | admin_bgn | Superuser — akses penuh |
| `vendor@sppg.go.id` | `Vendor123!` | vendor | Mitra SPPG Jakarta |
| `vendor2@sppg.go.id` | `Vendor123!` | vendor | Mitra SPPG Bandung |
| `inspector@bgn.go.id` | `Inspector123!` | inspector | Pengawas BGN Wilayah 1 |
| `inspector2@bgn.go.id` | `Inspector123!` | inspector | Pengawas BGN Wilayah 2 |
| `coordinator@sppg.go.id` | `Coordinator123!` | coordinator | Koordinator SPPG Nasional |
| `coordinator2@sppg.go.id` | `Coordinator123!` | coordinator | Koordinator SPPG Provinsi |
| `dinkes@kesehatan.go.id` | `Dinkes123!` | dinkes | Dinas Kesehatan Jakarta |
| `dinkes2@kesehatan.go.id` | `Dinkes123!` | dinkes | Dinas Kesehatan Bandung |
| `school@sdn01.sch.id` | `School123!` | school | SDN 01 Jakarta Pusat |
| `school2@sdn02.sch.id` | `School123!` | school | SDN 02 Bandung |
| `parent@family.com` | `Parent123!` | parent | Wali Murid Ahmad |

### PWA (Mock Auth — localStorage)

PWA menggunakan mock auth berbasis localStorage. Login melalui halaman `/login` di PWA, pilih role dari daftar berikut:

| Role | Akses Fitur |
|------|-------------|
| `operasional` (vendor field) | CP capture, delivery, live ops |
| `kurir` (delivery driver) | Delivery token management |
| `sekolah` (school) | Konfirmasi penerimaan makanan |

---

## 3. Alur Autentikasi — Web Portal

### 3.1 Login Normal

**URL:** `http://localhost:3000/login`

**Langkah:**
1. Buka URL login di browser.
2. Masukkan email dan password dari tabel akun test.
3. Klik tombol **Masuk**.
4. Verifikasi: browser redirect ke `/portal` (atau ke lifecycle-route jika vendor).

**Expected Result:**
- Cookie `accessToken` (15 menit) dan `refreshToken` (7 hari) di-set.
- Cookie `vendorLifecycle` di-set jika role adalah vendor.
- Redirect sesuai tabel di bawah:

| Role | Redirect Setelah Login |
|------|------------------------|
| admin_bgn | `/portal` → dashboard admin |
| vendor (ACTIVE) | `/portal/mission-control` |
| vendor (ONBOARDING) | `/portal/onboarding` |
| vendor (REGISTERED/under review) | `/portal/status` |
| vendor (ANONYMOUS) | `/eligibility` |
| inspector | `/portal` → dashboard inspector |
| coordinator | `/portal` → dashboard coordinator |
| dinkes | `/portal` → dashboard dinkes |
| school/parent | `/portal` → dashboard publik |

### 3.2 Login Gagal

**Kasus:**
- Email tidak terdaftar → response `401 Unauthorized`, toast error "Login Gagal".
- Password salah → response `401 Unauthorized`, toast error.
- Email format invalid → validasi Zod client-side, field merah, tidak kirim request.
- Password < 8 karakter → validasi Zod client-side.

### 3.3 Auto-Redirect Saat Sudah Login

- Akses `/login` saat cookie `accessToken` ada → redirect ke `/portal`.
- Akses `/` (landing) saat sudah login → redirect ke `/portal`.

### 3.4 Proteksi Route Portal

- Akses `/portal/*` tanpa cookie `accessToken` → redirect ke `/login`.

### 3.5 Token Refresh

- Token akses expire setelah 15 menit.
- Request berikutnya yang mendapat `401` otomatis trigger `POST /auth/refresh` menggunakan `refreshToken` dari cookie.
- Request yang gagal di-queue dan di-retry setelah token baru didapat.
- Jika `refreshToken` juga expired → redirect ke `/login`.

### 3.6 Registrasi Vendor Baru

**URL:** `http://localhost:3000/register`

**Langkah:**
1. Isi form: nama lengkap, email, password, konfirmasi password.
2. Klik **Daftar**.
3. API call: `POST /auth/register`.
4. **Expected:** akun terbuat dengan lifecycle `ANONYMOUS`, redirect ke `/eligibility`.

---

## 4. Alur Autentikasi — PWA

PWA menggunakan mock authentication berbasis `localStorage`. Tidak memerlukan koneksi API untuk login.

### 4.1 Login PWA

**URL:** `http://localhost:3001/login`

**Langkah:**
1. Buka URL login PWA.
2. Pilih role yang tersedia (operasional/kurir/sekolah).
3. Klik login.
4. Verifikasi: redirect ke halaman utama sesuai role.

### 4.2 Logout PWA

1. Buka Settings di PWA.
2. Klik logout.
3. Verifikasi: data auth terhapus dari localStorage, redirect ke `/login`.

---

## 5. Matriks Akses Per Role

### Web Portal — Halaman yang Dapat Diakses

| Halaman / Route | admin | vendor | inspector | coordinator | dinkes | school/parent |
|-----------------|-------|--------|-----------|-------------|--------|---------------|
| `/portal` (Dashboard) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/portal/mission-control` | ❌ | ✅ (ACTIVE) | ❌ | ❌ | ❌ | ❌ |
| `/portal/(admin)/funds` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/portal/(admin)/map` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| `/portal/(admin)/logistics` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `/portal/(vendor)/marketplace` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/portal/(vendor)/debrief` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/portal/(vendor)/onboarding` | ❌ | ✅ (ONBOARDING) | ❌ | ❌ | ❌ | ❌ |
| `/portal/(shared)/settings` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/portal/status` | ❌ | ✅ (non-ACTIVE) | ❌ | ❌ | ❌ | ❌ |

### Cara Test Akses Per Role

Untuk setiap role: login, lalu coba akses URL yang terlarang langsung di address bar.

**Expected:** redirect ke `/portal` atau tampilkan halaman 403/tidak ditemukan. Sidebar tidak menampilkan menu yang tidak diizinkan.

---

## 6. Skenario: Vendor — Siklus Harian (CP1–CP4)

Ini adalah skenario utama operasional vendor setiap hari kerja.

### Prasyarat

- Login sebagai `vendor@sppg.go.id` / `Vendor123!`.
- Vendor harus memiliki record di tabel `vendors` (otomatis dari seed atau setelah onboarding selesai).
- Vendor lifecycle status: `ACTIVE`.

### 6.1 Timeline Checkpoint Hari Ini

**API:** `GET /checkpoints/today` (Bearer token wajib)

**Expected Response:**
```json
[
  {
    "id": "uuid",
    "cpType": "CP1",
    "cpStatus": "pending",
    "completedAt": null
  },
  ...
]
```

Jika belum ada checkpoint hari ini → array kosong `[]`.

Di web portal, buka `/portal` → Vendor Dashboard → bagian "Timeline Kepatuhan". Semua CP tampil sebagai lingkaran putih (belum dikerjakan).

### 6.2 Submit CP1 — Bahan Masuk (via PWA)

**Window waktu:** Sebelum 06:00 (target), toleransi tergantung config.

**Via PWA (operasional):**
1. Login PWA sebagai operasional.
2. Buka halaman CP dari dashboard.
3. Pilih CP1 → halaman context → halaman kamera.
4. Ambil foto bahan baku.
5. Submit → `POST /checkpoints/CP1/submit` dengan multipart `photo` + `gpsLat` + `gpsLng`.

**Expected:**
- Response: `{ id, cpType: "CP1", cpStatus: "done", completedAt: "..." }`.
- CP1 di dashboard berubah jadi lingkaran hijau (✅).

**Via API langsung (curl/Postman):**
```http
POST http://localhost:3333/checkpoints/CP1/submit
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photo: <file>
gpsLat: -6.2088
gpsLng: 106.8456
```

### 6.3 Submit CP2 — Proses Masak

**Window waktu:** 06:00–10:00

**GOLDEN RULE:** CP2 harus disubmit dalam 4 jam setelah CP1. Jika melebihi, sistem mencatat pelanggaran `GOLDEN_RULE_VIOLATION` dan mengurangi skor −15.

**Langkah:** sama dengan CP1, pilih CP2.

**Test Golden Rule Violation:**
1. Submit CP1.
2. Tunggu (atau mock waktu) lebih dari 4 jam.
3. Submit CP2.
4. **Expected:** CP2 tetap bisa di-submit, tapi skor hari ini berkurang −15. Debrief mencatat event `GOLDEN_RULE_VIOLATION`.

### 6.4 Submit CP3 — Porsi Siap

**Window waktu:** 10:00–12:00

Langkah sama. Photo harus menunjukkan porsi makanan yang sudah siap.

### 6.5 Submit CP4 — Distribusi

**Window waktu:** 12:00–13:00

Langkah sama. Photo menunjukkan proses distribusi.

**Expected setelah CP4 selesai:**
- `doneCount` di dashboard = 4/4.
- Skor hari ini dihitung final.
- Delivery token digenerate untuk kurir.

### 6.6 Verifikasi di Web Portal

Setelah semua CP selesai:
1. Login web portal sebagai vendor.
2. Buka Dashboard → "Skor Gizi AI" menampilkan angka dari 0–100.
3. Buka `/portal/(vendor)/debrief` → Debrief AI tersedia untuk tanggal hari ini.

---

## 7. Skenario: Delivery Token Lifecycle

Delivery token adalah token unik yang digenerate setelah CP4 selesai, digunakan kurir untuk mencatat pengiriman ke sekolah.

### State Machine Token

```
pending → in_progress → waiting_school_confirm → used
```

### 7.1 Cek Info Token

**API:** `GET /delivery/:token`

```http
GET http://localhost:3333/delivery/abc123token
```

**Expected Response:**
```json
{
  "token": "abc123token",
  "status": "pending",
  "vendorName": "...",
  "targetSchool": "...",
  "porsiCount": 100
}
```

### 7.2 Kurir Tiba (Record Arrival)

**API:** `POST /delivery/:token/arrived`

```http
POST http://localhost:3333/delivery/abc123token/arrived
Content-Type: application/json

{
  "gpsLat": -6.2088,
  "gpsLng": 106.8456
}
```

**Expected:** status berubah dari `pending` → `in_progress`.

### 7.3 Upload Foto Kedatangan

**API:** `POST /delivery/:token/photo`

```http
POST http://localhost:3333/delivery/abc123token/photo
Content-Type: multipart/form-data

file: <foto_kedatangan.jpg>
```

**Expected:** URL foto tersimpan di S3/MinIO.

### 7.4 Get QR Payload

**API:** `GET /delivery/:token/qr-payload`

**Expected:** data untuk generate QR code yang akan di-scan pihak sekolah.

### 7.5 Selesaikan Pengiriman

**API:** `POST /delivery/:token/complete`

**Expected:** status berubah ke `waiting_school_confirm`.

### 7.6 Verifikasi Status

Setelah `/complete`, token menunggu konfirmasi sekolah. Lihat skenario 8 untuk alur konfirmasi sekolah.

---

## 8. Skenario: School Confirm via QR

Sekolah menerima makanan dan mengkonfirmasi via QR code yang di-scan dari halaman web atau PWA.

### 8.1 Cek Info Pengiriman (via QR Token)

**API:** `GET /sekolah/confirm/:qrToken`

```http
GET http://localhost:3333/sekolah/confirm/qrtoken123
```

**Expected Response:**
```json
{
  "vendorName": "...",
  "menuToday": "...",
  "porsiExpected": 100,
  "deliveredAt": "..."
}
```

**Via Web:** `http://localhost:3000/sekolah/confirm/qrtoken123`

### 8.2 Konfirmasi Penerimaan

**API:** `POST /sekolah/confirm/:qrToken`

```http
POST http://localhost:3333/sekolah/confirm/qrtoken123
Content-Type: application/json

{
  "jumlahDiterima": 98,
  "kondisi": "baik",
  "masalahJenis": [],
  "catatan": ""
}
```

**Expected:** delivery token status → `used`. Skor vendor mendapat update berdasarkan jumlah diterima vs expected.

### 8.3 Konfirmasi dengan Masalah

```http
POST http://localhost:3333/sekolah/confirm/qrtoken123
Content-Type: application/json

{
  "jumlahDiterima": 70,
  "kondisi": "ada_masalah",
  "masalahJenis": ["kurang_porsi", "terlambat"],
  "catatan": "Makanan datang 45 menit terlambat dan porsi kurang 30."
}
```

**Expected:**
- Delivery token status → `used`.
- Event `SCHOOL_COMPLAINT` ditambahkan ke scoring record → penalti −25.
- Notifikasi dikirim ke vendor.

### 8.4 Via PWA Sekolah

1. Login PWA sebagai role `sekolah`.
2. Buka halaman `/sekolah/confirm`.
3. Scan QR code dari kurir.
4. Isi form konfirmasi.
5. Submit.

**Expected:** sama dengan API langsung.

---

## 9. Skenario: Vendor Onboarding (5 Step)

Vendor baru dengan lifecycle `ONBOARDING` harus menyelesaikan 5 langkah sebelum bisa beroperasi.

### Prasyarat

- Vendor lifecycle harus `ONBOARDING` (dicapai setelah vendor di-approve).
- Login sebagai vendor yang sedang onboarding.
- Akses: `/portal/onboarding`.

### 9.1 Cek State Onboarding

**API:** `GET /onboarding/state` (Bearer token wajib)

**Expected Response:**
```json
{
  "currentStep": 1,
  "completedSteps": [],
  "status": "in_progress"
}
```

### 9.2 Step 1 — Profil Dapur

**API:** `POST /onboarding/step1/profile`

```http
POST http://localhost:3333/onboarding/step1/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "kitchenName": "Dapur Sehat Ibu Sari",
  "address": "Jl. Merdeka No. 10, Jakarta Pusat",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "capacity": 500,
  "phone": "+62812345678"
}
```

**Expected:** `currentStep` naik ke 2.

### 9.3 Step 2 — Tim & Anggota

**Undang anggota tim:**

```http
POST http://localhost:3333/onboarding/step2/team/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@example.com",
  "role": "cook"
}
```

**Cek status tim:**

```http
GET http://localhost:3333/onboarding/step2/team
Authorization: Bearer <token>
```

**Terima undangan (tanpa auth):**

```http
POST http://localhost:3333/onboarding/step2/team/accept/:inviteToken
Content-Type: application/json

{
  "fullName": "Nama Staff",
  "password": "Password123!"
}
```

### 9.4 Step 3 — Simulasi CP

**API:** `POST /onboarding/step3/simulation/complete`

```http
POST http://localhost:3333/onboarding/step3/simulation/complete
Authorization: Bearer <token>
```

**Expected:** step 3 selesai, `currentStep` = 4.

### 9.5 Step 4 — Koneksi Supplier

**Cari supplier:**

```http
GET http://localhost:3333/onboarding/step4/suppliers?page=1&limit=10
Authorization: Bearer <token>
```

**Hubungkan supplier:**

```http
POST http://localhost:3333/onboarding/step4/supplier/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplierId": "supplier-uuid"
}
```

### 9.6 Step 5 — Selesai Onboarding

**API:** `POST /onboarding/complete`

```http
POST http://localhost:3333/onboarding/complete
Authorization: Bearer <token>
```

**Expected:**
- Vendor lifecycle berubah ke `ACTIVE`.
- Cookie `vendorLifecycle` diperbarui.
- Redirect ke `/portal/mission-control`.

---

## 10. Skenario: Eligibility Assessment

Calon vendor baru yang belum terdaftar mengakses eligibility checker untuk mengetahui kelayakan.

### 10.1 Buat Sesi Eligibility (tanpa auth)

**API:** `POST /eligibility/sessions`

```http
POST http://localhost:3333/eligibility/sessions
```

**Expected Response:**
```json
{
  "token": "eligibility-session-token",
  "questions": [...],
  "currentQuestion": 0
}
```

**Via Web:** `http://localhost:3000/eligibility`

### 10.2 Simpan Jawaban

**API:** `PATCH /eligibility/sessions/:token`

```http
PATCH http://localhost:3333/eligibility/sessions/eligibility-session-token
Content-Type: application/json

{
  "questionId": "q1",
  "answer": "yes"
}
```

Ulangi untuk setiap pertanyaan.

### 10.3 Generate Roadmap (AI)

**API:** `POST /eligibility/sessions/:token/generate`

```http
POST http://localhost:3333/eligibility/sessions/eligibility-session-token/generate
```

**Expected:** AI (atau mock jika `AI_MOCK=true`) menganalisis jawaban dan mengembalikan roadmap persiapan.

### 10.4 Cek Sesi

**API:** `GET /eligibility/sessions/:token`

```http
GET http://localhost:3333/eligibility/sessions/eligibility-session-token
```

**Expected:** seluruh data sesi termasuk jawaban dan roadmap.

---

## 11. Skenario: Vendor Lifecycle State Machine

Vendor melewati serangkaian status sebelum bisa beroperasi.

### State Machine

```
ANONYMOUS
    ↓ (setelah eligibility)
ELIGIBILITY_CHECKED
    ↓ (setelah register)
REGISTERED
    ↓ (dokumen lengkap)
PREPARING_DOCS → DOCS_SUBMITTED
    ↓ (jadwal inspeksi)
INSPECTION_SCHEDULED → INSPECTION_COMPLETED
    ↓ (review admin)
UNDER_REVIEW
    ↓ (revisi jika perlu)
REVISION_REQUESTED ↔ UNDER_REVIEW
    ↓ (disetujui)
APPROVED
    ↓ (mulai onboarding)
ONBOARDING
    ↓ (selesai onboarding)
ACTIVE
    ↓ (suspensi jika skor rendah)
SUSPENDED ↔ ACTIVE
    ↓ (pencabutan izin)
REVOKED
```

### Redirect Portal per Lifecycle

| Status | URL Portal |
|--------|------------|
| ANONYMOUS / ELIGIBILITY_CHECKED | `/eligibility` |
| REGISTERED → APPROVED | `/portal/status` |
| ONBOARDING | `/portal/onboarding` |
| ACTIVE | `/portal/mission-control` |
| SUSPENDED | `/portal/suspended` |
| REVOKED | `/portal/revoked` |

### Cara Test

1. Seed vendor baru dengan lifecycle tertentu (via `psql` atau seeder).
2. Login sebagai vendor tersebut.
3. Akses `/portal`.
4. Verifikasi redirect sesuai tabel di atas.

---

## 12. Skenario: Scoring & Penalti

Sistem scoring menghitung skor harian vendor berdasarkan kepatuhan CP dan feedback sekolah.

### Skor Awal dan Penalti

| Event | Dampak Skor |
|-------|-------------|
| Semua 4 CP selesai tepat waktu | 100 (baseline) |
| `GOLDEN_RULE_VIOLATION` (CP2 > 4 jam setelah CP1) | −15 |
| `PHOTO_QUALITY_POOR` (kualitas foto buruk per AI) | −10 |
| `DELIVERY_LATE` (pengiriman terlambat) | −20 |
| `SCHOOL_COMPLAINT` (keluhan sekolah via QR confirm) | −25 |

### 12.1 Cek Skor Hari Ini

**API:** `GET /scoring/today` (Bearer token wajib)

**Expected Response:**
```json
{
  "score": 85,
  "record": { ... },
  "events": [
    {
      "type": "DELIVERY_LATE",
      "penalty": -20,
      "createdAt": "..."
    }
  ],
  "disbursementEstimate": 1250000
}
```

**Via Web:** Dashboard Vendor → kartu "Skor Gizi AI".

### 12.2 Riwayat Skor

**API:** `GET /scoring/history?days=30` (Bearer token wajib)

```http
GET http://localhost:3333/scoring/history?days=7
Authorization: Bearer <token>
```

**Expected:** array skor harian 7 hari terakhir.

### 12.3 Skenario Lengkap Trigger Semua Penalti

1. Submit CP1.
2. Tunggu/mock > 4 jam → submit CP2 → `GOLDEN_RULE_VIOLATION` (−15).
3. Submit CP3 dengan foto resolusi sangat rendah → `PHOTO_QUALITY_POOR` (−10) jika AI aktif.
4. Submit CP4 → generate delivery token.
5. Kurir tiba terlambat → `DELIVERY_LATE` (−20).
6. Sekolah konfirmasi dengan `kondisi: "ada_masalah"` → `SCHOOL_COMPLAINT` (−25).
7. **Final score:** 100 − 15 − 10 − 20 − 25 = **30/100**.
8. Verifikasi di `GET /scoring/today`.

---

## 13. Skenario: Debrief Harian

Debrief adalah ringkasan AI per hari yang dibuat setelah operasional selesai.

### 13.1 Get atau Generate Debrief

**API:** `GET /debrief/:date` (Bearer token wajib)

```http
GET http://localhost:3333/debrief/2026-06-03
Authorization: Bearer <vendor-token>
```

**Expected:**
- Jika debrief sudah ada → return data.
- Jika belum → AI (atau mock) men-generate debrief baru.

**Response:**
```json
{
  "date": "2026-06-03",
  "summary": "Operasional hari ini berjalan dengan 3 dari 4 checkpoint selesai...",
  "score": 75,
  "events": [...],
  "dataHash": "sha256hash..."
}
```

### 13.2 Verifikasi Hash (Publik)

**API:** `GET /public/verify/:dataHash`

```http
GET http://localhost:3333/public/verify/sha256hash...
```

**Expected:** konfirmasi bahwa debrief adalah data asli yang tidak dimodifikasi.

### 13.3 Via Web Portal

1. Login sebagai vendor ACTIVE.
2. Buka `/portal/(vendor)/debrief`.
3. Pilih tanggal hari ini atau tanggal sebelumnya.
4. Verifikasi ringkasan AI muncul beserta detail event.

---

## 14. Skenario: Admin / Command Center

### 14.1 Dashboard Admin

**URL Web:** `/portal` (login sebagai `admin@bgn.go.id`)

**Expected:**
- Kartu "Vendor Kritis" menampilkan angka dari API `/command-center/overview`.
- Kartu "Vendor Aktif Hari Ini" dari API.
- Tabel alert dari `GET /command-center/alerts`.

### 14.2 Overview Command Center

**API:** `GET /command-center/overview` (Bearer token wajib)

```http
GET http://localhost:3333/command-center/overview
Authorization: Bearer <admin-token>
```

**Expected Response:**
```json
{
  "totalActive": 45,
  "notStarted": 5,
  "critical": 2,
  "alertPending": 8
}
```

### 14.3 Daftar Vendor Aktif

**API:** `GET /command-center/vendors` (Bearer token wajib)

```http
GET http://localhost:3333/command-center/vendors
Authorization: Bearer <admin-token>
```

### 14.4 Alert Queue

**API:** `GET /command-center/alerts` (Bearer token wajib)

```http
GET http://localhost:3333/command-center/alerts?severity=critical&page=1&limit=20
Authorization: Bearer <admin-token>
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "vendorName": "...",
      "alertType": "SCORE_CRITICAL",
      "severity": "critical",
      "title": "...",
      "body": "...",
      "createdAt": "..."
    }
  ],
  "total": 8
}
```

### 14.5 Tandai Alert Dibaca

**API:** `PATCH /command-center/alerts/:id/read`

```http
PATCH http://localhost:3333/command-center/alerts/alert-uuid/read
Authorization: Bearer <admin-token>
```

### 14.6 Detail SPPG

**API:** `GET /command-center/sppg/:vendorId`

```http
GET http://localhost:3333/command-center/sppg/vendor-uuid
Authorization: Bearer <admin-token>
```

### 14.7 Halaman Peta (`/portal/(admin)/map`)

1. Login sebagai admin.
2. Buka `/portal/(admin)/map`.
3. Verifikasi: kartu stat menampilkan `totalActiveVendors` dari `GET /public/overview`.
4. Daftar vendor muncul dengan badge status berdasarkan skor.

### 14.8 Halaman Dana (`/portal/(admin)/funds`)

1. Login sebagai admin.
2. Buka `/portal/(admin)/funds`.
3. Verifikasi: chart menampilkan data kosong (belum ada transaksi), tabel riwayat kosong.

### 14.9 Halaman Logistik (`/portal/(admin)/logistics`)

1. Login sebagai admin.
2. Buka `/portal/(admin)/logistics`.
3. Verifikasi: metric cards dari `/command-center/overview` dan `/public/overview`.
4. Tabel pengiriman: empty state jika belum ada data.

---

## 15. Skenario: PWA Field Operations

### 15.1 Landing Page PWA

**URL:** `http://localhost:3001`

Berisi daftar task harian CP yang harus diselesaikan operasional. Menampilkan progress CP berdasarkan status terkini.

### 15.2 CP Context Page

**URL:** `/cp/:cpId/context`

Menampilkan panduan dan konteks apa yang harus difoto untuk checkpoint ini.

### 15.3 CP Capture Page

**URL:** `/cp/:cpId/capture`

Halaman kamera untuk mengambil foto checkpoint. Menggunakan kamera device via browser API.

**Test:**
1. Buka halaman di browser mobile atau browser dengan kamera.
2. Izinkan akses kamera.
3. Foto objek relevan.
4. Klik "Ambil Foto".

### 15.4 CP Validate Page

**URL:** `/cp/:cpId/validate`

Menampilkan preview foto yang diambil beserta analisis AI (jika tidak mock).

**Expected:**
- Foto ditampilkan.
- Status validasi dari AI (lolos / perlu foto ulang).

### 15.5 CP Confirm Page

**URL:** `/cp/:cpId/confirm`

Konfirmasi final sebelum submit ke API.

**Expected:**
- Setelah konfirmasi: `POST /checkpoints/:cpType/submit` dipanggil.
- Redirect ke halaman utama dengan CP terupdate.

### 15.6 Live Operations

**URL:** `/operasional/live`

Halaman live monitoring untuk operasional aktif, menampilkan status realtime via WebSocket.

### 15.7 Score Page

**URL:** `/operasional/score`

Menampilkan skor harian beserta breakdown event penalti.

### 15.8 History Page

**URL:** `/operasional/history`

Riwayat operasional hari-hari sebelumnya.

### 15.9 Orders Page

**URL:** `/orders`

Daftar order/delivery yang harus dikerjakan kurir.

**URL Detail:** `/orders/:id`

Detail spesifik satu order termasuk alamat sekolah, jumlah porsi, dan status token.

### 15.10 Notifikasi

**URL:** `/notifications`

Daftar notifikasi masuk untuk user yang sedang login.

**API:** `GET /notifications/me`

```http
GET http://localhost:3333/notifications/me
Authorization: Bearer <token>
```

**Filter hanya yang belum dibaca:**

```http
GET http://localhost:3333/notifications/me?unread=true
```

**Tandai notifikasi dibaca:**

```http
POST http://localhost:3333/notifications/:id/read
Authorization: Bearer <token>
```

### 15.11 Settings PWA

**URL:** `/settings`

Pengaturan akun PWA: logout, versi app, dll.

---

## 16. API Endpoint Reference

### Auth

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/auth/me` | JWT | Profil user yang sedang login |
| `POST` | `/auth/register` | — | Registrasi akun baru |
| `POST` | `/auth/login` | — | Login, mendapatkan token |
| `POST` | `/auth/refresh` | — | Refresh access token |

### Checkpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/checkpoints/today` | JWT | Status CP hari ini milik vendor |
| `POST` | `/checkpoints/:cpType/submit` | JWT | Submit foto CP (multipart) |

### Delivery

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/delivery/:token` | — | Info token pengiriman |
| `POST` | `/delivery/:token/arrived` | — | Catat kedatangan kurir |
| `POST` | `/delivery/:token/photo` | — | Upload foto kedatangan |
| `GET` | `/delivery/:token/qr-payload` | — | Data QR untuk sekolah |
| `POST` | `/delivery/:token/complete` | — | Selesaikan pengiriman |

### School Confirm

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/sekolah/confirm/:qrToken` | — | Info pengiriman via QR |
| `POST` | `/sekolah/confirm/:qrToken` | — | Konfirmasi penerimaan |

### Eligibility

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/eligibility/sessions` | — | Buat sesi eligibility |
| `PATCH` | `/eligibility/sessions/:token` | — | Simpan jawaban |
| `POST` | `/eligibility/sessions/:token/generate` | — | Generate roadmap AI |
| `GET` | `/eligibility/sessions/:token` | — | Cek sesi |

### Onboarding

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/onboarding/state` | JWT | State onboarding saat ini |
| `POST` | `/onboarding/step1/profile` | JWT | Simpan profil dapur |
| `POST` | `/onboarding/step2/team/invite` | JWT | Undang anggota tim |
| `GET` | `/onboarding/step2/team` | JWT | Status tim |
| `POST` | `/onboarding/step2/team/accept/:token` | — | Terima undangan tim |
| `POST` | `/onboarding/step3/simulation/complete` | JWT | Selesaikan simulasi CP |
| `GET` | `/onboarding/step4/suppliers` | JWT | Daftar supplier tersedia |
| `POST` | `/onboarding/step4/supplier/connect` | JWT | Hubungkan supplier |
| `POST` | `/onboarding/complete` | JWT | Selesaikan onboarding |

### Scoring

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/scoring/today` | JWT | Skor + events + estimasi cair |
| `GET` | `/scoring/history?days=N` | JWT | Riwayat skor N hari |

### Mission Control

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/mission-control/today` | JWT | Data misi hari ini |
| `GET` | `/mission-control/team-presence` | JWT | Status kehadiran tim |

### Debrief

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/debrief/:date` | JWT | Get/generate debrief tanggal |
| `GET` | `/public/verify/:dataHash` | — | Verifikasi hash debrief |

### Command Center (Admin)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/command-center/overview` | JWT | Statistik vendor nasional |
| `GET` | `/command-center/vendors` | JWT | Daftar vendor aktif |
| `GET` | `/command-center/alerts` | JWT | Alert queue |
| `PATCH` | `/command-center/alerts/:id/read` | JWT | Tandai alert dibaca |
| `GET` | `/command-center/sppg/:vendorId` | JWT | Detail profil SPPG |

### Public

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/public/overview` | — | Statistik publik nasional |
| `GET` | `/public/sppg/search?q=&city=&limit=` | — | Cari SPPG/vendor |
| `GET` | `/public/sppg/:id` | — | Profil publik vendor |
| `GET` | `/public/audit-trail/:vendorId?limit=` | — | Audit trail vendor |

### Notifications

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/notifications/me?unread=true` | JWT | Daftar notifikasi user |
| `POST` | `/notifications/:id/read` | JWT | Tandai notifikasi dibaca |

### Storage

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| (sesuai implementasi) | `/storage/*` | JWT | Upload/download file ke MinIO |

### Health

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/health` | — | Health check API server |

### Access Control (Admin)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| (CRUD) | `/access-control/roles` | JWT | Manajemen role |
| (CRUD) | `/access-control/permissions` | JWT | Manajemen permission |
| (CRUD) | `/access-control/menus` | JWT | Manajemen menu sidebar |

### RAG (AI Knowledge Base)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| (sesuai impl) | `/rag/*` | JWT | Query dokumen Juknis via AI |

---

## 17. Edge Cases & Negative Scenarios

### 17.1 Submit CP yang Sama Dua Kali

```http
POST /checkpoints/CP1/submit  (pertama kali → sukses)
POST /checkpoints/CP1/submit  (kedua kali → error)
```

**Expected:** response `400 Bad Request` atau `409 Conflict`, CP1 tidak double-counted.

### 17.2 Submit CP Tanpa Foto

```http
POST /checkpoints/CP2/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

(tanpa field photo)
```

**Expected:** `400 Bad Request` — "File foto diperlukan".

### 17.3 Submit CP dengan cpType Tidak Valid

```http
POST /checkpoints/CP5/submit
Authorization: Bearer <token>
```

**Expected:** `400 Bad Request` — "cpType harus salah satu dari: CP1, CP2, CP3, CP4".

### 17.4 Akses Endpoint Tanpa Token

```http
GET /checkpoints/today
(tanpa Authorization header)
```

**Expected:** `401 Unauthorized`.

### 17.5 School Confirm dengan QR Token Tidak Valid

```http
GET /sekolah/confirm/token-palsu-tidak-ada
```

**Expected:** `404 Not Found`.

### 17.6 School Confirm Setelah Token Sudah Digunakan

```http
POST /sekolah/confirm/tokenyangsudahdikonfirmasi
```

**Expected:** `400 Bad Request` atau `409 Conflict` — token sudah digunakan.

### 17.7 Onboarding Step Tidak Berurutan

- Skip ke step 3 tanpa menyelesaikan step 1 dan 2.

**Expected:** API menolak dengan error bahwa langkah sebelumnya belum selesai.

### 17.8 Login dengan Akun Tidak Aktif

- Jika vendor di-`REVOKED` atau user `isActive: false`.

**Expected:** `401 Unauthorized` atau error yang sesuai.

### 17.9 Eligibility Session Expired

- Akses sesi eligibility yang sudah expired atau token tidak valid.

**Expected:** `404 Not Found` atau `410 Gone`.

### 17.10 Upload File Terlalu Besar

- Upload file > 10 MB ke endpoint checkpoint atau delivery photo.

**Expected:** `413 Payload Too Large` atau `400 Bad Request`.

### 17.11 Vendor Mengakses Endpoint Admin

- Login sebagai vendor, akses `GET /command-center/overview`.

**Expected:** `401 Unauthorized` atau `403 Forbidden`.

### 17.12 Request Body Tidak Sesuai DTO

- Kirim field ekstra atau field yang tidak ada di DTO.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "vendor@sppg.go.id",
  "password": "Vendor123!",
  "extraField": "hacker"
}
```

**Expected:** `400 Bad Request` — global `ValidationPipe` dengan `forbidNonWhitelisted: true` menolak.

### 17.13 Akses Portal Saat Vendor Suspended

- Login sebagai vendor dengan lifecycle `SUSPENDED`.

**Expected:** redirect ke `/portal/suspended`, semua fitur operasional tidak dapat diakses.

### 17.14 Refresh Token Expired

1. Hapus cookie `accessToken`.
2. Set cookie `refreshToken` dengan nilai expired.
3. Akses `/portal`.

**Expected:** redirect ke `/login`.

---

## 18. WebSocket / Realtime Events

### 18.1 Koneksi WebSocket

**URL (dari PWA):** `ws://localhost:3333` (sesuai config `realtime-client.ts`)

**Via PWA:** `apps/pwa/lib/realtime-client.ts`  
**Via Web Portal:** `apps/web/lib/realtime-client.ts`

### 18.2 Events yang Di-listen

| Event | Payload | Deskripsi |
|-------|---------|-----------|
| `cp_updated` | `{ vendorId, cpType, cpStatus, completedAt }` | CP vendor berubah status |
| `score_updated` | `{ vendorId, score, events }` | Skor vendor berubah |
| `delivery_status` | `{ token, status }` | Status delivery berubah |
| `alert_new` | `{ alert }` | Alert baru masuk (admin) |
| `team_presence` | `{ memberId, status }` | Status kehadiran tim berubah |

### 18.3 Test Realtime

**Cara test manual:**
1. Buka PWA `/operasional/live` atau web portal Mission Control di satu tab.
2. Di tab/Postman lain, submit CP melalui API.
3. **Expected:** halaman PWA/web langsung update tanpa refresh, menampilkan status CP terbaru.

**Cara test Mission Control (Web Portal):**
1. Login sebagai vendor ACTIVE.
2. Buka `/portal/mission-control`.
3. Submit CP via API atau PWA.
4. **Expected:** CP matrix di Mission Control terupdate realtime.

---

## Ringkasan Urutan Test Rekomendasi

Untuk end-to-end test lengkap satu siklus:

1. **Setup:** `pnpm db:migrate && pnpm db:seed`
2. **Auth:** Test login semua role, verifikasi redirect
3. **Eligibility:** Buat sesi, jawab pertanyaan, generate roadmap
4. **Onboarding:** Login vendor, jalankan 5 step onboarding
5. **Daily Cycle:** Submit CP1 → CP2 → CP3 → CP4 via PWA
6. **Delivery:** Kurir catat kedatangan → upload foto → complete
7. **School Confirm:** Scan QR → konfirmasi penerimaan
8. **Scoring:** Verifikasi skor terhitung dengan benar
9. **Debrief:** Generate dan lihat debrief AI hari ini
10. **Admin View:** Login admin, verifikasi Command Center, alerts, peta
11. **Edge Cases:** Uji skenario negatif (token expired, CP duplikat, dll.)
