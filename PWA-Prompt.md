# Context: MBG Vendor Platform — PWA Initialization

## Monorepo Structure

Kita bekerja di dalam monorepo Turborepo yang sudah ada. Struktur saat ini:

```
apps/
  web/          ← Next.js web portal (sudah ada)
  api/          ← NestJS backend (sudah ada)
  contracts/    ← Solidity/Hardhat (stub)
packages/
  ui/           ← Shared shadcn/ui components
  common/       ← Shared types, utils, UserRole enum
  modules/      ← Landing module
```

## Your Task

Buat `apps/pwa` — sebuah Next.js PWA app baru di dalam monorepo ini.

---

# Goals & Constraints

## TUJUAN SEMENTARA (Frontend Only)

- Semua halaman menggunakan **mock data / hardcoded data** — belum ada koneksi ke backend
- Fokus pada **UI, UX flow, dan interaktivitas** yang terasa native di mobile
- Siap untuk di-demo sebagai prototype yang hidup
- Bisa di-extend ke backend nanti tanpa refactor besar

## JANGAN dilakukan sekarang:

- Koneksi ke API backend
- Auth/login flow (asumsikan user sudah login, pakai mock user)
- State management global yang kompleks
- Unit tests

---

# Tech Stack PWA

| Aspek           | Pilihan                                         | Alasan                             |
| --------------- | ----------------------------------------------- | ---------------------------------- |
| Framework       | Next.js 15 (App Router)                         | Konsisten dengan `apps/web`        |
| PWA Plugin      | `next-pwa` atau `@ducanh2912/next-pwa`          | Service worker + manifest          |
| Styling         | Tailwind CSS                                    | Konsisten dengan monorepo          |
| UI Components   | Reuse `packages/ui` (shadcn/ui)                 | Konsisten dengan web portal        |
| Icons           | `lucide-react`                                  | Konsisten dengan web portal        |
| Camera          | `react-webcam` atau native HTML5 `getUserMedia` | Untuk checkpoint photo             |
| QR Scanner      | `html5-qrcode` atau `@zxing/browser`            | Untuk school confirm               |
| Mock Data       | Hardcoded TypeScript objects                    | Sementara, mudah diganti API nanti |
| Package Manager | Ikuti monorepo (npm/yarn/pnpm)                  | Konsistensi                        |

---

# Design System Rules

Ikuti design system yang sama dengan `apps/web`:

- **Tailwind** untuk semua styling
- **shadcn/ui components** dari `packages/ui`
- **Color palette**: gunakan warna yang sama (green untuk MBG brand)
- **Typography**: ikuti font dan sizing yang ada
- **Mobile-first**: semua layout didesain untuk layar 375px–430px
- **Bottom navigation**: ganti sidebar web dengan bottom nav bar (PWA standard)
- **No desktop sidebar** — PWA adalah mobile-only experience

---

# PWA Configuration

Setup `apps/pwa` dengan:

```json
// manifest.json
{
  "name": "MBG Platform",
  "short_name": "MBG",
  "description": "Platform Vendor Makan Bergizi Gratis Indonesia",
  "theme_color": "#16a34a",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    /* 192x192, 512x512 */
  ]
}
```

Aktifkan:

- Service worker (offline support untuk halaman yang sudah dikunjungi)
- `viewport` meta tag untuk mobile
- `apple-mobile-web-app-capable` meta tag

---

# App Shell & Navigation

## Layout Structure

```
┌─────────────────────────┐
│  Header (judul halaman) │  ← sticky top, minimal
├─────────────────────────┤
│                         │
│      Page Content       │  ← scrollable
│                         │
├─────────────────────────┤
│    Bottom Navigation    │  ← sticky bottom, 4-5 tabs
└─────────────────────────┘
```

## Bottom Navigation Tabs

```
[🏠 Home] [📋 Operasional] [📦 Orders] [🏫 Sekolah] [👁️ Publik]
```

- **Home** → Dashboard ringkas (role-aware mock)
- **Operasional** → Live Checkpoint & Daily Score (Vendor)
- **Orders** → Supplier order management (Supplier)
- **Sekolah** → School confirm & QR scan (Sekolah)
- **Publik** → Public transparency dashboard

> Untuk demo: tampilkan semua tab. Pada implementasi nyata, tab di-filter berdasarkan role.

---

# Halaman yang Harus Dibuat

## 1. Home / Dashboard (`/`)

**Mock role**: Vendor
**Tujuan**: Landing setelah login, ringkasan hari ini

Konten:

- Header: "Selamat pagi, [Nama Vendor] 👋"
- Card status hari ini: skor checkpoint kemarin, jadwal hari ini
- Quick action buttons: "Mulai Checkpoint", "Lihat Jadwal", "Hubungi Supplier"
- Alert/notifikasi mock: "CP1 belum dilakukan hari ini"
- Motivational stat: "92% compliance minggu ini 🎉"

Mock data yang dibutuhkan:

```typescript
const mockVendor = {
  name: "Dapur Sehat Bu Sari",
  location: "Pontianak Barat",
  todayScore: 85,
  weeklyCompliance: 92,
  todayMenu: "Nasi + Ayam Goreng + Sayur Bayam + Buah Pisang",
  checkpointStatus: { cp1: false, cp2: false, cp3: false, cp4: false },
};
```

---

## 2. Live Checkpoint (`/operasional/live`)

**Mock role**: Vendor
**Tujuan**: Eksekusi 4 checkpoint harian dengan foto

Ini halaman paling penting untuk demo hackathon.

### Flow:

```
Step Indicator (CP1 → CP2 → CP3 → CP4)
         ↓
[Kamera / Upload Foto]
         ↓
[Preview foto yang diambil]
         ↓
[Submit → Simulasi AI validation]
         ↓
[Hasil: ✅ Layak / ❌ Tidak Layak + Skor]
         ↓
[Lanjut ke CP berikutnya]
```

### Detail per checkpoint:

| CP  | Label        | Instruksi Mock                             |
| --- | ------------ | ------------------------------------------ |
| CP1 | Bahan Mentah | "Foto semua bahan yang diterima hari ini"  |
| CP2 | Proses Masak | "Foto kondisi dapur dan proses memasak"    |
| CP3 | Makanan Siap | "Foto makanan yang siap dikemas"           |
| CP4 | Serah Terima | "Foto saat menyerahkan makanan ke sekolah" |

### AI Validation Mock:

Setelah foto diupload/diambil, tampilkan loading 2 detik lalu munculkan hasil mock:

```typescript
const mockAIResult = {
  status: "pass", // atau "fail" | "review"
  score: 94,
  confidence: 0.91,
  notes: "Bahan terlihat segar, kondisi higienis baik",
  detectedItems: ["ayam", "sayuran hijau", "beras"],
};
```

Tampilkan dengan UI yang dramatis: badge hijau "✅ AI: Layak — Skor 94/100"

### Komponen yang dibutuhkan:

- Step progress indicator (CP1/CP2/CP3/CP4)
- Camera component (pakai `react-webcam` atau `<input type="file" accept="image/*" capture="environment">`)
- Photo preview dengan opsi retake
- Loading state "AI sedang menganalisa..."
- Result card dengan score, badge status, detected items
- Button "Lanjut ke CP berikutnya"

---

## 3. Daily Score (`/operasional/score`)

**Mock role**: Vendor
**Tujuan**: Lihat skor dan penalti hari ini secara cepat

Konten:

- Skor besar di tengah (angka besar, warna hijau/kuning/merah sesuai nilai)
- Breakdown per checkpoint: CP1 ✅ +25pts, CP2 ✅ +25pts, CP3 ⚠️ +18pts, CP4 ❌ 0pts
- Penalti section: "Keterlambatan 15 menit: -5pts"
- Estimasi dana cair hari ini
- Trend mingguan (simple bar chart atau bar visual dari div)
- Button "Lihat Riwayat Lengkap"

---

## 4. Supplier Orders (`/orders`)

**Mock role**: Supplier
**Tujuan**: Supplier manage incoming Purchase Orders di lapangan/gudang

### List View:

- List PO cards dengan status badge (Baru, Diproses, Dikirim, Selesai)
- Setiap card: nama vendor, item, jumlah, total, tanggal kirim
- Filter tabs: Semua | Baru | Diproses | Dikirim
- Pull-to-refresh indicator (UI only)

Mock data:

```typescript
const mockOrders = [
  {
    id: "PO-2024-001",
    vendorName: "Dapur Sehat Bu Sari",
    items: [{ name: "Ayam Broiler", qty: 52, unit: "kg", price: 35000 }],
    total: 1820000,
    status: "new",
    deliveryDate: "2024-03-15",
    deliveryAddress: "Jl. Veteran No. 12, Pontianak",
  },
];
```

### Detail View (`/orders/[id]`):

- Header: nomor PO + status
- Item list dengan qty dan harga
- Info pengiriman (alamat, tanggal)
- Action buttons berdasarkan status:
  - Status "Baru": tombol "Terima PO" + "Tolak"
  - Status "Diproses": tombol "Upload Bukti Kirim" (foto)
  - Status "Dikirim": tombol "Konfirmasi Selesai"
- Photo upload untuk bukti kirim (sama seperti camera di checkpoint)

---

## 5. School Confirm (`/sekolah/confirm`)

**Mock role**: Sekolah
**Tujuan**: Sekolah scan QR dari vendor, konfirmasi terima makanan

### Flow:

```
[Landing: "Scan QR dari kurir vendor"]
         ↓
[QR Scanner aktif (kamera)]
         ↓
[Hasil scan: detail pengiriman muncul]
         ↓
[Konfirmasi: jumlah porsi, kondisi makanan]
         ↓
[Foto bukti terima (opsional)]
         ↓
[Submit → "Konfirmasi berhasil ✅"]
```

### Detail:

- QR Scanner: gunakan `html5-qrcode`. Untuk mock, tambahkan tombol "Simulasi Scan" yang langsung trigger hasil.
- Setelah scan, tampilkan card:
  ```
  Vendor: Dapur Sehat Bu Sari
  Menu: Nasi + Ayam Goreng + Sayur
  Jumlah porsi: 180 porsi
  Waktu tiba: 10:45 WIB
  ```
- Form konfirmasi: input "Porsi yang diterima", dropdown kondisi (Baik/Sebagian Rusak/Ditolak), textarea catatan
- Photo upload untuk bukti terima

---

## 6. School Dashboard (`/sekolah`)

**Mock role**: Sekolah
**Tujuan**: Sekolah lihat jadwal pengiriman dan info nutrisi

Konten:

- Header: nama sekolah + tanggal hari ini
- Card "Pengiriman Hari Ini": status (Menunggu/Dalam Perjalanan/Tiba), ETA mock
- Menu hari ini dengan info nutrisi: kalori, protein, karbohidrat
- Kalender mini: 5 hari ke depan dengan status pengiriman
- Riwayat penerimaan 7 hari terakhir

---

## 7. Public Dashboard (`/publik`)

**Mock role**: Publik/Warga
**Tujuan**: Transparansi program MBG — siapa saja bisa lihat

Ini penting untuk hackathon — menunjukkan akuntabilitas publik.

Konten:

- Statistik nasional (mock):
  - Total SPPG aktif: 1.580 dari 25.570 target
  - Total penerima hari ini: 285.400 siswa
  - Compliance rate nasional: 87.3%
  - Total dana tersalurkan: Rp 2.3 Miliar hari ini
- Top vendor scoreboard (tabel 5 vendor terbaik dengan skor)
- Recent audit entries (blockchain hash mock):
  ```
  0x4a7f... | Dapur Bu Sari | CP4 Selesai | 10:47 WIB | ✅
  0x9b2c... | Catering Maju | PO Dibayar  | 10:12 WIB | ✅
  ```
- Map placeholder (static image atau div dengan koordinat visual)
- "Data diperbarui real-time dari blockchain" — ini narrative penting untuk juri

---

## 8. Checkpoint History (`/operasional/history`)

**Mock role**: Vendor
**Tujuan**: Riwayat checkpoint 7 hari terakhir

Konten:

- List per hari: tanggal, skor, status 4 CP, penalti
- Tap untuk expand detail per hari
- Summary: rata-rata skor minggu ini, total penalti

---

# File Structure yang Diharapkan

```
apps/pwa/
├── app/
│   ├── layout.tsx              ← Root layout + bottom nav
│   ├── page.tsx                ← Home / Dashboard
│   ├── operasional/
│   │   ├── live/
│   │   │   └── page.tsx        ← Live Checkpoint (CP1-CP4)
│   │   ├── score/
│   │   │   └── page.tsx        ← Daily Score
│   │   └── history/
│   │       └── page.tsx        ← Checkpoint History
│   ├── orders/
│   │   ├── page.tsx            ← Supplier Orders List
│   │   └── [id]/
│   │       └── page.tsx        ← Order Detail
│   ├── sekolah/
│   │   ├── page.tsx            ← School Dashboard
│   │   └── confirm/
│   │       └── page.tsx        ← QR Scan + Confirm
│   └── publik/
│       └── page.tsx            ← Public Dashboard
├── components/
│   ├── layout/
│   │   ├── bottom-nav.tsx      ← Bottom navigation bar
│   │   └── page-header.tsx     ← Sticky top header
│   ├── checkpoint/
│   │   ├── camera-capture.tsx  ← Camera / file upload component
│   │   ├── step-indicator.tsx  ← CP1-CP4 progress
│   │   └── ai-result-card.tsx  ← Mock AI result display
│   ├── orders/
│   │   └── order-card.tsx      ← PO card component
│   └── shared/
│       ├── score-badge.tsx     ← Skor dengan warna
│       └── status-badge.tsx    ← Status pill
├── lib/
│   └── mock-data/
│       ├── vendor.ts           ← Mock vendor data
│       ├── orders.ts           ← Mock PO data
│       ├── checkpoints.ts      ← Mock checkpoint data
│       └── public-stats.ts     ← Mock statistik publik
├── public/
│   ├── manifest.json
│   └── icons/
├── next.config.ts              ← PWA config
├── package.json
└── tsconfig.json
```

---

# Urutan Pengerjaan yang Disarankan

Kerjakan dalam urutan ini:

1. **Setup monorepo** — init `apps/pwa`, install dependencies, konfigurasi Turborepo, setup PWA manifest
2. **App shell** — layout dengan bottom nav dan page header
3. **Mock data** — buat semua file di `lib/mock-data/` dulu sebelum buat halaman
4. **Home dashboard** — halaman pertama yang dilihat
5. **Live Checkpoint** — prioritas tertinggi (wow factor demo)
6. **Public Dashboard** — prioritas kedua (juri BI/OJK)
7. **School Confirm** — prioritas ketiga (closing the loop)
8. **Supplier Orders** — prioritas keempat
9. **Daily Score + History** — pelengkap

---

# Catatan Penting

- **Semua data adalah mock** — tidak ada fetch ke API. Gunakan data dari `lib/mock-data/`.
- **Camera component** harus handle dua case: browser yang support `getUserMedia` (live camera) dan fallback ke `<input type="file" capture="environment">` untuk iOS Safari.
- **QR Scanner**: sertakan tombol "Simulasi Scan" sebagai fallback untuk demo jika kamera bermasalah.
- **AI result** adalah mock dengan setTimeout 2000ms untuk simulate loading — tapi UI-nya harus terasa real dan dramatis.
- **Blockchain hash** di public dashboard adalah string random yang di-generate client-side (bukan dari chain yang sebenarnya) — cukup untuk demo.
- **Pastikan semua halaman responsive** di viewport 375px (iPhone SE) hingga 430px (iPhone 15 Pro Max).
- **Gunakan `packages/ui`** untuk Button, Card, Badge, Input, dan komponen lain yang sudah ada.

Mulai dari setup monorepo dan app shell dulu. Konfirmasi jika sudah selesai sebelum lanjut ke halaman individual.

```

```
