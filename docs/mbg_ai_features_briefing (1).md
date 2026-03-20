# Briefing Teknis — AI Features Web Dashboard
**Platform:** MBG Vendor Platform  
**Untuk:** Rekan Tim (Frontend Dev)  
**Fokus:** Frontend-only, mock data dulu — belum ke backend  
**Stack:** Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui

---

## Konteks Singkat

Platform ini membantu vendor **Makan Bergizi Gratis (MBG)** dalam perizinan dan pengawasan operasional. Kamu akan handle fitur-fitur AI di web dashboard (`apps/web/app/portal/`). Semua fitur yang kamu kerjakan **belum perlu konek ke backend** — fokus ke UI, UX flow, dan mock data yang terasa real.

Ada 4 fitur utama yang perlu dibuat:

| # | Fitur | Halaman | Priority |
|---|-------|---------|----------|
| 1 | RAG SOP & Perizinan Assistant | `/portal/asisten` ← halaman baru | P1 — Mulai sini |
| 2 | Anomali Detection Dashboard | `/portal/reports` | P1 |
| 3 | Fraud Detection | `/portal/reports` + `/portal/checkpoints` | P2 |
| 4 | Nutrition Compliance Checker | `/portal/menu` | P2 |

> **Catatan:** `/portal/sop` yang sudah ada **jangan diubah** — biarkan tetap sebagai halaman referensi statis. Fitur RAG Assistant punya halaman sendiri di `/portal/asisten`.

---

## Fitur 1 — RAG SOP & Perizinan Assistant

### Apa ini?
Halaman dedicated untuk chatbot AI yang menjawab pertanyaan vendor seputar SOP operasional, regulasi perizinan, dan juknis penyelenggaraan MBG. Jawabannya terasa seperti dari dokumen resmi — bukan jawaban generik.

### Halaman target
`/portal/asisten` — **halaman baru**, bukan di `/portal/sop`.

> `/portal/sop` yang sudah ada **jangan disentuh** — biarkan tetap sebagai halaman referensi statis. Halaman asisten ini berdiri sendiri dengan pengalaman full-page chat.

### UI yang diharapkan

Layout halaman ini adalah **full-page chat experience** — bukan widget kecil di sudut halaman. Dibagi dua kolom di desktop: sidebar kiri untuk kategori dokumen, area kanan untuk chat.

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Asisten Regulasi MBG                                    │
│  Powered by AI — Berbasis dokumen resmi BGN & Kemenkes      │
├────────────────────┬────────────────────────────────────────┤
│  📂 Kategori       │                                        │
│  ──────────────    │   ┌────────────────────────────────┐  │
│  ✅ SOP Operasional│   │ 🤖 Halo! Saya Asisten MBG.    │  │
│  ✅ Perizinan      │   │    Tanyakan apa saja seputar    │  │
│  ✅ Juknis BGN     │   │    SOP, perizinan, dan juknis   │  │
│  ✅ Standar Gizi   │   │    penyelenggaraan MBG.         │  │
│  ✅ Sanitasi & SLHS│   │                                 │  │
│  ✅ Kontrak & Bayar│   │ 👤 Dokumen apa yang perlu      │  │
│                    │   │    saya siapkan untuk daftar    │  │
│  📌 Riwayat        │   │    vendor MBG?                  │  │
│  ──────────────    │   │                                 │  │
│  Syarat SLHS?      │   │ 🤖 Berdasarkan Juknis BGN      │  │
│  Cara daftar NIB?  │   │    No. 2/2024, dokumen yang     │  │
│  Penalti terlambat?│   │    diperlukan:                  │  │
│                    │   │    • SLHS dari Dinas Kesehatan  │  │
│                    │   │    • NKV (produk hewani)         │  │
│                    │   │    • BPOM / P-IRT               │  │
│                    │   │    • NIB aktif dari OSS         │  │
│                    │   │                                 │  │
│                    │   │    📎 Sumber:                   │  │
│                    │   │    [Juknis BGN hal. 14–16]      │  │
│                    │   │    [Panduan Sanitasi Bab 3]     │  │
│                    │   └────────────────────────────────┘  │
│                    │                                        │
│                    │   💡 Coba tanyakan:                   │
│                    │   [Syarat SLHS?] [Cara daftar NIB?]   │
│                    │   [Penalti terlambat?] [CP4 itu apa?] │
│                    │                                        │
│                    │   ┌──────────────────────┐ [Kirim]   │
│                    │   │ Ketik pertanyaan...  │            │
│                    │   └──────────────────────┘            │
└────────────────────┴────────────────────────────────────────┘
```

**Mobile layout:** sidebar kategori collapse jadi dropdown di atas area chat.

### Mock data yang dibutuhkan

```typescript
// lib/mock-data/rag-responses.ts

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: { title: string; page: string }[]
  timestamp: Date
}

export const mockRAGResponses: Record<string, {
  content: string
  sources: { title: string; page: string }[]
}> = {
  "dokumen daftar vendor": {
    content: `Berdasarkan **Juknis BGN Nomor 2 Tahun 2024**, dokumen yang wajib disiapkan:

**Legalitas Usaha:**
- NIB (Nomor Induk Berusaha) aktif dari OSS
- NPWP perusahaan atau perorangan

**Sertifikasi Sanitasi:**
- SLHS (Sertifikat Laik Higiene Sanitasi) dari Dinas Kesehatan
- NKV (Nomor Kontrol Veteriner) jika mengolah produk hewani

**Keamanan Pangan:**
- Sertifikat BPOM atau P-IRT untuk produk olahan
- Sertifikat halal MUI (jika mengklaim halal)

**Kapasitas Produksi:**
- Foto dapur produksi beserta denah
- Daftar peralatan masak yang dimiliki

Proses verifikasi biasanya memakan waktu 7-14 hari kerja.`,
    sources: [
      { title: "Juknis BGN No. 2/2024", page: "Lampiran II, hal. 14-16" },
      { title: "Panduan Sanitasi MBG", page: "Bab 3, hal. 22" }
    ]
  },
  "penalti terlambat": {
    content: `Berdasarkan **Matriks Penalti MBG**, keterlambatan pengiriman dikenakan:

| Keterlambatan | Pengurangan Poin |
|---------------|-----------------|
| 1–15 menit | -5 poin |
| 16–30 menit | -15 poin |
| 31–60 menit | -25 poin |
| > 60 menit | -50 poin + peringatan |

**3 kali peringatan** dalam sebulan → evaluasi kontrak vendor.

Keterlambatan karena force majeure (bencana alam, kecelakaan lalu lintas) dapat diajukan keberatan melalui menu Insiden dalam 24 jam.`,
    sources: [
      { title: "SOP Operasional MBG v3.1", page: "Tabel 4.2, hal. 31" }
    ]
  },
  "checkpoint cp4": {
    content: `**CP4 (Checkpoint 4)** adalah tahap serah terima makanan di sekolah. Ini adalah checkpoint paling kritis karena menentukan pencairan dana hari itu.

**Yang harus dilakukan di CP4:**
1. Tiba di sekolah sebelum pukul 10.00 WIB
2. Persiapkan QR code pengiriman
3. Ambil foto kemasan makanan sebelum diserahkan
4. Tunggu petugas sekolah scan QR dan konfirmasi
5. Upload foto bukti serah terima di aplikasi

**Foto CP4 yang valid harus memuat:**
- Kemasan makanan terlihat jelas
- Timestamp otomatis dari sistem
- Petugas sekolah terlihat di frame (opsional, +3 bonus poin)

Tanpa CP4 yang valid, **dana hari itu tidak akan dicairkan**.`,
    sources: [
      { title: "SOP Operasional MBG v3.1", page: "Bab 5, hal. 44-47" },
      { title: "Panduan Checkpoint Visual", page: "hal. 8-12" }
    ]
  }
}

export const suggestedQuestions = [
  "Dokumen apa yang perlu disiapkan untuk daftar vendor?",
  "Berapa penalti jika pengiriman terlambat?",
  "Apa itu CP4 dan bagaimana caranya?",
  "Cara mengajukan keberatan atas penalti?",
  "Syarat perpanjangan kontrak vendor MBG?",
  "Bagaimana cara kerja escrow pembayaran?",
]
```

### Komponen yang perlu dibuat

```
app/portal/asisten/
  page.tsx                      ← Halaman utama (layout 2 kolom)

components/
  asisten/
    chat-area.tsx               ← Area chat utama (kanan)
    chat-message.tsx            ← Bubble message user + assistant
    source-badge.tsx            ← Badge "Sumber: Juknis BGN hal. 14"
    suggested-questions.tsx     ← Chip pertanyaan populer
    category-sidebar.tsx        ← Sidebar kategori dokumen (kiri)
    category-dropdown.tsx       ← Versi mobile dari sidebar
```

### Behavior penting

- Ketika user kirim pesan → tampilkan loading "Mencari di dokumen resmi..." selama 1.5 detik
- Match input user ke key di `mockRAGResponses` (fuzzy match sederhana, cukup `includes()`)
- Jika tidak ada match → tampilkan response default: *"Maaf, saya belum menemukan informasi ini di dokumen yang tersedia. Silakan hubungi tim BGN langsung."*
- Setiap response assistant tampilkan source badge di bawah pesan
- Support markdown rendering di bubble assistant (bold, bullet, table)

---

## Fitur 2 — Anomali Detection Dashboard

### Apa ini?
Dashboard yang menampilkan deteksi anomali operasional vendor secara visual — pola yang tidak wajar seperti skor tiba-tiba drop, foto checkpoint yang diulang, atau pengiriman yang selalu terlambat di hari tertentu.

### Halaman target
`/portal/reports` — halaman ini sudah ada dengan mock chart, perlu ditambah section anomali.

### UI yang diharapkan

```
┌─────────────────────────────────────────────────┐
│  🔍 Deteksi Anomali Operasional                 │
│  Periode: [7 Hari ▼]  Status: [Semua ▼]        │
├─────────────────────────────────────────────────┤
│                                                  │
│  ⚠️  3 anomali terdeteksi hari ini              │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 🔴 TINGGI  │ Skor drop 40% dalam 2 hari  │   │
│  │ Vendor: Dapur Maju Jaya                  │   │
│  │ Skor: 91 → 72 → 54 (Senin–Rabu)         │   │
│  │ Pola: Foto CP2 & CP3 selalu blur         │   │
│  │ [Investigasi] [Abaikan]                  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 🟡 SEDANG  │ Waktu pengiriman tidak wajar│   │
│  │ Vendor: Catering Berkah                  │   │
│  │ CP4 selalu submit jam 11.45–11.59 WIB    │   │
│  │ (mendekati batas toleransi tiap hari)    │   │
│  │ [Investigasi] [Abaikan]                  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 🟡 SEDANG  │ Foto identik terdeteksi     │   │
│  │ Vendor: UD Sejahtera Mandiri             │   │
│  │ Foto CP1 hari Selasa & Kamis memiliki    │   │
│  │ similarity 97% (diduga foto lama)        │   │
│  │ [Investigasi] [Abaikan]                  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  📊 Tren Anomali 7 Hari                         │
│  [Bar chart: jumlah anomali per hari]           │
└─────────────────────────────────────────────────┘
```

### Mock data yang dibutuhkan

```typescript
// lib/mock-data/anomaly-detection.ts

export type AnomalySeverity = "high" | "medium" | "low"
export type AnomalyStatus = "open" | "investigating" | "resolved" | "ignored"
export type AnomalyType =
  | "score_drop"
  | "timing_pattern"
  | "duplicate_photo"
  | "gps_mismatch"
  | "portion_mismatch"
  | "sudden_absence"

export interface Anomaly {
  id: string
  vendorId: string
  vendorName: string
  type: AnomalyType
  severity: AnomalySeverity
  status: AnomalyStatus
  title: string
  description: string
  evidence: string[]
  detectedAt: Date
  affectedDates: string[]
  aiConfidence: number // 0–1
}

export const mockAnomalies: Anomaly[] = [
  {
    id: "ANO-001",
    vendorId: "V-024",
    vendorName: "Dapur Maju Jaya",
    type: "score_drop",
    severity: "high",
    status: "open",
    title: "Skor drop 40% dalam 2 hari",
    description: "Terjadi penurunan skor drastis dari 91 menjadi 54 dalam 2 hari. Foto CP2 dan CP3 konsisten blur dan mendapat nilai rendah dari AI validator.",
    evidence: [
      "Skor Senin: 91/100",
      "Skor Selasa: 72/100 (-19)",
      "Skor Rabu: 54/100 (-18)",
      "Foto CP2 blur rate: 80% (3 dari 5 hari terakhir)",
    ],
    detectedAt: new Date("2024-03-13T08:30:00"),
    affectedDates: ["2024-03-11", "2024-03-12", "2024-03-13"],
    aiConfidence: 0.94,
  },
  {
    id: "ANO-002",
    vendorId: "V-011",
    vendorName: "Catering Berkah",
    type: "timing_pattern",
    severity: "medium",
    status: "open",
    title: "Pola waktu pengiriman tidak wajar",
    description: "CP4 selalu disubmit antara 11.45–11.59 WIB selama 8 hari berturut-turut, tepat sebelum batas toleransi. Pola ini sangat tidak natural.",
    evidence: [
      "8 hari berturut-turut submit 11:45–11:59",
      "Batas toleransi: 12.00 WIB",
      "Probabilitas natural: < 0.1%",
    ],
    detectedAt: new Date("2024-03-13T12:05:00"),
    affectedDates: ["2024-03-06", "2024-03-07", "2024-03-08", "2024-03-11", "2024-03-12", "2024-03-13"],
    aiConfidence: 0.87,
  },
  {
    id: "ANO-003",
    vendorId: "V-037",
    vendorName: "UD Sejahtera Mandiri",
    type: "duplicate_photo",
    severity: "medium",
    status: "open",
    title: "Foto identik terdeteksi di hari berbeda",
    description: "Foto CP1 yang dikirim Selasa dan Kamis memiliki image similarity 97.3%. Diduga menggunakan foto lama untuk checkpoint hari baru.",
    evidence: [
      "Image similarity Selasa vs Kamis: 97.3%",
      "Metadata EXIF: timestamp berbeda, tapi piksel hampir identik",
      "Lokasi GPS: berbeda 0.002 derajat (tidak signifikan)",
    ],
    detectedAt: new Date("2024-03-13T09:15:00"),
    affectedDates: ["2024-03-11", "2024-03-13"],
    aiConfidence: 0.91,
  },
  {
    id: "ANO-004",
    vendorId: "V-019",
    vendorName: "Warung Sehat Ibu Tini",
    type: "portion_mismatch",
    severity: "low",
    status: "investigating",
    title: "Jumlah porsi tidak konsisten dengan PO",
    description: "Vendor mengklaim 150 porsi tapi foto CP3 hanya terlihat sekitar 90–100 wadah makanan berdasarkan analisis AI.",
    evidence: [
      "PO tercatat: 150 porsi",
      "Estimasi AI dari foto: 88–102 porsi",
      "Selisih: ~40–60 porsi (27–40%)",
    ],
    detectedAt: new Date("2024-03-12T14:20:00"),
    affectedDates: ["2024-03-12"],
    aiConfidence: 0.79,
  },
]

export const anomalyTrend = [
  { date: "Kam", count: 2, high: 0, medium: 2, low: 0 },
  { date: "Jum", count: 1, high: 0, medium: 0, low: 1 },
  { date: "Sab", count: 0, high: 0, medium: 0, low: 0 },
  { date: "Min", count: 0, high: 0, medium: 0, low: 0 },
  { date: "Sen", count: 3, high: 1, medium: 1, low: 1 },
  { date: "Sel", count: 4, high: 1, medium: 2, low: 1 },
  { date: "Rab", count: 3, high: 1, medium: 1, low: 1 },
]
```

### Komponen yang perlu dibuat

```
components/
  reports/
    anomaly-card.tsx         ← Card per anomali dengan severity badge
    anomaly-filter-bar.tsx   ← Filter periode + status
    anomaly-trend-chart.tsx  ← Bar chart tren anomali (pakai recharts)
    anomaly-evidence-list.tsx ← List bukti dengan icon
```

### Behavior penting

- Klik **"Investigasi"** → ubah status card jadi "investigating" + tampilkan modal detail lengkap
- Klik **"Abaikan"** → hilangkan card dari list (update state lokal)
- Filter periode (7 hari / 30 hari / custom) → cukup filter dari mock data berdasarkan `detectedAt`
- Badge AI confidence: hijau jika > 85%, kuning jika 70–85%, merah jika < 70%

---

## Fitur 3 — Fraud Detection

### Apa ini?
Lapisan di atas anomali detection — khusus untuk indikasi kecurangan yang lebih serius dan memerlukan tindakan admin. Ditampilkan di `/portal/reports` sebagai tab terpisah dan juga sebagai alert di `/portal/checkpoints`.

### UI yang diharapkan

```
┌─────────────────────────────────────────────────┐
│  🚨 Indikasi Fraud                              │
│  [Tab: Aktif (2)] [Tab: Diproses] [Tab: Arsip] │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 🔴 FRAUD TERINDIKASI                     │   │
│  │ ────────────────────────────────         │   │
│  │ Vendor: CV Mandiri Sejahtera             │   │
│  │ Jenis: Foto checkpoint daur ulang        │   │
│  │                                          │   │
│  │ Bukti:                                   │   │
│  │ • 12 foto identik dalam 3 minggu         │   │
│  │ • Foto diambil di luar jam operasional   │   │
│  │ • GPS tidak konsisten dengan lokasi dapur│   │
│  │                                          │   │
│  │ Potensi kerugian: Rp 14.400.000          │   │
│  │ AI Risk Score: 96/100                    │   │
│  │                                          │   │
│  │ [🔍 Lihat Bukti Lengkap] [⚠️ Eskalasi]  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 🟠 MENCURIGAKAN                          │   │
│  │ Vendor: Dapur Rakyat 88                  │   │
│  │ Jenis: Klaim porsi lebih dari aktual     │   │
│  │ Potensi kerugian: Rp 3.200.000           │   │
│  │ AI Risk Score: 78/100                    │   │
│  │ [🔍 Lihat Bukti] [⚠️ Eskalasi]          │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Mock data yang dibutuhkan

```typescript
// lib/mock-data/fraud-detection.ts

export type FraudType =
  | "photo_recycling"
  | "portion_inflation"
  | "gps_spoofing"
  | "fake_document"
  | "collusion"

export type FraudStatus = "flagged" | "under_review" | "confirmed" | "cleared"

export interface FraudCase {
  id: string
  vendorId: string
  vendorName: string
  type: FraudType
  status: FraudStatus
  title: string
  summary: string
  evidence: {
    label: string
    detail: string
    severity: "critical" | "warning" | "info"
  }[]
  estimatedLoss: number // dalam rupiah
  aiRiskScore: number   // 0–100
  detectedAt: Date
  blockchainRef?: string // hash mock untuk audit trail
}

export const mockFraudCases: FraudCase[] = [
  {
    id: "FRD-001",
    vendorId: "V-088",
    vendorName: "CV Mandiri Sejahtera",
    type: "photo_recycling",
    status: "flagged",
    title: "Foto checkpoint daur ulang",
    summary: "Vendor terbukti menggunakan foto yang sama berulang kali untuk checkpoint yang berbeda selama 3 minggu.",
    evidence: [
      {
        label: "12 foto identik terdeteksi",
        detail: "Foto yang sama digunakan di 12 hari berbeda dalam 21 hari operasional",
        severity: "critical",
      },
      {
        label: "Timestamp manipulasi",
        detail: "Metadata EXIF menunjukkan foto diambil di luar jam operasional (02.00–04.00 WIB)",
        severity: "critical",
      },
      {
        label: "GPS tidak konsisten",
        detail: "Koordinat GPS di metadata berbeda 2.3km dari lokasi dapur terdaftar",
        severity: "critical",
      },
    ],
    estimatedLoss: 14400000,
    aiRiskScore: 96,
    detectedAt: new Date("2024-03-13T07:45:00"),
    blockchainRef: "0x4a7f9b2c3d8e1f6a5b4c9d2e8f7a1b3c",
  },
  {
    id: "FRD-002",
    vendorId: "V-052",
    vendorName: "Dapur Rakyat 88",
    type: "portion_inflation",
    status: "flagged",
    title: "Klaim porsi lebih dari aktual",
    summary: "Vendor secara konsisten mengklaim jumlah porsi lebih tinggi dari yang terdeteksi AI.",
    evidence: [
      {
        label: "Selisih porsi rata-rata 31%",
        detail: "Klaim 150 porsi, AI estimasi 103 porsi — terjadi di 7 dari 10 hari terakhir",
        severity: "critical",
      },
      {
        label: "Faktur supplier tidak sesuai",
        detail: "Jumlah bahan baku yang dibeli dari supplier hanya cukup untuk ±105 porsi",
        severity: "warning",
      },
    ],
    estimatedLoss: 3200000,
    aiRiskScore: 78,
    detectedAt: new Date("2024-03-12T16:00:00"),
    blockchainRef: "0x9b2c4d7e1f8a3b6c2d5e9f4a7b1c8d3e",
  },
]
```

### Alert di halaman Checkpoints

Di `/portal/checkpoints`, tambahkan banner alert jika vendor yang sedang dilihat punya fraud case aktif:

```tsx
// Contoh komponen alert
{activeFraudCase && (
  <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-6">
    <div className="flex items-center gap-2 text-red-700 font-medium">
      <AlertTriangle className="w-4 h-4" />
      Vendor ini sedang dalam investigasi fraud
    </div>
    <p className="text-red-600 text-sm mt-1">
      Terdeteksi: {activeFraudCase.title}
    </p>
    <a href="/portal/reports?tab=fraud" className="text-red-700 text-sm underline">
      Lihat detail →
    </a>
  </div>
)}
```

---

## Fitur 4 — Nutrition Compliance Checker

### Apa ini?
Validasi otomatis apakah menu yang diinput vendor sudah memenuhi standar gizi PMK (Peraturan Menteri Kesehatan) untuk program MBG. Ditambahkan ke halaman `/portal/menu` yang sudah ada.

### UI yang diharapkan

```
┌──────────────────────────────────────────────────┐
│  🥗 Penyusunan Menu & Nutrisi                    │
│  [Konten halaman yang sudah ada...]              │
├──────────────────────────────────────────────────┤
│                                                  │
│  🤖 Analisis Kepatuhan Gizi AI                  │
│  ─────────────────────────────                  │
│  Menu: Nasi + Ayam Goreng + Sayur Bayam + Pisang│
│                                                  │
│  ✅ Kalori: 580 kkal (target: 400–700)          │
│  ✅ Protein: 24g (target: min. 15g)             │
│  ⚠️  Serat: 3.2g (target: min. 5g) — kurang!   │
│  ✅ Karbohidrat: 72g (target: 50–100g)          │
│  ✅ Lemak: 18g (target: 10–25g)                 │
│                                                  │
│  Skor Kepatuhan: 80/100                         │
│  ████████░░ (4 dari 5 kriteria terpenuhi)       │
│                                                  │
│  💡 Saran AI:                                   │
│  "Tambahkan sayuran berserat tinggi seperti     │
│   brokoli, wortel, atau kacang panjang untuk    │
│   meningkatkan skor menjadi 100/100"            │
│                                                  │
│  Referensi: PMK No. 41/2014, Tabel AKG 2019    │
└──────────────────────────────────────────────────┘
```

### Mock data yang dibutuhkan

```typescript
// lib/mock-data/nutrition.ts

export interface NutritionStandard {
  nutrient: string
  min: number
  max: number | null
  unit: string
  target: string // deskripsi untuk UI
}

export const mbgNutritionStandards: NutritionStandard[] = [
  { nutrient: "kalori", min: 400, max: 700, unit: "kkal", target: "400–700 kkal" },
  { nutrient: "protein", min: 15, max: null, unit: "g", target: "min. 15g" },
  { nutrient: "serat", min: 5, max: null, unit: "g", target: "min. 5g" },
  { nutrient: "karbohidrat", min: 50, max: 100, unit: "g", target: "50–100g" },
  { nutrient: "lemak", min: 10, max: 25, unit: "g", target: "10–25g" },
]

export interface NutritionAnalysisResult {
  score: number
  items: {
    nutrient: string
    value: number
    unit: string
    status: "pass" | "warning" | "fail"
    target: string
  }[]
  suggestion: string
  reference: string
}

// Fungsi mock — nanti diganti dengan API call
export function analyzeMockNutrition(menu: string): NutritionAnalysisResult {
  // Simulasi hasil berdasarkan keyword di menu
  const hasVegetable = /bayam|kangkung|brokoli|wortel|kacang/i.test(menu)
  const hasFruit = /pisang|jeruk|semangka|pepaya/i.test(menu)
  const hasProtein = /ayam|ikan|telur|tempe|tahu/i.test(menu)

  return {
    score: hasVegetable && hasFruit && hasProtein ? 95 : hasProtein ? 80 : 60,
    items: [
      { nutrient: "Kalori", value: 580, unit: "kkal", status: "pass", target: "400–700 kkal" },
      { nutrient: "Protein", value: hasProtein ? 24 : 8, unit: "g", status: hasProtein ? "pass" : "fail", target: "min. 15g" },
      { nutrient: "Serat", value: hasVegetable ? 6.5 : 3.2, unit: "g", status: hasVegetable ? "pass" : "warning", target: "min. 5g" },
      { nutrient: "Karbohidrat", value: 72, unit: "g", status: "pass", target: "50–100g" },
      { nutrient: "Lemak", value: 18, unit: "g", status: "pass", target: "10–25g" },
    ],
    suggestion: hasVegetable
      ? "Menu sudah sangat baik! Pastikan porsi sayuran minimal 100g per sajian."
      : "Tambahkan sayuran berserat tinggi seperti brokoli, wortel, atau kacang panjang untuk meningkatkan skor.",
    reference: "PMK No. 41/2014, Tabel AKG 2019",
  }
}
```

### Komponen yang perlu dibuat

```
components/
  menu/
    nutrition-compliance-card.tsx ← Card hasil analisis lengkap
    nutrition-item-row.tsx        ← Baris per nutrisi dengan status icon
    compliance-score-bar.tsx      ← Progress bar skor 0–100
    ai-suggestion-box.tsx         ← Box saran AI dengan referensi
```

---

## Struktur File Keseluruhan

```
apps/web/
├── app/portal/
│   ├── asisten/
│   │   └── page.tsx           ← Halaman baru RAG Assistant (full-page)
│   ├── sop/
│   │   └── page.tsx           ← JANGAN DIUBAH — biarkan tetap statis
│   ├── reports/
│   │   └── page.tsx           ← Tambah anomaly + fraud section
│   ├── checkpoints/
│   │   └── page.tsx           ← Tambah fraud alert banner
│   └── menu/
│       └── page.tsx           ← Tambah nutrition compliance card
│
├── components/
│   ├── asisten/
│   │   ├── chat-area.tsx
│   │   ├── chat-message.tsx
│   │   ├── source-badge.tsx
│   │   ├── suggested-questions.tsx
│   │   ├── category-sidebar.tsx
│   │   └── category-dropdown.tsx
│   ├── reports/
│   │   ├── anomaly-card.tsx
│   │   ├── anomaly-filter-bar.tsx
│   │   ├── anomaly-trend-chart.tsx
│   │   └── fraud-case-card.tsx
│   └── menu/
│       ├── nutrition-compliance-card.tsx
│       ├── nutrition-item-row.tsx
│       └── ai-suggestion-box.tsx
│
└── lib/mock-data/
    ├── rag-responses.ts
    ├── anomaly-detection.ts
    ├── fraud-detection.ts
    └── nutrition.ts
```

---

## Urutan Pengerjaan yang Disarankan

```
Hari 1:  Setup mock data semua fitur (lib/mock-data/)
Hari 2:  RAG SOP Chat Widget — ini yang paling wow di demo
Hari 3:  Anomaly Detection cards + filter
Hari 4:  Fraud Detection tab + alert di checkpoints
Hari 5:  Nutrition Compliance Checker
```

---

## Catatan Penting

- **Semua fitur adalah frontend-only** — tidak ada fetch ke API. Semua data dari `lib/mock-data/`.
- **Loading state wajib ada** di setiap fitur AI — minimal `setTimeout` 1.5–2 detik dengan spinner dan teks seperti *"AI sedang menganalisa..."* atau *"Mencari di dokumen resmi..."*
- **Gunakan `packages/ui`** untuk Button, Card, Badge, Input, Tabs — jangan buat komponen baru yang sudah ada.
- **Markdown rendering** di RAG chat bisa pakai `react-markdown` atau render manual untuk bold dan bullet.
- **Chart** di anomaly trend bisa pakai `recharts` yang kemungkinan sudah ada di dependencies.
- Kalau ada pertanyaan soal flow besar atau konteks platform, tanya langsung ke gw.
