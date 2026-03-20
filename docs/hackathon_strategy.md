# Strategi Memenangkan Hackathon BI x OJK (FEKDI)

## Problem Statement Kamu

```
Theme:       Percepatan Layanan Publik, Ekonomi Kreatif, & Ekspor Jasa Digital
Sub-theme:   Digitalisasi Layanan Publik & Pariwisata
Use case:    Platform Perizinan dan Pengawasan Vendor MBG
```

---

## 1. Pahami Apa yang Juri Cari

Berdasarkan riset FEKDI 2025, juri menilai berdasarkan:

| Kriteria | Bobot | Apa artinya untuk kamu |
|----------|-------|----------------------|
| **Inovasi & Kreativitas** | Tinggi | Bukan cuma CRUD — harus ada "wow factor" (AI, blockchain) |
| **Relevansi & Impact** | Tinggi | Harus selesaikan masalah NYATA MBG, bukan fiktif |
| **Implementasi Teknis** | Tinggi | **Wajib pakai AI/ML dan/atau Blockchain** — ini bukan opsional |
| **Feasibility & Scalability** | Sedang | Bisa jalan, bisa di-deploy, bisa scale nasional |
| **Presentasi** | Sedang | Demo yang hidup, storytelling yang kuat |

> [!CAUTION]
> **AI/ML dan Blockchain bukan fitur tambahan — ini REQUIREMENT dari hackathon.** Solusi tanpa komponen AI atau blockchain akan sangat sulit menang. Juri BI x OJK secara eksplisit minta penggunaan teknologi ini.

---

## 2. Masalah MBG yang NYATA (Gunakan di Pitch)

Dari riset berita dan laporan pemerintah, ini masalah nyata MBG yang bisa kamu referensi:

| Masalah | Sumber | Bagaimana platform kamu menyelesaikannya |
|---------|--------|----------------------------------------|
| **1.030+ SPPG ditutup/ditangguhkan** karena tidak penuhi standar sanitasi (SLHS) dan IPAL | Readers.id, KabarBaik.co | → **Perizinan digital**: validasi otomatis SLHS/NKV/BPOM sebelum vendor beroperasi |
| **Keracunan makanan** berulang kali terjadi (lele mentah, makanan basi, berbelatung) | Kompas.com | → **AI checkpoint photo validation**: deteksi visual kualitas makanan |
| **Ombudsman temukan SOP belum memadai** untuk verifikasi dapur/yayasan | Ombudsman.go.id | → **Digitalisasi SOP + scoring**: automated compliance tracking |
| **Budget Rp71 Triliun** memicu kekhawatiran transparansi dan "pembajakan" anggaran | TimesIndonesia, Kompasiana | → **Blockchain audit trail**: immutable ledger untuk setiap transaksi |
| **Hanya 6.2% target SPPG** yang beroperasi, 49.7% target penerima tercapai | Pelakita.id | → **Dashboard real-time** untuk monitoring coverage gap dan percepatan |
| **UMKM lokal sulit masuk** sebagai vendor/supplier, didominasi usaha besar | UKMIndonesia.id | → **Marketplace yang fair** dengan verifikasi UMKM lokal |
| **Kejaksaan Agung dan BPKP** terlibat audit penggunaan anggaran | Bloomberg Technoz | → **Blockchain hash** per transaksi untuk audit trail yang tak bisa dimanipulasi |

> [!TIP]
> **Saat presentasi, buka dengan data ini.** Juri BI/OJK menghargai solusi yang grounded dengan masalah nyata, bukan "kami bikin platform karena keren."

---

## 3. Bagaimana Menang: 3 Senjata Utama

### 🗡️ Senjata 1: AI/ML — "Mata Digital BGN"

Ini diferensiasi utama kamu. Tunjukkan bahwa AI bukan gimmick, tapi **memecahkan masalah nyata**:

| AI Feature | Masalah yang Dipecahkan | Implementasi |
|-----------|------------------------|-------------|
| **AI Photo Checkpoint** | Keracunan makanan, makanan tidak layak | Vision API validasi foto bahan mentah, proses masak, makanan jadi |
| **AI Nutrition Compliance** | Menu tidak sesuai standar PMK gizi | RAG + rules engine cek apakah menu memenuhi standar kalori/protein |
| **AI Anomaly Detection** | Fraud: vendor klaim porsi lebih dari aktual | ML deteksi pola anomali (porsi vs faktur vs foto) |
| **RAG SOP Assistant** | Vendor tidak paham aturan → pelanggaran | Chatbot berbasis knowledge base SOP |
| **AI Risk Scoring** | SPPG bermasalah tidak terdeteksi dini | Scoring model prediksi vendor mana yang berisiko |

**Yang harus di-demo:**
Minimal **2 dari 5** fitur AI di atas. Rekomendasi: **Photo Checkpoint + Nutrition Compliance** — karena keduanya visual dan gampang di-demo.

---

### 🗡️ Senjata 2: Blockchain — "Trust Layer"

BI dan OJK punya concern besar soal **transparansi keuangan**. Blockchain adalah jawaban yang mereka mau dengar:

| Blockchain Feature | Masalah yang Dipecahkan | Implementasi |
|-------------------|------------------------|-------------|
| **Immutable Audit Trail** | Manipulasi data transaksi | Setiap skor checkpoint, PO, dan pencairan dana di-hash ke blockchain |
| **Smart Contract Escrow** | Dana disalahgunakan sebelum makanan dikirim | Dana auto-release saat checkpoint CP4 (serah terima) terverifikasi |
| **Verifiable Credential** | Izin sanitasi/halal/BPOM dipalsukan | Sertifikat vendor sebagai on-chain credential yang bisa di-verify publik |

**Yang harus di-demo:**
Kamu sudah punya `apps/contracts` (Solidity/Hardhat) di monorepo. Buat **1 smart contract sederhana** untuk escrow payment + audit hash.

> [!IMPORTANT]
> **Blockchain tidak perlu complex.** Juri tidak akan audit Solidity kamu. Yang penting: tunjukkan **WHY** blockchain (trust + transparency), bukan seberapa complex contractnya. Bahkan hash transaksi yang ditulis ke chain pun sudah cukup kuat narrativenya.

---

### 🗡️ Senjata 3: Storytelling — "Hari dalam Kehidupan Vendor"

Hackathon dimenangkan di **presentasi**, bukan di code. Pitch kamu harus mengikuti struktur ini:

```
1. MASALAH (2 menit)
   "1.030 SPPG ditutup. Keracunan makanan berulang.
    Rp71T anggaran tanpa audit trail digital."

2. SOLUSI (3 menit)
   Demo LIVE: walk-through satu hari vendor →
   Plan menu → Calculate ingredients → Source from supplier →
   Cook + Photo checkpoint (AI validates) →
   Deliver (school confirms) → Score + Payment (blockchain)

3. TEKNOLOGI (2 menit)
   AI: Photo validation + nutrition check + fraud detection
   Blockchain: Escrow + audit trail + verifiable credentials

4. IMPACT (2 menit)
   "Dari 25.570 SPPG, baru 6.2% operasional.
    Platform ini bisa mempercepat verifikasi dan scale
    pengawasan tanpa menambah orang."

5. SCALABILITY (1 menit)
   "Platform agnostic — bisa dipakai untuk program
    bansos lain (PKH, BPNT, Kartu Prakerja)."
```

---

## 4. Apa yang Harus Di-Build Sebelum Demo

**Fokus pada apa yang BISA DI-DEMO, bukan apa yang production-ready.**

### ✅ Harus Jadi (Demo-Critical)

| Fitur | Effort | Kenapa Critical |
|-------|--------|----------------|
| Daily loop walk-through (jadwal → menu → kalkulasi → marketplace) | 2 hari | Ini backbone demo kamu |
| AI Photo Checkpoint (upload foto → AI response) | 2–3 hari | **WOW factor #1** |
| Blockchain audit hash (tulis hash ke chain) | 1–2 hari | **WOW factor #2** |
| Dashboard dengan data real-looking | 1 hari | First impression |
| Public transparency page | 1 hari | Menunjukkan akuntabilitas |

### ⚠️ Sebaiknya Jadi (Nice to Demo)

| Fitur | Effort |
|-------|--------|
| RAG SOP chatbot | 2 hari |
| Nutrition compliance AI check | 1 hari |
| School QR confirm | 1 hari |
| Smart contract escrow | 1–2 hari |

### ❌ Skip untuk Demo

| Fitur | Kenapa Skip |
|-------|------------|
| Real-time chat | Tidak impress juri BI/OJK |
| GPS logistics | Terlalu complex, low ROI untuk demo |
| Settings/Profile | Boring untuk ditunjukkan |
| Admin RBAC detail | Sudah jadi, tapi tidak exciting di demo |

---

## 5. Competitive Edge — Apa yang Membuat Kamu Beda

| Kompetitor mungkin bikin... | Kamu punya yang mereka tidak... |
|----------------------------|---------------------------------|
| Dashboard monitoring biasa | ✅ **Full vendor lifecycle** — dari registrasi sampai bayar |
| Laporan statis | ✅ **AI photo validation** — bukan report, tapi real-time prevention |
| Database audit log | ✅ **Blockchain audit trail** — immutable, bisa di-verify publik |
| 1 role saja | ✅ **Multi-role** — Vendor, Supplier, Sekolah, Admin, Publik |
| Mock prototype | ✅ **Working product** — Auth berjalan, RBAC production-ready, DB schema lengkap |

---

## 6. Saran Terakhir

| # | Saran |
|---|-------|
| 1 | **Jangan tunjukkan semua 25 page.** Tunjukkan 1 flow yang smooth: daily operations loop |
| 2 | **Buka dengan data nyata** (1.030 SPPG ditutup, keracunan makanan) — juri BI/OJK respect data |
| 3 | **AI harus live di demo.** Upload foto → dapat hasil AI → "Terdeteksi: makanan layak, skor 92/100" |
| 4 | **Blockchain harus visible.** Tampilkan hash transaksi di halaman publik → "siapa saja bisa verify" |
| 5 | **Sebut BI SNAP API** untuk payment — ini menunjukkan kamu aware ekosistem BI |
| 6 | **Sebut skalabilitas ke bansos lain** — juri suka solusi yang bisa dipakai lebih luas |
| 7 | **Siapkan slide "Architecture"** yang menunjukkan AI + Blockchain + Multi-platform (Web + PWA) |
| 8 | **Jangan demo login flow berlebihan** — langsung ke daily operations |
