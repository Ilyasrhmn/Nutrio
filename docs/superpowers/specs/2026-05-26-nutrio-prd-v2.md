# PRD v2 — Nutrio: Platform Perizinan & Monitoring Vendor MBG

**Versi:** 2.0  
**Tanggal:** 26 Mei 2026  
**Status:** Draft — Enhanced dengan Wireframe Flows, Component Notes, Integration Contracts  
**Changelog v2:** Tambah Section 3.5 (Integration Map) + wireframe flow + component notes + integration contract per fitur

---

## 1. Ringkasan Produk

### Visi
Nutrio adalah sistem operasi digital untuk ekosistem MBG (Makan Bergizi Gratis) — menghubungkan calon vendor, vendor aktif, tim dapur, mitra pengiriman, sekolah penerima, dan pengawas BGN dalam satu platform yang memandu setiap pihak melakukan hal yang benar pada waktu yang tepat.

### Problem Statement

> Vendor SPPG tidak mematuhi standar BGN bukan karena tidak mau, tetapi karena **tidak pernah benar-benar memahami apa yang diminta, kenapa diminta, dan apa konsekuensinya** — sementara tidak ada sistem yang mengajarkan mereka sambil mereka beroperasi.

Tiga root cause yang diidentifikasi:

| # | Root Cause | Manifestasi |
|---|-----------|-------------|
| 1 | Regulasi ditulis untuk birokrat, bukan vendor | Juknis BGN menggunakan bahasa hukum yang tidak dipahami UMKM |
| 2 | Tidak ada panduan just-in-time | Vendor baru tahu salah setelah kena penalti, bukan sebelumnya |
| 3 | Staf ≠ Owner | Owner mungkin paham aturan, tetapi eksekutor di dapur tidak pernah membaca apapun |

### Konteks Hackathon
Platform ini dibangun untuk kompetisi BI x OJK (FEKDI) dengan tema Digitalisasi Layanan Publik. Dua requirement wajib dari penyelenggara: **AI/ML** dan **Blockchain**. Keduanya bukan fitur tambahan — keduanya menjawab masalah nyata di lapangan.

---

## 2. Pengguna

### 2.1 Persona Primer

**Calon Vendor — "Bu Ratna"**
- Punya katering rumahan 5 tahun, ingin jadi SPPG
- Tidak punya staf admin, semua diurus sendiri
- Pertama kali mendengar soal SLHS, NKV, BPOM dari grup WhatsApp
- Sudah ke kantor dinas sekali, disuruh balik karena dokumen kurang
- Kebutuhan utama: tahu dokumen apa yang dibutuhkan dan cara mendapatkannya

**Vendor Aktif — "Pak Hendra"**
- Sudah 3 bulan jadi SPPG, punya 4 staf dapur
- Memasak untuk 300 porsi per hari
- Beberapa kali kena penalti tapi tidak tahu alasannya
- Staf kadang lupa foto karena sibuk memasak
- Dana sering cair terlambat dan jumlahnya berbeda-beda
- Kebutuhan utama: tahu apa yang harus dilakukan setiap hari dan mendapat feedback langsung

### 2.2 Sub-Role dalam Satu Vendor

| Role | Interface | Tugas Utama |
|------|-----------|------------|
| Owner/Manajer SPPG | Web portal | Planning, keuangan, laporan, monitoring tim |
| Kepala Dapur | PWA | Koordinasi checkpoint, SOP harian |
| Staf Masak | PWA | Eksekusi tugas hari ini, foto checkpoint |
| Kurir/Delivery | Web link (tanpa akun) | Konfirmasi pengiriman, GPS, foto serah terima |

**Catatan penting:** Kurir bisa pihak ketiga (ojek, ekspedisi). Mereka tidak diharuskan install aplikasi atau registrasi.

### 2.3 Persona Sekunder

**Pihak Sekolah (Verifikator Pasif)**
- Hanya memverifikasi penerimaan makanan
- Tidak memiliki akun — cukup scan QR dari kurir
- Interface: halaman web sederhana, dua tap selesai

**BGN/Admin Pengawas**
- Mengawasi puluhan hingga ratusan SPPG per wilayah
- Butuh visibilitas real-time terhadap risiko, bukan semua data
- Berwenang memberikan pembinaan, peringatan, suspend, hingga cabut izin

**Publik / Auditor Eksternal**
- Akses read-only ke dashboard transparansi
- Tidak butuh akun
- Dapat memverifikasi keabsahan data melalui blockchain

---

## 3. Arsitektur Platform

Platform terdiri dari **tiga dunia** dengan entry point dan UX yang berbeda:

```
┌─────────────────────────────────────────────────────────────────┐
│                        NUTRIO PLATFORM                          │
├──────────────────┬──────────────────┬───────────────────────────┤
│   DUNIA 1        │   DUNIA 2        │   DUNIA 3                 │
│   PERIZINAN      │   OPERASIONAL    │   PENGAWASAN              │
│                  │                  │                           │
│  Calon Vendor    │  Vendor Aktif    │  BGN/Admin                │
│  → Eligibility   │  → Daily Mode    │  → Command Center         │
│  → Dokumen       │  → Scoring       │  → Risk Intelligence      │
│  → Inspeksi      │  + Staff PWA     │  + Public Dashboard       │
│  → Onboarding    │  + Delivery Link │                           │
└──────────────────┴──────────────────┴───────────────────────────┘
```

**Prinsip arsitektur:**
- Ketiga dunia terhubung data, tetapi UX-nya sepenuhnya berbeda
- Platform "drive" user ke langkah berikutnya — bukan user yang harus navigasi
- RAG assistant adalah lapisan yang mengalir di seluruh platform, bukan halaman terpisah

---

## 3.5 Integration Map

### A. Vendor Lifecycle State Machine

```
ANONYMOUS
  │
  ▼ [Eligibility Wizard selesai]
ELIGIBILITY_CHECKED
  │
  ▼ [Buat akun]
REGISTERED
  │
  ▼ [Mulai upload dokumen]
PREPARING_DOCS
  │
  ▼ [Semua dokumen AI-validated + submitted]
DOCS_SUBMITTED
  │
  ▼ [Book inspeksi]
INSPECTION_SCHEDULED
  │
  ▼ [Petugas BGN submit form inspeksi]
INSPECTION_COMPLETED
  │
  ▼ [Auto-transition]
UNDER_REVIEW
  │
  ├──▶ [BGN request revisi] ──▶ REVISION_REQUESTED
  │                                    │
  │                                    ▼ [Vendor resubmit]
  │                              DOCS_SUBMITTED (ulang)
  │
  ▼ [BGN approve]
APPROVED
  │
  ▼ [Auto-transition, wajib selesaikan wizard]
ONBOARDING
  │
  ▼ [Semua 5 step wizard selesai]
ACTIVE  ◀──────────────────────────────────────┐
  │                                            │
  ├──▶ [BGN suspend, 2-level approval] ──▶ SUSPENDED
  │                                            │
  │                                    [BGN reinstate] ─┘
  │
  ▼ [BGN revoke, 2-level approval]
REVOKED
```

### B. Daily Operations Chain (CP1→CP4)

Urutan wajib setiap hari — tidak bisa di-skip atau di-reorder:

```
DAY START (00:00)
  │  Semua 4 checkpoint: status = PENDING
  │  Skor hari ini: 100
  │
CP1 Window: 07:00–08:00
  │  Sebelum 07:00: tombol CP1 terkunci
  │  07:00: CP1 UNLOCKED
  │  Lewat 08:00 tanpa submit → penalti terlambat otomatis
  ▼
CP1 DONE
  │  → CP2 UNLOCKED
  │  → Timer 4-Jam Golden Rule dimulai (backend timestamp)
  │  → Skor partial diupdate
  │
CP2 Window: 08:30–11:00
  │  Bergantung CP1 selesai
  │  Jika CP2 submit > 4 jam sejak CP1: Golden Rule violation -20
  ▼
CP2 DONE
  │  → CP3 UNLOCKED
  │
CP3 Window: 11:00–11:30
  ▼
CP3 DONE
  │  → Delivery Token di-generate (UUID, single-use, expired 4 jam)
  │  → CP4 UNLOCKED via delivery token
  │
CP4 Window: 12:00–13:00
  │  Dua sisi harus konfirmasi:
  │  [A] Kurir: GPS arrival + foto + klik selesai
  │  [B] Sekolah: scan QR → konfirmasi penerimaan
  │  CP4 = DONE hanya jika A dan B keduanya selesai
  ▼
CP4 DONE (semua sekolah)
  │  → Daily Debrief ter-generate otomatis (<30 detik)
  │  → Skor final dihitung
  │  → Blockchain hash ditulis
  │  → Disbursement estimate diupdate
  │
FORCE-CLOSE CRON (14:00)
  → Semua checkpoint yang belum done: skor 0 untuk hari itu
  → Jika tidak ada checkpoint sama sekali: -50
```

### C. Cross-World Data Dependencies

| Source (Dunia) | Event | → | Target (Dunia) | Data yang mengalir |
|----------------|-------|---|----------------|-------------------|
| Dunia 1 — Onboarding selesai | Vendor status = ACTIVE | → | Dunia 2 | Daily Mode unlocked untuk vendor + semua team members |
| Dunia 2 — Checkpoint event | CP selesai / terlambat / gagal | → | Dunia 3 | Score event + alert jika kritis |
| Dunia 2 — Scoring harian | Skor berubah real-time | → | Dunia 3 Command Center | Live score feed per SPPG via WebSocket |
| Dunia 2 — Fraud pattern | Anomali foto / GPS / porsi | → | Dunia 3 Risk Intelligence | Fraud flag + confidence score |
| Dunia 3 — BGN Suspend | Vendor status = SUSPENDED | → | Dunia 2 | Daily Mode locked, semua staf diblokir |
| Dunia 3 — BGN Revoke | Vendor status = REVOKED | → | Dunia 1 | Izin invalidated, public profile diupdate |
| Dunia 2 — CP4 selesai | Konfirmasi sekolah masuk | → | Blockchain | Hash ditulis ke chain |
| Dunia 2 — Skor final harian | Daily Debrief complete | → | Dunia 3 + Blockchain | Disbursement pending record dibuat, hash ditulis |

### D. Event → Side Effect Map

| Event | Side Effects |
|-------|-------------|
| CP1 submitted | CP2 unlocked · 4h countdown starts · skor partial update · blockchain hash queued · WebSocket push ke Mission Control |
| CP2 submitted | CP3 unlocked · Golden Rule checked (jika >4j: -20 + alert owner) |
| CP3 submitted | Delivery Token generated · CP4 unlocked · jika porsi kurang: notify owner + prompt incident |
| CP4 kurir confirmed | Tunggu sekolah confirmation sebelum CP4 = DONE |
| CP4 sekolah confirmed | CP4 DONE · skor update · Daily Debrief triggered · blockchain hash queued |
| Skor turun >10 poin 1 event | Push notification ke owner |
| Daily Debrief generated | Blockchain final score written · disbursement_pending created |
| Fraud pattern detected | BGN Command Center alert · vendor flagged untuk review |
| BGN Suspend approved | vendor_status = SUSPENDED · Daily Mode locked · vendor notified real-time |
| BGN Revoke approved | vendor_status = REVOKED · public profile updated · blockchain hash written |

---

## 4. Fitur — Dunia 1: Perizinan

### 4.1 Eligibility Check

**Deskripsi:** Wizard percakapan 5–7 pertanyaan yang dijalankan *sebelum* registrasi apapun. Menghasilkan peta jalan personal berdasarkan kondisi calon vendor.

**User story:** Sebagai calon vendor, saya ingin tahu apakah saya sudah memenuhi syarat dan apa yang perlu saya siapkan, sebelum saya mengisi form apapun.

**Requirements:**
- Pertanyaan ditampilkan satu per satu (bukan sekaligus)
- Pilihan jawaban berbentuk multiple choice
- Output adalah daftar dokumen personal: mana yang sudah ada, mana yang belum, dan estimasi waktu + biaya mendapatkannya
- RAG assistant proaktif memberikan konteks regulasi relevan di setiap jawaban
- Dapat diakses tanpa login

**Acceptance criteria:**
- [ ] Calon vendor mendapat output dalam < 3 menit
- [ ] Output menyebutkan secara spesifik dokumen yang dibutuhkan berdasarkan jawaban (bukan generic)
- [ ] Estimasi waktu dan biaya per dokumen ditampilkan
- [ ] Wizard tidak dapat di-skip ke hasil tanpa menjawab semua pertanyaan
- [ ] Browser back selama wizard memunculkan konfirmasi modal (progress hilang jika keluar)

#### 4.1 — Wireframe Flow

**Screen 1: Landing (pre-login)**
- Hero CTA: "Cek Kelayakan Saya" (tombol prominent, tidak memerlukan scroll)
- Subtext: "Jawab 7 pertanyaan singkat — kami buatkan rencana dokumen personal kamu"
- No login required

**→ Tap CTA → Screen 2: Wizard Q1**

**Screens 2–8: Wizard Q1–Q7 (sequential)**

| Q | Pertanyaan | Tipe Jawaban |
|---|-----------|-------------|
| 1 | Apakah Anda sudah pernah menjalankan usaha katering/makanan? | Ya, sudah resmi / Ya, belum resmi / Belum sama sekali |
| 2 | Berapa kapasitas produksi harian yang Anda targetkan? | < 100 porsi / 100–300 / 300–1.000 / > 1.000 |
| 3 | Bagaimana status lokasi dapur Anda? | Terpisah dari rumah / Bergabung dengan dapur rumah / Belum punya lokasi tetap |
| 4 | Dokumen usaha apa yang sudah Anda miliki? (multi-select) | NIB / PIRT / SLHS / NKV / Halal / BPOM / Belum punya |
| 5 | Apakah Anda pernah mengikuti pelatihan keamanan pangan? | Ya, punya sertifikat / Pernah, tanpa sertifikat / Belum pernah |
| 6 | Berapa staf yang akan Anda libatkan? | < 3 orang / 3–10 / > 10 |
| 7 | Di kabupaten/kota mana dapur Anda berada? | Dropdown/search |

Layout per pertanyaan:
- Progress indicator: "Pertanyaan 3 dari 7"
- Pertanyaan: heading besar
- Pilihan: tap-friendly cards (bukan radio button kecil)
- RAG Hint: teks kecil di bawah pilihan — "Kenapa ini penting?" — expand on tap

**→ Q7 submit → Screen 9: Processing (1–3 detik)**

**Screen 9: Processing**
- Spinner + "Menyiapkan rencana dokumen kamu..."
- AI memproses jawaban → generate PersonalRoadmap

**Screen 10: Hasil — Personal Roadmap**

Sections:
- **✅ Sudah Kamu Punya:** DocumentStatusCard per dokumen yang sudah dimiliki
- **⏳ Perlu Kamu Siapkan:** DocumentStatusCard dengan estimasi waktu + biaya per dokumen
- **⚠️ Perlu Perhatian:** Flag jika ada hambatan (e.g., kapasitas terlalu kecil untuk target porsi)
- CTA Primer: "Mulai Persiapan Dokumen" → requires account creation
- CTA Sekunder: "Kirim Hasil ke Email" (simpan tanpa akun)

**Error states:**
- Network error saat processing: tombol "Coba Lagi" (jawaban tersimpan, tidak perlu ulang)
- User tekan back selama wizard: modal konfirmasi "Progress akan hilang. Yakin keluar?"

#### 4.1 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `WizardProgressBar` | Horizontal, fill per step, animated, shows step N/7 |
| `QuestionCard` | Full-width card, heading besar, answer options sebagai card rows |
| `AnswerOptionCard` | Tap target min 48px height, icon opsional, selected state dengan border highlight |
| `RAGHintAccordion` | Collapsed by default, expand on tap, max 2-3 kalimat plain language |
| `DocumentStatusCard` | Icon status (✅/⏳/⚠️) + nama dokumen + status chip + estimasi (badge waktu + biaya) |
| `ProcessingAnimation` | Lottie atau CSS spinner, dengan teks progress |
| `RoadmapResultPage` | Scrollable, sections color-coded, sticky CTA di bottom |

#### 4.1 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | Answers Q1–Q7 (no auth) |
| **AI Call** | RAG dipanggil per pertanyaan untuk konteks proaktif + saat generate hasil |
| **Output** | `PersonalRoadmap` {docsHave: [], docsMissing: [{name, estimatedDays, estimatedCost, regulationRef}], flags: []} |
| **Side effect** | Jika user buat akun setelah ini → roadmap otomatis di-save ke profil |
| **Storage** | Session-only (tidak disimpan di DB jika tidak buat akun) |
| **Next step** | 4.2 Persiapan Dokumen (requires auth) |
| **Dependencies** | Tidak ada (standalone, pre-auth) |

---

### 4.2 Persiapan Dokumen

**Deskripsi:** Guided preparation board — tampilan Kanban per dokumen dengan status TODO / IN PROGRESS / DONE. Setiap dokumen punya card dengan instruksi konkret dan upload area ber-AI validation.

**User story:** Sebagai calon vendor, saya ingin bisa mempersiapkan dokumen secara bertahap dan tahu persis apakah dokumen yang saya upload sudah benar.

**Requirements:**
- Setiap document card berisi: definisi plain language, cara mendapatkan, estimasi waktu/biaya, contoh foto valid, area upload
- AI validation saat upload: cek keterbacaan, tanggal kedaluarsa, kesesuaian nama
- Progress tersimpan otomatis — vendor bisa lanjut di sesi berbeda
- RAG assistant muncul proaktif saat card dibuka dan saat upload gagal validasi
- Notifikasi pengingat jika ada dokumen yang belum dilengkapi lebih dari 7 hari

**Acceptance criteria:**
- [ ] AI validation memberikan feedback spesifik (bukan hanya "gagal")
- [ ] Vendor dapat menyimpan progress dan melanjutkan tanpa kehilangan data
- [ ] RAG dapat menjawab pertanyaan spesifik per dokumen dengan mengutip regulasi yang relevan
- [ ] Upload dari galeri diterima (beda dari CP checkpoint — ini bukan live event)
- [ ] Notifikasi reminder terkirim setelah 7 hari tidak ada aktivitas di dokumen TO DO

#### 4.2 — Wireframe Flow

**Screen 1: Document Board (Kanban)**
- Header: "Persiapan Dokumen" + progress bar "X dari Y dokumen siap"
- Tiga kolom: **TO DO** | **DALAM PROSES** | **SELESAI**
- Setiap kolom: count badge + scrollable list of DocumentCards
- AI Status banner: "2 dokumen sedang divalidasi AI — biasanya <5 menit"
- Tombol "Jadwalkan Inspeksi" muncul (disabled) hingga semua dokumen = SELESAI

**→ Tap DocumentCard → Screen 2: Document Detail**

**Screen 2: Document Detail (Bottom Sheet / Full Page)**
- Header: nama dokumen + status chip
- **Section "Apa ini?"**: 2–3 kalimat plain language (tanpa jargon hukum)
- **Section "Cara mendapatkan"**: numbered steps (ke mana, bawa apa, bayar berapa)
- **Section "Estimasi"**: badge waktu (e.g., "5–7 hari kerja") + biaya (e.g., "Rp 150.000")
- **Section "Contoh dokumen valid"**: foto contoh (tap to zoom, overlay annotation jika ada)
- **Upload area**: drag & drop atau tap to browse, preview thumbnail setelah pilih
- Floating button: "Ada pertanyaan?" → buka RAG drawer

**→ Upload file → Screen 3: AI Validation**

**Screen 3A: AI Validation — PASS**
- Green success overlay muncul di atas card
- "✓ Dokumen terlihat valid"
- AI notes (jika ada): "Nama sesuai, tanggal berlaku masih valid hingga [tanggal]"
- Card otomatis pindah ke kolom DALAM PROSES
- Auto-dismiss setelah 3 detik

**Screen 3B: AI Validation — FAIL (dengan alasan spesifik)**
- Red overlay
- Pesan spesifik (contoh):
  - "Tanggal kedaluarsa tidak terbaca — coba foto ulang dari jarak lebih dekat"
  - "Nama di dokumen tidak sesuai dengan nama yang didaftarkan"
  - "File terlalu buram — pastikan pencahayaan cukup saat foto"
- Tombol: "Coba Lagi" | "Tanya RAG Cara Foto yang Benar"

**Screen 3C: AI Validation — PARTIAL (perlu manual review)**
- Yellow warning overlay
- "Kami perlu verifikasi lebih lanjut — tim kami akan mengecek dalam 24 jam"
- Card pindah ke DALAM PROSES dengan badge "Manual Review"

**Error states saat upload:**
- File > 10MB: "Kompres foto terlebih dahulu (max 10MB)"
- Format tidak didukung: "Upload JPG, PNG, atau PDF"
- Upload timeout: progress bar + "Koneksi lambat, sedang mencoba ulang..."

#### 4.2 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `KanbanBoard` | 3 kolom, horizontal scroll di mobile, sticky column headers |
| `DocumentCard` | Status chip (color-coded) + nama + thumbnail (jika sudah diupload) + AI result badge |
| `DocumentDetailSheet` | Bottom sheet 90% height, swipe to dismiss, persistent when scrolling |
| `DocumentExampleViewer` | Image fullscreen overlay dengan pinch-to-zoom, annotation markers |
| `UploadDropzone` | Tap + drag-drop, file preview sebelum submit, progress bar saat upload |
| `AIValidationToast` | Slides in dari atas, color-coded, auto-dismiss on success, persists on fail |
| `RAGDrawer` | Fullscreen sheet, conversation history per dokumen, sumber regulasi di-cite |
| `ManualReviewBadge` | Yellow chip "Sedang Dicek" pada card yang masuk manual review |

#### 4.2 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | File upload (JPG/PNG/PDF) + document_type + vendor_id |
| **AI Validation** | File → Vision API → `{status: pass/fail/partial, reason: string, confidence: float}` |
| **Output** | `document_record` diupdate di DB dengan status baru + photo_hash |
| **Side effect 1** | Semua dokumen status = SELESAI → 4.3 Penjadwalan Inspeksi unlocked |
| **Side effect 2** | Dokumen di TO DO selama > 7 hari → notifikasi reminder ke vendor |
| **Side effect 3** | Upload gagal validasi 3x → flag untuk review manual BGN |
| **Storage** | File di S3/MinIO, hash dicatat di DB |
| **Dependencies** | Requires auth (akun dari setelah 4.1) |

---

### 4.3 Penjadwalan & Pelaksanaan Inspeksi

**Deskripsi:** Vendor memilih slot inspeksi dari kalender online. Platform mengirim pre-inspection checklist. Petugas BGN mengisi form inspeksi di lapangan menggunakan platform yang sama.

**User story:** Sebagai calon vendor, saya ingin tahu persis apa yang akan dicek saat inspeksi sehingga saya tidak gagal karena hal yang seharusnya bisa disiapkan.

**Requirements:**
- Kalender booking inspeksi terintegrasi dengan jadwal petugas BGN
- Pre-inspection checklist dikirim otomatis H-3 inspeksi
- RAG menyimulasikan "perspektif inspektur" untuk setiap item checklist
- Petugas BGN punya form inspeksi digital yang menghasilkan laporan terstruktur
- Status inspeksi visible real-time ke vendor

**Acceptance criteria:**
- [ ] Vendor dapat book inspeksi tanpa harus menghubungi kantor
- [ ] Pre-inspection checklist spesifik berdasarkan profil dapur vendor tersebut
- [ ] Laporan inspeksi petugas tersimpan dan terhubung ke aplikasi vendor
- [ ] Jika semua slot penuh, vendor mendapat notifikasi otomatis saat ada slot baru
- [ ] Vendor dapat reschedule maksimal 1x per proses aplikasi

#### 4.3 — Wireframe Flow

**Screen 1: Kalender Booking**
- Monthly calendar view
- Slot tersedia: hijau dengan jumlah slot tersisa (e.g., "3 slot")
- Slot penuh: abu-abu, tidak bisa ditap
- Header: "Pilih tanggal inspeksi untuk dapur kamu di [kota]"
- Minimal booking: H+3 dari hari ini (preparation time)
- Tombol navigasi bulan: prev/next

**→ Tap tanggal tersedia → Screen 2: Pilih Waktu**

**Screen 2: Pilih Slot Waktu**
- List slot waktu (e.g., 09:00–11:00 | 13:00–15:00)
- Per slot: nama petugas yang akan datang + zona/kecamatan coverage
- InspectorCard: foto, nama, rating, jumlah inspeksi dilakukan

**→ Pilih slot → Screen 3: Konfirmasi Booking**

**Screen 3: Konfirmasi Booking**
- Summary: tanggal, jam, nama petugas, alamat dapur (konfirmasi)
- Preview 3 item checklist teratas: "Yang perlu kamu siapkan..."
- CTA: "Konfirmasi Booking"
- Note: "Checklist lengkap akan dikirim H-3 sebelum inspeksi"

**→ Confirm → Screen 4: Booking Confirmed**

**Screen 4: Booking Confirmed**
- Green checkmark animasi
- Detail booking + countdown to inspection date
- Tombol: "Tambah ke Kalender" (Google/Apple/iCal)
- Link: "Pantau Status Inspeksi"

**H-3 Notifikasi → Screen 5: Pre-Inspection Checklist**
- Dikirim via push notification / email
- Checklist items spesifik ke profil vendor:
  - Berdasarkan jawaban eligibility (kapasitas, tipe dapur)
  - Berdasarkan dokumen yang sudah diupload
  - Per item: deskripsi + RAG button "Bagaimana menyiapkan ini?"
- Self-check: vendor bisa centang item yang sudah siap (tidak wajib, untuk persiapan sendiri)

**Screen 6 (BGN Petugas): Inspection Form (mobile)**
- Vendor info: nama SPPG, alamat, profil singkat
- Checklist items: setiap item dengan toggle Yes / No / Partial
- Per item: field catatan opsional + foto evidence opsional
- Progress: "X dari Y item diisi"
- Submit button: aktif setelah semua item diisi

**Screen 7 (Vendor): Hasil Inspeksi**
- Status besar: **✅ LULUS** / **⚠️ PERLU PERBAIKAN** / **❌ TIDAK LULUS**
- Per item yang gagal:
  - Catatan resmi petugas (bahasa formal)
  - Plain language translation via RAG: "Artinya kamu perlu..."
  - Tombol: "Cara memperbaiki ini" → RAG deep dive
- Jika PERLU PERBAIKAN: deadline revisi + tombol "Jadwalkan Re-Inspeksi" (setelah perbaikan)

**Error states:**
- Semua slot penuh di bulan ini: "Tidak ada slot tersedia. Kami akan notifikasi kamu saat ada pembatalan."
- Petugas batalkan: notifikasi + opsi reschedule otomatis ditampilkan

#### 4.3 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `CalendarPicker` | Monthly grid, slot count per hari, touch-friendly cell size min 44px |
| `TimeSlotList` | Card per slot, InspectorCard embedded, availability badge |
| `InspectorCard` | Foto thumbnail + nama + rating stars + zona badge |
| `ChecklistAccordion` | Collapsible per item, RAG trigger button, self-check toggle |
| `InspectionResultCard` | Color-coded status, collapsible per item, formal note + plain language note |
| `CountdownTimer` | Days/hours to inspection, updates in real-time |

#### 4.3 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | vendor_id + selected_slot + inspector_id (auto-assign berdasarkan zona) |
| **Output** | `inspection_booking` record created |
| **H-3 automation** | Cron job generates personalized checklist → push notification + email |
| **Post-inspeksi** | Inspector submits form → `inspection_report` created → vendor status updated |
| **Side effect: LULUS** | → 4.4 Review BGN triggered (auto atau manual) |
| **Side effect: TIDAK LULUS** | → Re-inspection booking unlocked setelah vendor klik "siap" |
| **Dependencies** | 4.2 semua dokumen = SELESAI |

---

### 4.4 Review & Keputusan BGN

**Deskripsi:** Vendor dapat memantau status aplikasi mereka secara real-time dengan informasi posisi saat ini, estimasi keputusan, dan catatan reviewer.

**User story:** Sebagai calon vendor, saya tidak ingin dalam ketidakpastian — saya ingin tahu di mana posisi aplikasi saya dan apa yang perlu saya lakukan jika ada kekurangan.

**Requirements:**
- Status tracker visual (step-by-step progress bar)
- Estimasi waktu keputusan berdasarkan workload reviewer
- Jika ada penolakan/revisi: notifikasi dengan penjelasan konkret dalam bahasa plain, bukan bahasa hukum
- RAG menerjemahkan catatan reviewer formal ke bahasa yang dapat dipahami vendor
- Vendor dapat merespons dan resubmit dokumen yang diperbaiki langsung dari platform

**Acceptance criteria:**
- [ ] Vendor tidak perlu menelepon atau datang ke kantor untuk mengetahui status
- [ ] Setiap penolakan disertai penjelasan actionable yang dapat langsung ditindaklanjuti
- [ ] Jika review melewati SLA (10 hari kerja), vendor mendapat opsi "Tanya Status" otomatis
- [ ] Revisi dokumen dapat di-resubmit langsung dari notifikasi (tidak perlu navigate ke Kanban)

#### 4.4 — Wireframe Flow

**Screen 1: Application Status Tracker**
- Horizontal progress stepper:
  `[Dokumen ✓] → [Inspeksi ✓] → [Review BGN ←sini] → [Keputusan]`
- Current step: highlighted + animated pulse
- Estimated completion: "BGN biasanya memproses dalam 5–10 hari kerja. Estimasi: [tanggal]"
- Activity log (timeline): timestamped events dalam reverse chronological order
  - "26 Mei 14:32 — Laporan inspeksi diterima"
  - "23 Mei 09:15 — Semua dokumen terverifikasi"

**Screen 2A: Approved (push notification → screen ini)**
- Big green checkmark animasi
- "Selamat! Aplikasi kamu disetujui BGN"
- Details: Nomor izin + tanggal berlaku + masa berlaku
- CTA besar: "Mulai Onboarding" (wajib sebelum operasi)

**Screen 2B: Revision Requested (push notification → screen ini)**
- Header amber: "Ada yang perlu diperbaiki"
- Per item yang perlu direvisi:
  - Nama item (e.g., "Dokumen SLHS")
  - Catatan formal BGN: "[teks formal dari BGN]"
  - Plain language (via RAG): "Artinya: [penjelasan sederhana]"
  - CTA per item: "Perbaiki & Upload Ulang" → langsung ke upload area dokumen itu
- Deadline resubmit: "[tanggal], X hari lagi"
- CTA bawah: "Kirim Ulang Semua Dokumen yang Diperbaiki"

**Screen 2C: SLA Exceeded (auto-muncul jika > 10 hari kerja)**
- Yellow info banner di atas status tracker
- "Review melewati estimasi waktu. Kamu bisa mengirim pertanyaan ke BGN."
- Tombol: "Kirim Pertanyaan Status" → pre-filled message dikirim ke BGN admin

**Error states:**
- Vendor resubmit setelah deadline: warning + opsi minta perpanjangan

#### 4.4 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `ApplicationStepper` | Horizontal, icon per step, current step animated, completed steps checkmark |
| `TimelineEntry` | Timestamp + event label + optional detail expandable |
| `RevisionCard` | Nama item + formal catatan + plain language + action CTA |
| `SLAWarningBanner` | Sticky di top, dismissable, "Kirim Pertanyaan" CTA |
| `EstimationBadge` | Dynamic, berdasarkan workload BGN current queue |

#### 4.4 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | BGN reviewer action: `approve` / `request_revision` / `reject` + catatan per item |
| **Output** | `vendor_status` diupdate + `review_decision` record |
| **Side effect: Approve** | → vendor_status = APPROVED → 4.5 Onboarding unlocked |
| **Side effect: Revision** | → item-item dokumen di 4.2 di-reset ke TO DO + vendor notified |
| **Side effect: Reject** | → vendor notified dengan full explanation + appeal window (14 hari) |
| **SLA cron** | Setiap hari: cek review yang sudah >10 hari kerja → trigger SLA warning ke vendor + BGN |
| **Dependencies** | 4.3 inspection_report must exist |

---

### 4.5 Onboarding Aktif

**Deskripsi:** Mandatory wizard setelah approval sebelum vendor bisa GO LIVE. Mencakup setup profil, tambah tim, simulasi Daily Mode, dan koneksi supplier pertama.

**User story:** Sebagai vendor yang baru disetujui, saya ingin siap beroperasi dari hari pertama tanpa harus belajar sistem sendiri.

**Requirements:**
- Wizard tidak bisa dilewati — semua step wajib diselesaikan
- Step tambah anggota tim: vendor assign role per orang dan mereka mendapat undangan masuk platform
- Simulasi satu hari operasional (tutorial interaktif, bukan video)
- RAG dalam mode "mentor": memberikan tips dari pola vendor yang berhasil, bukan hanya regulasi
- Setelah wizard selesai: vendor mendapat "starter kit" — jadwal minggu pertama, supplier rekomendasi, checklist operasional

**Acceptance criteria:**
- [ ] Vendor menyelesaikan onboarding dalam < 30 menit
- [ ] Seluruh anggota tim sudah terdaftar sebelum vendor bisa operasi
- [ ] Vendor memahami alur Daily Mode sebelum hari pertama operasional
- [ ] Minimal 1 Kepala Dapur harus ditambahkan — tidak bisa skip step ini
- [ ] Simulasi Daily Mode mencakup happy path + 1 skenario error (foto gagal AI validation)

#### 4.5 — Wireframe Flow

**Screen 1: Onboarding Welcome**
- "Selamat datang, [nama vendor]! Satu langkah lagi sebelum kamu bisa mulai."
- Progress: 0 / 5 langkah
- Estimated time: "~25 menit"
- CTA: "Mulai Onboarding"
- Note merah kecil: "Semua langkah wajib — tidak bisa di-skip"

**Step 1: Profil SPPG (5 menit)**
- Upload logo/foto dapur
- Konfirmasi nama resmi SPPG (auto-filled dari izin)
- Deskripsi singkat usaha (max 200 karakter)
- Konfirmasi alamat + upload foto lokasi dapur
- Verifikasi nomor HP owner via OTP

**Step 2: Tambah Anggota Tim (10 menit)**
- Role selector: Kepala Dapur / Staf Masak / Admin
- Input per anggota: nama + nomor HP
- Platform kirim undangan via WhatsApp/SMS: "Kamu diundang bergabung ke SPPG [nama]..."
- Status undangan real-time: Terkirim / Diterima / Belum Merespons
- Blocking rule: minimal 1 Kepala Dapur harus Accept sebelum bisa lanjut
- Tombol: "Kirim Ulang Undangan" | "Tambah Anggota Lain"

**Step 3: Simulasi Daily Mode (8 menit)**
- Full-screen interactive tutorial menggunakan data contoh (tidak ada foto nyata diperlukan)
- Jalankan mock CP1: context → capture (foto demo, bukan kamera nyata) → validate (selalu pass) → confirm
- RAG muncul di setiap step dengan tips: "Tip: Staf biasanya lupa foto kemasan bagian belakang..."
- Setelah selesai mock CP1: "Bagus! Kamu sudah mengerti alurnya."

**Step 4: Koneksi Supplier (5 menit)**
- Search supplier dari marketplace (filtered by lokasi kota vendor)
- SupplierCard: nama + produk unggulan + rating + jarak
- "Tambahkan minimal 1 supplier untuk bahan pokok"
- Tombol: "Tambah Supplier Ini" per card
- Optional skip dengan warning: "Tanpa supplier terdaftar, kamu harus input manual di marketplace setiap hari"

**Step 5: Starter Kit (2 menit)**
- Jadwal minggu pertama (auto-generated berdasarkan sekolah yang di-assign BGN)
- Checklist operasional hari pertama: 8 item (dapat di-download/share)
- RAG mentor mode: "Vendor yang konsisten skor >85 biasanya memulai CP1 15 menit sebelum window buka..."
- Tombol export: PDF / share via WhatsApp

**→ Complete semua step → Screen 2: GO LIVE!**

**Screen 2: GO LIVE!**
- Confetti animasi
- "Kamu sekarang AKTIF sebagai SPPG. Hari pertama operasional dimulai besok."
- Summary: [X] anggota tim terdaftar | [Y] supplier connected | jadwal sudah siap
- CTA: "Lihat Mission Control" (menuju 5.1)

**Error states:**
- Undangan tim belum diterima setelah 10 menit: opsi resend + "Masukkan anggota secara manual (mereka bisa aktifkan akun nanti)"
- Supplier search kosong (lokasi terpencil): skip diizinkan dengan peringatan

#### 4.5 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `OnboardingStepList` | Numbered steps, locked/unlocked state, estimated time per step, check pada selesai |
| `TeamMemberRow` | Nama + role badge + status undangan chip (Terkirim/Diterima/Menunggu) |
| `InvitationStatusPoller` | Real-time polling status penerimaan undangan (setiap 10 detik) |
| `SimulationOverlay` | Full-screen guided tutorial, RAG tips overlay, mock data (tidak hit real API) |
| `SupplierSearchCard` | Nama + produk + rating + jarak + "Tambah" CTA |
| `StarterKitCard` | Scrollable checklist, exportable, preview jadwal minggu pertama |

#### 4.5 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | Completion of all 5 steps (enforced sequentially) |
| **Output** | `vendor_status` = ACTIVE + team_members registered + first_schedule created |
| **Side effect 1** | Daily Mode unlocked untuk owner + semua team members yang sudah accept |
| **Side effect 2** | BGN Command Center: vendor muncul di list SPPG aktif |
| **Side effect 3** | Supplier mendapat `vendor_connection_request` notification |
| **Undangan tim** | SMS/WhatsApp via platform messaging service, token expires 48 jam |
| **Dependencies** | 4.4 approval must be APPROVED |

---

## 5. Fitur — Dunia 2: Operasional Harian

### 5.1 Mission Control (Owner)

**Deskripsi:** Halaman utama owner — satu layar yang menampilkan semua informasi kritikal hari ini tanpa perlu navigasi ke mana-mana.

**User story:** Sebagai owner SPPG, saya ingin tahu kondisi operasional hari ini secara sekilas dan bisa intervensi jika ada masalah sebelum terlambat.

**Requirements:**
- Tampil: target porsi hari ini, menu, daftar sekolah tujuan
- Tampil: status login setiap anggota tim (online/offline)
- Tampil: status checkpoint real-time (belum mulai / sedang / selesai / terlambat)
- Tampil: skor live yang berubah setiap kali ada event
- Tampil: estimasi dana yang akan cair berdasarkan skor saat ini
- Notifikasi push jika ada checkpoint yang mendekati deadline atau gagal
- Streak counter: berapa hari berturut-turut skor ≥ 85

**Acceptance criteria:**
- [ ] Seluruh informasi kritikal visible di above-the-fold tanpa scroll
- [ ] Perubahan skor ter-update dalam < 5 detik setelah event terjadi
- [ ] Owner dapat menghubungi anggota tim langsung dari halaman ini
- [ ] Deadline approaching alert muncul 30 menit sebelum window tutup

#### 5.1 — Wireframe Flow

**Screen 1: Mission Control (no scroll required)**

Layout 4-panel (desktop) / stacked cards (mobile):

```
┌─────────────────────────────────────────────┐
│  Header: Selasa, 26 Mei · 300 porsi · [Menu preview]   │
├────────────┬──────────────────┬─────────────┤
│ TIM ONLINE │ CHECKPOINT STATUS│   SKOR LIVE │
│ 👤 Andi ✓ │ SDN Maju CP1 ✅  │    87 /100  │
│ 👤 Budi ✓ │ SDN Maju CP2 🟡  │   ↑ vs kemarin│
│ 👤 Cici ✗  │ SDN Harapan CP1✅│ Rp 2.3jt est│
│ [Hubungi]  │ SDN Harapan CP2⬜│ 🔥 12 hari  │
└────────────┴──────────────────┴─────────────┘
│ ⚠️ CP2 SDN Maju deadline dalam 28 menit — [Lihat]      │
└─────────────────────────────────────────────┘
```

**Tap nama tim anggota → ContactSheet**
- Nama + role + status online
- Tombol: "Hubungi via WhatsApp" | "Kirim Notifikasi di Platform"

**Tap checkpoint row → CheckpointDetail**
- Detail CP untuk sekolah tersebut: foto yang sudah diupload, timestamp, AI validation result
- Jika ada masalah: tombol "Tandai untuk Review"

**Tap skor → ScoreBreakdown**
- Breakdown lengkap penalti hari ini
- Timeline events: "08:42 CP1 SDN Maju: -0 (tepat waktu)" | "09:15 CP1 SDN Harapan: -2 (terlambat 12 menit)"

**Persistent alert strip (bottom):**
- Muncul saat ada deadline approaching atau checkpoint fail
- Color-coded: merah (kritis) / kuning (perhatian)
- Auto-dismiss setelah diaksi, tidak dismiss sendiri

**Error states:**
- Semua staf offline: banner merah "Tidak ada staf online saat ini"
- WebSocket disconnect: banner "Data mungkin tidak real-time — menyambungkan ulang..."
- Score API timeout: tampilkan skor terakhir yang diketahui + "(data mungkin tertunda)"

#### 5.1 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `DayHeaderBar` | Tanggal + total porsi + menu nama (tap untuk detail menu) |
| `TeamStatusGrid` | Avatar circles, online indicator (green dot), offline (grey), tap untuk contact |
| `CheckpointMatrix` | Grid: baris = sekolah, kolom = CP1-CP4, cell = status chip |
| `StatusChip` | ⬜ Belum / 🟡 Berjalan / ✅ Selesai / 🔴 Terlambat, color-coded |
| `ScoreLiveCard` | Angka besar animated on update, trend arrow, streak counter |
| `DisbursementEstimate` | Formatted Rp, basis: "berdasarkan skor saat ini (87)" |
| `AlertStrip` | Sticky bottom, dismissable per item, priority sort |

#### 5.1 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | Real-time events: checkpoint completions, score updates, team presence |
| **Data sources** | Checkpoint events (5.3) · Scoring engine (5.6) · Auth presence (team login status) |
| **Real-time delivery** | WebSocket push untuk score + checkpoint updates |
| **Fallback** | Polling setiap 10 detik jika WebSocket disconnect |
| **Push notification** | Kirim ke owner: CP approaching deadline (T-30 menit) + skor turun > 10 poin |
| **Output** | Read-only dashboard — tidak trigger events |
| **Dependencies** | 4.5 Onboarding selesai · schedule exists for today |

---

### 5.2 Daily Mode — Staff PWA

**Deskripsi:** Interface ultra-minimal untuk staf dapur. Hanya menampilkan satu tugas yang harus dilakukan sekarang, tanpa menu atau navigasi lain yang membingungkan.

**User story:** Sebagai staf dapur, saya ingin tahu apa yang harus saya lakukan sekarang tanpa harus mencari-cari di aplikasi.

**Requirements:**
- Landing screen hanya tampilkan: nama, tanggal, total porsi, dan satu tombol "TUGAS SEKARANG"
- Tugas berikutnya baru tampil setelah tugas saat ini selesai (tidak bisa skip)
- Setiap checkpoint mengikuti pola yang sama: CONTEXT → CAPTURE → VALIDATE → CONFIRM
- Kamera terbuka otomatis saat step CAPTURE
- Interface dapat dioperasikan satu tangan
- Berfungsi dengan koneksi internet minimal (offline queue jika sinyal buruk)

**Acceptance criteria:**
- [ ] Staf baru dapat menyelesaikan satu checkpoint penuh tanpa instruksi tambahan setelah 3x mencoba
- [ ] Seluruh flow checkpoint dapat diselesaikan dalam < 3 menit per checkpoint
- [ ] Foto yang gagal upload karena sinyal buruk tersimpan dan terkirim otomatis saat sinyal kembali
- [ ] Upload dari galeri ditolak dengan pesan jelas (live camera only)
- [ ] Tombol "TUGAS SEKARANG" di-lock jika window CP belum buka, dengan countdown

#### 5.2 — Wireframe Flow

**Screen 1: PWA Landing (post-login)**
- Full viewport, minimal chrome
- Top: nama staf + tanggal (kecil)
- Center: porsi hari ini (angka besar, e.g., "300 PORSI")
- Bottom 40%: satu tombol besar "TUGAS SEKARANG" (atau "BERIKUTNYA" jika ada CP sebelumnya done)
- Jika window CP belum buka: tombol disabled + countdown "CP1 mulai dalam 23 menit"
- Jika semua CP selesai: "✓ Semua tugas hari ini selesai. Sampai besok!"
- Tidak ada menu, tidak ada navigasi bottom bar, tidak ada hamburger

**→ Tap "TUGAS SEKARANG" → Screen 2: CONTEXT**

**Screen 2: CONTEXT**
- Full screen card
- Header: nama CP + jam window (e.g., "CP1 — Terima Bahan · 07:00–08:00")
- Body: penjelasan tugas dalam 2–3 kalimat sederhana
- Jika CP1: list bahan yang harus diterima hari ini (dari PO)
- Countdown timer jika mendekati deadline
- CTA bawah: "Mulai Foto" (full width)

**→ Tap "Mulai Foto" → Screen 3: CAPTURE**

**Screen 3: CAPTURE (live camera)**
- Kamera otomatis terbuka tanpa tap tambahan
- Fullscreen viewfinder
- Overlay guide: garis frame + teks panduan (e.g., "Pastikan semua bahan masuk frame")
- Shutter button: bottom center, besar (min 64px), one-thumb reachable
- Tombol flip camera: top right
- **Tidak ada akses galeri.** Jika file picker attempt: toast "Foto harus diambil langsung — galeri tidak diperbolehkan"

**→ Shutter → Screen 4: VALIDATE (loading)**

**Screen 4: VALIDATE — Loading (<5 detik)**
- Full screen loading
- Progress animation
- "AI sedang mengecek foto kamu..."

**Screen 4A: VALIDATE — PASS**
- Green full-screen flash + checkmark besar
- Brief AI feedback: "✓ Semua bahan terlihat. Kemasan dalam kondisi baik."
- Auto-advance ke CONFIRM setelah 2 detik

**Screen 4B: VALIDATE — FAIL**
- Red overlay + X
- Pesan spesifik 1 baris: "Beberapa bahan tidak terlihat jelas. Mundur sedikit agar semua masuk frame."
- CTA: "Foto Ulang"
- Setelah 3x fail: CTA berubah jadi "Lanjutkan dengan catatan manual review" + -5 penalti applied

**Screen 5: CONFIRM**
- Checklist visual: item-item yang perlu dikonfirmasi (gambar/icon bukan teks panjang)
- Input quantity jika diperlukan (e.g., "Jumlah porsi aktual: [input number]")
- CTA: "Konfirmasi Selesai" (aktif hanya setelah semua checklist di-tap)

**→ Confirm → Screen 6: CP DONE**

**Screen 6: CP Done**
- Checkmark animasi besar
- "CP1 Selesai! ✓"
- Skor partial update (muncul sebentar, auto-dismiss)
- Auto-return ke Screen 1 (Landing) — tombol "TUGAS SEKARANG" sekarang mengarah ke CP2
- Jika CP2 window belum buka: "CP2 akan tersedia mulai 08:30"

**Offline mode (banner persists):**
- Yellow banner atas: "📶 Offline — foto tersimpan lokal, akan terkirim saat ada sinyal"
- Staf tetap bisa complete flow — data di-queue di IndexedDB
- Saat online: "Mengirim X foto yang tertunda..." → success toast

#### 5.2 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `PWALanding` | Full viewport, single CTA, no navigation, tanggal + porsi info |
| `CPContextCard` | Full screen, large text, bahan list (jika CP1), countdown jika near deadline |
| `LiveCameraCapture` | Native camera API, no gallery, framing overlay, one-thumb shutter |
| `AIValidationScreen` | Full-screen overlay, animated, color-coded result, specific feedback text |
| `ConfirmChecklist` | Visual icons (bukan teks), tap to check, progress indicator |
| `OfflineBanner` | Sticky top, yellow, shows queue count, updates when syncing |
| `CPDoneAnimation` | Lottie or CSS, checkmark + brief score flash, 2-second auto-dismiss |

#### 5.2 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | Staf JWT + current day's checkpoint state |
| **Offline storage** | IndexedDB queue: foto + metadata + timestamp + GPS |
| **Sync on reconnect** | Service Worker triggers sync, processes queue in order |
| **Camera** | MediaDevices.getUserMedia() — live stream only, no file input fallback |
| **Gallery block** | No `<input type="file">` exposed to user. Any manual attempt: toast + block |
| **Side effects** | Setiap checkpoint submit → events di 5.3 Integration Contracts |
| **Dependencies** | 4.5 onboarding selesai · schedule untuk hari ini exists |

---

### 5.3 Checkpoint Flow (CP1–CP4)

**Deskripsi:** Empat checkpoint wajib harian yang harus diselesaikan berurutan, masing-masing dengan validasi AI dan pencatatan blockchain.

#### CP1 — Terima Bahan (07:00–08:00)

**Pengguna:** Staf Masak / Kepala Dapur (PWA)

**Flow:** Foto seluruh bahan dari PO hari ini → AI validasi kesegaran + kelengkapan → konfirmasi kondisi bahan

**Requirements:**
- Checklist visual kondisi bahan (gambar, bukan teks)
- Foto seluruh bahan dari PO hari ini
- AI validasi: kesegaran visual, kelengkapan vs PO, kondisi kemasan
- RAG proaktif: standar penyimpanan per jenis bahan

**Integration Contract CP1:**

| Aspek | Detail |
|-------|--------|
| **Input** | foto[] + kondisi_bahan_checklist + quantity_received + timestamp (auto) + GPS (auto) |
| **AI validation** | Vision API → `{pass/fail, items_detected[], anomalies[], confidence}` |
| **Output** | `checkpoint_event` {type: CP1, vendor_id, status, score_delta, timestamp, gps_hash, photo_hash[]} |
| **Unlock** | CP2 unlocked |
| **Timer** | 4-jam Golden Rule countdown starts dari CP1 timestamp |
| **Score** | Terlambat < 15 mnt: -2 · 15–60 mnt: -5 · > 60 mnt: -20 |
| **Blockchain** | Hash CP1 event diqueue untuk penulisan ke chain |
| **WebSocket** | Push ke owner Mission Control |

---

#### CP2 — Proses Masak (08:30–11:00)

**Pengguna:** Staf Masak (PWA)

**Flow:** Foto proses memasak aktif → AI validasi APD + kompor menyala + kebersihan → konfirmasi

**Requirements:**
- Golden Rule 4 Jam countdown aktif sejak CP1 selesai
- Foto proses memasak aktif
- AI validasi: kompor menyala visible, APD dipakai, kebersihan area
- RAG proaktif: suhu minimum per jenis bahan, standar higiene

**Integration Contract CP2:**

| Aspek | Detail |
|-------|--------|
| **Input** | foto[] + timestamp + GPS |
| **Additional check** | Verify `CP2.timestamp - CP1.timestamp < 4 jam` |
| **AI validation** | Deteksi: kompor menyala / APD (apron, hairnet) / kebersihan area |
| **Output** | `checkpoint_event` {type: CP2, ...} |
| **Unlock** | CP3 unlocked |
| **Score** | Golden Rule violation (>4 jam): -20 · Foto fail 3x: -5 |
| **Blockchain** | Hash CP2 event diqueue |

---

#### CP3 — Makanan Siap (11:00–11:30)

**Pengguna:** Kepala Dapur (PWA)

**Flow:** Foto makanan dikemas + label sekolah → input jumlah porsi aktual → AI validasi → generate delivery token

**Requirements:**
- Foto makanan sudah dikemas dengan label sekolah
- Input manual jumlah porsi aktual
- AI validasi: kemasan tertutup, label terbaca, jumlah kontainer sesuai
- Jika porsi kurang: notifikasi langsung ke owner + prompt buat laporan insiden

**Integration Contract CP3:**

| Aspek | Detail |
|-------|--------|
| **Input** | foto_kemasan[] + label_sekolah[] + jumlah_porsi_aktual + timestamp + GPS |
| **AI validation** | Deteksi: kemasan tertutup / label terbaca / jumlah kontainer match input |
| **Output** | `checkpoint_event` {type: CP3, ...} + `delivery_token` generated |
| **Delivery Token** | UUID · expired setelah 4 jam atau CP4 complete · single-use |
| **Porsi kurang** | Jika aktual < target: notify owner (push) + prompt "Buat Laporan Insiden" |
| **Unlock** | CP4 unlocked via delivery token (shared ke kurir) |
| **Blockchain** | Hash CP3 event diqueue |

---

#### CP4 — Serah Terima (12:00–13:00)

**Pengguna:** Kurir (delivery token link, tanpa akun) + Pihak Sekolah (QR scan)

**Flow:** Kurir tiba → GPS captured → foto serah terima → tampilkan QR → sekolah scan → keduanya konfirmasi → CP4 DONE

**Requirements:**
- Dilakukan oleh kurir (bisa pihak ketiga via delivery token)
- GPS aktif otomatis saat tiba di lokasi sekolah
- Foto serah terima
- QR ditampilkan untuk di-scan pihak sekolah
- Selesai hanya setelah kedua sisi (kurir + sekolah) konfirmasi

**Integration Contract CP4:**

| Aspek | Detail |
|-------|--------|
| **Input (kurir)** | delivery_token (URL param) + GPS_arrival + foto_serah_terima |
| **Input (sekolah)** | QR_token scan → `{jumlah_diterima, kondisi: baik/ada_masalah, masalah?: []}` |
| **Token validation** | Valid + not expired + not already used |
| **CP4 = DONE** | Hanya jika KEDUA kurir + sekolah konfirmasi |
| **Sekolah "Ada Masalah"** | -10 poin + create BGN alert flag |
| **Output** | `checkpoint_event` {type: CP4, ...} + `school_confirmation` |
| **Trigger** | Daily Debrief (5.7) · Final score calculation · Blockchain hash |
| **Timeout** | Kurir tidak complete dalam 30 menit sebelum deadline: notify owner |

**Requirements umum semua checkpoint:**
- Timestamp dan GPS dicatat otomatis — tidak bisa dimanipulasi manual
- Setiap foto mendapat hash yang ditulis ke blockchain
- AI validation real-time (< 5 detik) dengan feedback spesifik jika gagal
- Foto tidak bisa diupload dari galeri — harus diambil langsung (live camera only)

**Acceptance criteria:**
- [ ] Foto dari galeri ditolak sistem
- [ ] Blockchain hash tercatat dalam < 10 detik setelah checkpoint dikonfirmasi
- [ ] Fraud pattern (foto diambil sekaligus, metadata tidak konsisten) terdeteksi AI

---

### 5.4 Delivery Token — Kurir Pihak Ketiga

**Deskripsi:** Vendor generate link sekali pakai per pengiriman yang bisa dibuka tanpa akun oleh kurir pihak ketiga.

**User story:** Sebagai kurir, saya ingin bisa mengkonfirmasi pengiriman dengan cepat tanpa harus install aplikasi apapun.

**Requirements:**
- Link di-generate oleh vendor saat CP3 selesai
- Link hanya valid untuk satu pengiriman dan expired setelah CP4 selesai
- Interface kurir: nama sekolah tujuan, jumlah porsi, link maps, tombol GPS aktif, tombol foto, tombol selesai
- Tidak ada data pribadi kurir yang disimpan — hanya event delivery
- Jika kurir tidak menyelesaikan dalam batas waktu: notifikasi otomatis ke owner

**Acceptance criteria:**
- [ ] Kurir dapat menyelesaikan CP4 tanpa install app dan tanpa registrasi
- [ ] Owner mendapat notifikasi real-time jika delivery belum terkonfirmasi 30 menit sebelum deadline
- [ ] Link yang sudah digunakan tidak bisa dibuka lagi (expired page)
- [ ] QR display tetap visible di screen kurir sampai sekolah scan (tidak perlu reload)

#### 5.4 — Wireframe Flow

**Screen 1: Delivery Link (URL terbuka di browser, no login)**
- Header: logo Nutrio kecil + "Konfirmasi Pengiriman"
- Info card: "Dari: [nama SPPG]" · "Ke: [nama sekolah]" · "Porsi: [X]"
- Status: BELUM TIBA (initial)
- Tombol besar: "Saya Sudah Tiba di Sekolah" → capture GPS

**→ GPS captured → Screen 2: Ambil Foto**

**Screen 2: Ambil Foto Serah Terima**
- Status: SUDAH TIBA ✓
- Instruksi: "Foto makanan saat diserahkan kepada penerima"
- Kamera button: buka live camera (same constraint seperti staff PWA)
- Setelah foto: thumbnail preview + "Gunakan Foto Ini" | "Foto Ulang"

**→ Foto confirmed → Screen 3: Tampilkan QR**

**Screen 3: QR Code Display**
- QR besar di tengah screen
- Instruksi: "Minta staf sekolah scan QR ini"
- QR tetap visible (screen tidak sleep) — auto-prevent screen lock
- Status: "Menunggu konfirmasi sekolah..."
- Animated pulse indicator saat menunggu

**→ Sekolah scan → Screen 4: Complete**

**Screen 4: Pengiriman Selesai**
- Green checkmark animasi
- "Terima kasih! Pengiriman terkonfirmasi."
- Timestamp konfirmasi
- Halaman ini expired — link sudah tidak aktif

**Error states:**
- GPS tidak tersedia: "Izinkan akses lokasi untuk melanjutkan"
- QR tidak di-scan setelah 20 menit: reminder muncul "Belum dikonfirmasi — minta staf sekolah scan QR"
- Link expired: "Link ini sudah tidak aktif. Hubungi vendor jika ada pertanyaan."
- Link sudah digunakan: "Pengiriman ini sudah dikonfirmasi sebelumnya."

#### 5.4 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `DeliveryInfoCard` | Nama vendor + sekolah + porsi, no personal kurir data displayed |
| `GPSCaptureButton` | Besar, tap to capture GPS, shows "Lokasi Tercatat ✓" setelah berhasil |
| `QRDisplay` | Large QR, screen-wake-lock API, animated waiting state |
| `ConfirmationSuccess` | Full-screen green, one-time display, prevents back navigation |

#### 5.4 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | delivery_token (URL) + GPS + foto + QR_scan_from_school |
| **Token** | UUID, validated server-side: exists + not expired + not used |
| **Data stored** | Event only: GPS_arrival_time, photo_hash, school_confirmation — no kurir PII |
| **Token expiry** | 4 jam setelah dibuat, atau setelah CP4 complete (whichever first) |
| **Timeout notify** | Cron check T-30 menit sebelum window 13:00 → push ke owner jika CP4 belum selesai |
| **CP4 trigger** | Kurir done → tunggu school confirmation → CP4 = DONE |

---

### 5.5 Konfirmasi Sekolah (Verifikator Pasif)

**Deskripsi:** Pihak sekolah cukup scan QR dari kurir menggunakan kamera HP biasa — terbuka halaman web sederhana untuk konfirmasi penerimaan.

**User story:** Sebagai staf sekolah, saya ingin bisa mengkonfirmasi penerimaan makanan dengan cepat tanpa harus install aplikasi apapun.

**Requirements:**
- Tidak memerlukan akun atau instalasi apapun
- Form konfirmasi: jumlah porsi diterima + kondisi (Baik / Ada Masalah)
- Jika "Ada Masalah": satu pertanyaan lanjutan dengan pilihan singkat
- Response sekolah masuk ke skor CP4 vendor secara real-time
- Halaman expired setelah dikonfirmasi (tidak bisa konfirmasi dua kali)

**Acceptance criteria:**
- [ ] Pihak sekolah dapat konfirmasi dalam < 1 menit
- [ ] Konfirmasi duplikat dari QR yang sama ditolak sistem
- [ ] Sekolah tidak perlu scroll untuk menemukan tombol submit

#### 5.5 — Wireframe Flow

**Screen 1: Konfirmasi (setelah scan QR)**
- Header: "Konfirmasi Penerimaan Makanan"
- Info: "Dari: [nama SPPG]" · "Hari ini, [tanggal]"
- Form sederhana:
  - "Berapa porsi yang diterima?" → number input (default = jumlah dari vendor, bisa di-edit)
  - "Kondisi makanan:" → dua tombol besar: **✓ Baik** | **⚠️ Ada Masalah**
- CTA: "Konfirmasi Penerimaan"

**Jika "Ada Masalah" dipilih → Screen 2: Detail Masalah**

**Screen 2: Detail Masalah**
- "Apa masalahnya?" (multi-select)
  - Jumlah kurang dari yang tertera
  - Makanan tidak layak (basi/berbau)
  - Kemasan rusak / bocor
  - Datang terlambat
- Opsional: catatan singkat (max 100 karakter)
- CTA: "Kirim Laporan"

**→ Submit → Screen 3: Terima Kasih**

**Screen 3: Konfirmasi Terkirim**
- "Terima kasih! Konfirmasi sudah dikirim."
- Timestamp
- Halaman menjadi static — tidak ada interaksi lebih lanjut

**Error states:**
- QR sudah pernah di-scan: "QR ini sudah dikonfirmasi sebelumnya. Tidak perlu konfirmasi lagi."
- QR expired (>4 jam / hari berbeda): "Link sudah tidak berlaku. Hubungi vendor jika ada pertanyaan."
- Network error saat submit: retry button, data tidak hilang

#### 5.5 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `ConfirmationForm` | Minimal, single-scroll, form elements large touch-friendly |
| `PortionInput` | Number input dengan default value dari vendor, ± buttons |
| `ConditionSelector` | Dua tombol besar, full-width, clear visual difference |
| `ProblemMultiSelect` | Checkbox cards, tidak scroll, max 4 options |
| `ThankYouScreen` | Static, no further CTAs, prevents double-submit |

#### 5.5 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | QR_token (URL param) + jumlah_diterima + kondisi + masalah[] (opsional) |
| **Token validation** | Same-day · single-use · linked to specific CP3 event |
| **Output** | `school_confirmation` event |
| **Side effect: "Baik"** | CP4 sekolah-side complete → jika kurir done: CP4 = DONE |
| **Side effect: "Ada Masalah"** | -10 poin + create BGN alert flag + vendor notified |
| **Anti-double-submit** | Token marked used after first confirm — subsequent requests return 409 |

---

### 5.6 Scoring Real-Time

**Deskripsi:** Skor tidak muncul di akhir hari — berubah setiap kali ada event, dengan breakdown yang jelas.

**Requirements:**
- Skor dimulai dari 100 setiap hari
- Penalti diterapkan real-time saat event terjadi, tidak batch di akhir hari
- Setiap penalti disertai: berapa poin dikurangi, alasan, referensi juknis
- Estimasi dana yang akan cair diupdate setiap kali skor berubah
- Owner mendapat push notification saat skor turun signifikan (> 10 poin dalam satu event)

**Tabel penalti:**

| Pelanggaran | Penalti |
|-------------|---------|
| Checkpoint terlambat < 15 menit | -2 |
| Checkpoint terlambat 15–60 menit | -5 |
| Golden Rule 4 Jam terlampaui | -20 |
| Porsi kurang (per porsi) | -2 |
| Foto gagal AI validation (retry > 3x) | -5 |
| CP4 tidak terkonfirmasi sekolah | -10 |
| Tidak ada checkpoint sama sekali | -50 |

**Acceptance criteria:**
- [ ] Skor ter-update dalam < 5 detik setelah event
- [ ] Penalti tidak bisa dimanipulasi retroaktif
- [ ] Riwayat penalti tersimpan per hari dan dapat diaudit
- [ ] Score log adalah append-only — tidak ada update atau delete

#### 5.6 — Integration Contract (Scoring Engine)

| Aspek | Detail |
|-------|--------|
| **Day init** | Cron 00:01 setiap hari: buat `daily_score_record` {vendor_id, date, score: 100, events: []} |
| **Penalty trigger** | Event masuk → scoring engine calculates delta → append ke events log → broadcast |
| **Broadcast** | WebSocket push ke: owner Mission Control (5.1) + BGN Command Center (6.1) |
| **Push notification** | Jika single event delta > 10 → push ke owner |
| **Immutability** | Score events: append-only, no UPDATE/DELETE allowed on `score_events` table |
| **Disbursement calc** | `estimated_amount = target_porsi × base_rate × (score / 100)` — recalculated each event |
| **Force-close cron** | 14:00: close any open checkpoints, apply -50 if zero checkpoints today |
| **Daily final** | After all CP4 done (or force-close): write final score to `daily_score_record` + trigger 5.7 |

---

### 5.7 Daily Debrief + Fund Disbursement

**Deskripsi:** Setelah CP4 terakhir selesai, vendor mendapat debrief harian — bukan hanya angka, tetapi narasi: apa yang berjalan baik, apa yang harus diperbaiki, dan apa yang harus disiapkan besok.

**Requirements:**
- Skor final dengan breakdown lengkap
- Narasi otomatis: "yang berjalan baik" vs "yang perlu diperbaiki"
- RAG menganalisis penalti dan memberikan rekomendasi spesifik untuk besok
- Estimasi dana yang akan cair + tanggal pencairan
- Anchor blockchain hari ini ditampilkan dengan link ke explorer
- Preview besok: menu + jumlah porsi + prompt ke marketplace jika bahan perlu dipesan

**Acceptance criteria:**
- [ ] Debrief otomatis ter-generate dalam < 30 detik setelah CP4 terakhir
- [ ] Rekomendasi dari RAG spesifik ke penalti yang terjadi hari ini, bukan generic
- [ ] Blockchain hash visible dan clickable ke public explorer

#### 5.7 — Wireframe Flow

**Screen 1: Score Summary**
- Angka besar: skor final hari ini (animasi count-up)
- Comparison: vs kemarin (↑/↓ X poin) + vs rata-rata 7 hari
- Streak update dengan animasi (naik angka)
- CTA: "Lihat Detail" → expand ke Screen 2

**Screen 2: Breakdown Penalti**
- Accordion: setiap event hari ini dengan timestamp + delta poin
- Events positif (tidak ada penalti) juga ditampilkan: "CP1 tepat waktu: ±0"
- Total di bottom: "Skor akhir: 87 (mulai dari 100, penalti total: -13)"

**Screen 3: AI Narrative**
- **Section hijau — Yang Berjalan Baik:**
  - "CP1 dan CP2 selesai tepat waktu (3 hari berturut-turut!)"
  - "Semua foto lolos AI validation dalam percobaan pertama"
- **Section kuning — Yang Perlu Diperbaiki:**
  - Per item penalti: rekomendasi spesifik
  - "CP3 terlambat 18 menit — coba selesaikan proses masak lebih awal agar ada buffer untuk pengemasan"

**Screen 4: Besok**
- Preview menu besok + jumlah porsi
- Bahan yang perlu dipesan: list + link ke marketplace supplier
- Reminder: "CP1 besok dimulai pukul 07:00 — pastikan bahan sudah tiba sebelumnya"

**Screen 5: Dana & Blockchain**
- Estimasi dana hari ini: Rp X (basis: skor × porsi × rate)
- Status: "Akan diproses pada [tanggal]"
- Blockchain anchor: hash (disingkat) + "Lihat di Explorer →" (external link)
- Note: "Data hari ini sudah tercatat permanen di blockchain dan tidak bisa diubah"

#### 5.7 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `ScoreFinalCard` | Animated count-up, trend indicator, streak badge |
| `PenaltyAccordion` | Event list, timestamp, delta badge (merah/hijau), collapsible detail |
| `AIInsightPanel` | Two sections color-coded, RAG-generated content, max 3 recommendations |
| `TomorrowPreview` | Menu card + bahan order shortcut ke marketplace |
| `FundEstimateCard` | Formatted Rp + scheduled date + confidence indicator |
| `BlockchainAnchorCard` | Hash (first 8 + last 4 chars) + full explorer URL + copy button |

#### 5.7 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Trigger** | All CP4 done OR force-close cron at 14:00 |
| **Input** | day's checkpoint_events + score_log + fund_base_rate + menu_tomorrow |
| **AI generation** | RAG called with: today's penalty events → generate narrative + recommendations |
| **Output** | `debrief_record` {score_final, breakdown, narrative, fund_estimate, blockchain_hash} |
| **Blockchain** | Final score record submitted to chain: hash(vendor_id + date + score_final + breakdown_hash) |
| **Fund** | `disbursement_pending` record created → processed by payment system |
| **Timeline** | Debrief generation < 30 detik · blockchain write < 30 detik (async) |

---

### 5.8 RAG Assistant — Lapisan Konteks

**Deskripsi:** RAG bukan halaman terpisah — ini sistem yang mengalir di seluruh platform dalam tiga mode.

**Mode 1 — Proaktif:** Platform mendorong informasi relevan tanpa diminta, berdasarkan konteks layar saat ini.

**Mode 2 — Reaktif:** Tombol tanya kontekstual ("Kenapa ini?", "Cara perbaiki?") di setiap layar yang relevan.

**Mode 3 — Deep Dive:** Bottom sheet/side panel yang bisa dibuka dari mana saja untuk pertanyaan kompleks.

**Requirements:**
- Source data: seluruh juknis BGN, peraturan sanitasi, standar gizi PMK, SOP operasional
- Setiap respons menyertakan referensi pasal/dokumen sumber
- Di PWA staf dapur: respons disajikan sebagai visual comparison (foto contoh valid vs tidak valid), bukan teks panjang
- Respons dalam Bahasa Indonesia, plain language, tidak menggunakan jargon hukum

**Acceptance criteria:**
- [ ] RAG dapat menjawab 90%+ pertanyaan operasional vendor tanpa eskalasi ke manusia
- [ ] Setiap respons menyertakan sumber yang dapat diverifikasi
- [ ] Respons muncul dalam < 3 detik

#### 5.8 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Vector store** | pgvector (PostgreSQL extension) — dokumen juknis BGN ter-embed |
| **Model** | GPT-4o-mini atau equivalent (low-latency required) |
| **Context injection** | Setiap RAG call menyertakan: current_screen + current_feature + vendor_profile |
| **Proaktif trigger** | Frontend: saat card dibuka atau upload gagal → call RAG API dengan context |
| **Reaktif** | User tanya → standard chat completion dengan retrieved context |
| **PWA visual mode** | Respons format: `{text: string, image_example_valid?: url, image_example_invalid?: url}` |
| **Citation format** | Setiap respons: `{answer: string, sources: [{doc_name, pasal, url}]}` |
| **Latency target** | < 3 detik untuk 90th percentile |

---

## 6. Fitur — Dunia 3: Pengawasan

### 6.1 BGN Command Center

**Deskripsi:** Dashboard management-by-exception — hanya menampilkan yang butuh perhatian, bukan semua data.

**Requirements:**
- Overview wilayah: jumlah SPPG aktif, belum mulai, dan kritis
- Feed "Butuh Perhatian Sekarang" dengan prioritas: 🔴 Kritis / 🟡 Perlu Tindakan
- Setiap item di feed langsung disertai aksi yang bisa diambil
- Filter per zona, kecamatan, atau kategori masalah
- Rata-rata skor wilayah + persentase CP4 tepat waktu

**Acceptance criteria:**
- [ ] BGN dapat mengidentifikasi SPPG yang bermasalah dalam < 30 detik tanpa mencari
- [ ] Setiap alert menyertakan context yang cukup untuk mengambil keputusan tanpa klik lebih dalam
- [ ] Filter zone/kecamatan bekerja tanpa page reload

#### 6.1 — Wireframe Flow

**Screen 1: Command Center Overview**

Layout atas (stats bar, non-scrollable):
- 4 kartu statistik: **SPPG Aktif** | **Belum Mulai Hari Ini** | **Skor Kritis (<60)** | **Alert Menunggu Tindakan**

Layout utama: Alert Feed (dua kolom — desktop, satu kolom — mobile):

Kolom kiri: **🔴 KRITIS — Perlu Tindakan Segera**
- AlertCard per item: nama SPPG + masalah singkat + skor saat ini + tombol aksi cepat

Kolom kanan: **🟡 PERLU TINDAKAN — Follow-up**
- AlertCard per item: sama, prioritas lebih rendah

Filter bar (sticky):
- Dropdown: Semua Zona | Zona A | Zona B | ...
- Dropdown: Semua Masalah | Fraud Flag | Skor Rendah | CP Tidak Selesai | Supply Chain
- Toggle: "Tampilkan Map" → switch ke geographic view

**→ Tap AlertCard → Screen 2: SPPG Detail Sheet**

**Screen 2: SPPG Detail (slide-over panel)**
- Header: nama SPPG + status chip (AKTIF/SUSPENDED/REVOKED)
- Skor hari ini (besar) + skor rata-rata 30 hari
- Checkpoint matrix hari ini (same as Mission Control)
- 30-day score trend chart (sparkline)
- Active flags/alerts: chronological list
- Intervention history: tanggal + jenis intervensi + actor
- Action toolbar (sticky bottom): **Hubungi** | **Kirim Peringatan** | **Inspeksi Mendadak** | **Suspend** | **Cabut Izin**

**Map View (toggle):**
- Vendor pins color-coded: hijau (skor > 85) / kuning (60–85) / merah (< 60)
- Cluster untuk area padat
- Tap pin → SPPG Detail Sheet

#### 6.1 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `StatBar` | 4 cards, animated update, color-coded thresholds |
| `AlertFeed` | Two-column, priority-sorted, infinite scroll, filterable |
| `AlertCard` | Priority icon + nama SPPG + problem summary + skor badge + quick action button |
| `SPPGDetailSheet` | Slide-over 60% width (desktop) / bottom sheet (mobile) |
| `ScoreTrendSparkline` | 30-day mini chart, hover shows date + score |
| `InterventionLog` | Chronological, immutable appearance, actor + action + timestamp |
| `ActionToolbar` | Sticky bottom, button visibility based on vendor current status + BGN permission |
| `RegionalMap` | Mapbox/Leaflet, clustered pins, color by skor range |

#### 6.1 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Input** | Real-time score events · fraud flags (6.2) · checkpoint events |
| **Real-time** | WebSocket untuk critical alerts · 5-menit polling untuk overview stats |
| **Alert creation** | Automated by scoring engine + fraud detection · manual by BGN not needed |
| **Alert priority** | KRITIS: skor < 60 / fraud confidence > 70% / CP = 0 hari ini · PERLU TINDAKAN: skor 60–75 / fraud 40–70% |
| **Output** | Intervention actions (diprosess di 6.3) |
| **Dependencies** | Dunia 2 scoring events · 6.2 risk intelligence feed |

---

### 6.2 AI Risk Intelligence

**Deskripsi:** Tiga model prediktif yang mendeteksi masalah sebelum terjadi.

#### Vendor Risk Score

**Requirements:**
- Skor kesehatan jangka panjang berdasarkan tren, bukan hanya hari ini
- Faktor: tren skor mingguan, konsistensi checkpoint per hari dalam seminggu, turnover staf, tren keluhan sekolah
- Output: probabilitas suspend dalam 30 hari

**Integration Contract — Vendor Risk Score:**

| Aspek | Detail |
|-------|--------|
| **Batch frequency** | Setiap 24 jam (cron 02:00) |
| **Input features** | 7-day score trend · checkpoint completion rate · staff_turnover_events · school_complaint_rate_7d |
| **Model** | Logistic regression / gradient boost (dapat dimulai dengan rules-based untuk MVP) |
| **Output** | `vendor_risk_assessment` {risk_score: 0-100, probability_suspend_30d: float, primary_factors: []} |
| **Alert threshold** | risk_score > 70 → create BGN alert (priority: PERLU TINDAKAN) |
| **BGN visibility** | Ditampilkan di SPPG Detail Sheet sebagai "Indikator Kesehatan Jangka Panjang" |

#### Fraud Pattern Detection

**Requirements:**
- Deteksi anomali berbasis metadata foto (interval waktu antar foto, konsistensi GPS, perbandingan porsi dilaporkan vs dikonfirmasi sekolah)
- Confidence score per anomali
- Threshold yang bisa dikonfigurasi per wilayah

**Integration Contract — Fraud Detection:**

| Aspek | Detail |
|-------|--------|
| **Trigger** | Real-time: setiap CP submission |
| **Anomaly signals** | Burst photos: interval antar foto < 10 detik → "foto diduga diambil sekaligus" |
| | GPS inconsistency: CP2 GPS ≠ CP1 GPS (jarak > 500m) → "inkonsistensi lokasi" |
| | Porsi inflation: vendor claim > sekolah confirmed by > 10% → "klaim berlebihan" |
| **Output** | `fraud_flag` {signal_type, confidence: 0-1, checkpoint_event_id, vendor_id} |
| **Low confidence** | confidence < 0.5 → masuk review queue BGN (tidak auto-alert) |
| **High confidence** | confidence >= 0.7 → create BGN alert KRITIS |
| **False positive target** | < 15% false positive rate |

#### Supply Chain Early Warning

**Requirements:**
- Deteksi risiko pasokan dari data order dan konfirmasi supplier
- Alert ke BGN jika ada potensi shortage yang berdampak ke banyak SPPG
- Tool broadcast notifikasi ke vendor terdampak

**Integration Contract — Supply Chain Warning:**

| Aspek | Detail |
|-------|--------|
| **Batch frequency** | Setiap hari (cron 06:00) |
| **Input** | PO data semua vendor di wilayah · supplier current_stock levels · market data (opsional) |
| **Detection rule** | Jika > 20% vendor satu wilayah order bahan X ke supplier Y yang stock < 3 hari → warning |
| **Output** | `supply_chain_alert` {ingredient, affected_vendors: [], supplier, estimated_shortage_date} |
| **Alert timeline** | Minimum 3 hari sebelum estimasi shortage |
| **BGN action** | Tombol di Command Center: "Broadcast peringatan ke vendor terdampak" |

**Acceptance criteria:**
- [ ] Fraud detection memiliki false positive rate < 15%
- [ ] Risk score diupdate setiap 24 jam
- [ ] Supply chain warning muncul minimal 3 hari sebelum potensi shortage

---

### 6.3 Intervention Tools

**Deskripsi:** BGN dapat bertindak langsung dari platform, bukan hanya melihat.

**Requirements:**
- Aksi tersedia: hubungi langsung, kirim peringatan formal, jadwalkan inspeksi mendadak, assign program pembinaan, suspend sementara, cabut izin
- Suspend dan cabut izin memerlukan approval dua level
- Setiap aksi dicatat otomatis: timestamp, actor, alasan, dokumen pendukung
- Peringatan formal menggunakan template terstandar + tanda tangan digital
- Vendor menerima notifikasi real-time untuk setiap aksi yang diambil terhadap mereka

**Acceptance criteria:**
- [ ] Seluruh aksi intervensi terdokumentasi dan tidak bisa dihapus
- [ ] Vendor dapat merespons peringatan formal langsung dari platform
- [ ] Suspend dan cabut izin tidak bisa dilakukan tanpa approval kedua level

#### 6.3 — Wireframe Flow per Aksi

**Aksi: Kirim Peringatan Formal**

Screen 1: Form Peringatan
- Template selector: [CP Terlambat] | [Porsi Kurang] | [Sanitasi] | [Fraud Suspected] | [Custom]
- Auto-fill: nama vendor + tanggal + detail pelanggaran dari alert
- Editable notes field
- Preview rendered peringatan (tampilan seperti surat resmi)
- Tanda tangan digital: "Ditandatangani oleh: [nama BGN] · [tanggal]"
- CTA: "Kirim Peringatan" (tidak perlu approval kedua)

→ Vendor menerima push notification + email dengan peringatan
→ Vendor dapat respons langsung dari platform (opsional)

**Aksi: Suspend Sementara (requires 2-level approval)**

Screen 1: Suspend Form
- Alasan: dropdown (Skor Kritis Berulang / Fraud Terdeteksi / Insiden Serius / Custom) + teks tambahan
- Upload bukti pendukung (foto, dokumen)
- Preview dampak: "Tindakan ini akan memblokir Daily Mode vendor dan membekukan operasi"
- CTA: "Ajukan Suspend" → **bukan langsung execute**

Screen 2: Approval Chain
- "Menunggu persetujuan Level 2: [nama supervisor BGN]"
- Status: PENDING APPROVAL
- Supervisor menerima notifikasi → approve/reject dengan alasan

Screen 3: Executed
- Setelah kedua level setuju: vendor_status = SUSPENDED
- Vendor notified: "Operasi Anda ditangguhkan sementara mulai [tanggal]. Alasan: [alasan]. Hubungi BGN untuk informasi lebih lanjut."

**Aksi: Jadwalkan Inspeksi Mendadak**

Screen 1: Inspeksi Mendadak Form
- Date picker: hari ini s/d 3 hari ke depan
- Auto-assign: inspector nearest to vendor location + available
- Note untuk inspector: context flags yang memicu inspeksi
- CTA: "Jadwalkan"

→ Inspector notified · Vendor notified (tidak bisa cancel)

**Error states:**
- Supervisor Level 2 tidak merespons dalam 24 jam: auto-escalate ke Level 3 (kepala BGN wilayah)
- Vendor sudah SUSPENDED saat aksi diambil: tampilkan pesan "Vendor sudah dalam status suspended"

#### 6.3 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `InterventionModal` | Full-screen modal, form per action type, confirm step sebelum submit |
| `ApprovalChainTracker` | Step tracker: Level 1 done · Level 2 pending · Executed, dengan name dan timestamp |
| `WarningLetterPreview` | Rendered letter format, nama + tanggal + konten + signature |
| `ImpactWarning` | Red alert box menjelaskan dampak aksi sebelum execute |

#### 6.3 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Audit log** | Setiap aksi: append-only `intervention_log` (no DELETE, no UPDATE) |
| **Suspend flow** | BGN L1 submit → L2 notified → L2 approve → vendor_status = SUSPENDED → vendor notified |
| **Revoke flow** | Sama dengan suspend, tapi: license invalidated + public profile updated + blockchain hash written |
| **Formal warning** | No approval needed · instant delivery · vendor can reply via platform |
| **Mandatory fields** | Semua aksi: alasan (tidak bisa kosong) + actor_id + timestamp (auto) |
| **Vendor notification** | Real-time push + email untuk setiap aksi terhadap mereka |

---

### 6.4 Public Transparency Dashboard

**Deskripsi:** Halaman publik tanpa login yang menampilkan data agregat dan memungkinkan verifikasi individual SPPG via blockchain.

**URL:** `[domain]/publik`

**Requirements:**
- Data agregat nasional / per kota: jumlah SPPG aktif, porsi hari ini, rata-rata skor, insiden aktif
- Search SPPG by nama atau kota
- Per SPPG: status aktif, validitas izin, rata-rata skor 30 hari, total porsi bulan ini, persentase checkpoint tepat waktu
- Audit trail: 10 hash blockchain terbaru dengan link ke blockchain explorer publik
- Data diperbarui real-time

**Acceptance criteria:**
- [ ] Halaman dapat diakses tanpa login dan tanpa download apapun
- [ ] Hash blockchain dapat diverifikasi di explorer publik secara independen
- [ ] Halaman load dalam < 3 detik (no auth overhead)
- [ ] Data personal vendor tidak ditampilkan (hanya data agregat operasional)

#### 6.4 — Wireframe Flow

**Screen 1: Public Overview**

Stats nasional (above fold):
- SPPG Aktif: [X] | Porsi Hari Ini: [X] | Rata-rata Skor Nasional: [X] | Insiden Aktif: [X]

Map (interactive):
- Geographic distribution SPPGs by kota
- Click kota → filter list to kota tersebut

Search bar:
- "Cari SPPG berdasarkan nama atau kota"
- Instant search dengan debounce

SPPG List (default: semua, paginated):
- PublicSPPGCard: nama + kota + status chip + skor 30 hari (badge)

**→ Tap SPPG → Screen 2: Public SPPG Profile**

**Screen 2: SPPG Public Profile**
- Nama SPPG + kota + status: **AKTIF** / **DITANGGUHKAN** / **DICABUT**
- Nomor izin + masa berlaku
- Statistik 30 hari:
  - Rata-rata skor: [X]/100
  - Total porsi bulan ini: [X] porsi
  - % checkpoint tepat waktu: [X]%
- Audit Trail section:
  - Judul: "Rekam Jejak Blockchain (10 Terakhir)"
  - Per row: event type + tanggal + hash (disingkat) + [Verifikasi ↗] link ke explorer
- Note: "Data ini dapat diverifikasi secara independen oleh siapapun"

**Screen 3: Verifikasi Guide (tooltip/modal)**
- Cara verifikasi manual: "1. Copy hash di atas · 2. Buka explorer · 3. Paste hash · 4. Bandingkan dengan data asli dari API kami"
- Link ke API endpoint untuk data asli

#### 6.4 — Component Notes

| Komponen | Deskripsi |
|----------|-----------|
| `PublicStatBar` | 4 stats, no auth, cached 1 menit |
| `PublicSearchBar` | Instant search, debounced 300ms, no login required |
| `PublicSPPGCard` | Nama + kota + status + skor badge, no sensitive info |
| `BlockchainHashList` | Hash (shortened 8+4) + event type + date + explorer link |
| `VerificationGuide` | Expandable, step-by-step untuk non-technical user |

#### 6.4 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Auth** | No auth required — public endpoints |
| **Rate limiting** | 100 req/min per IP |
| **Caching** | Stats: cache 60 detik · SPPG list: cache 5 menit · Individual profile: cache 30 detik |
| **Data exposure** | No PII: tidak ada nama staf, nomor HP, detail finansial |
| **Blockchain data** | Platform menyimpan hash → display di UI + link ke public explorer |
| **Verification** | Public API endpoint: `GET /public/verify/{hash}` returns original event data |

---

### 6.5 Blockchain Audit Trail

**Deskripsi:** Setiap event kritis mendapat hash yang ditulis ke blockchain — sebagai fingerprint yang tidak bisa dimanipulasi.

**Yang di-chain (anchor points):**

| Event | Konten Hash |
|-------|------------|
| Setiap checkpoint selesai | Timestamp + GPS + foto hash + skor partial |
| Skor harian final | Total skor + breakdown penalti |
| Fund disbursement | Jumlah + vendor ID + tanggal + skor dasar |
| Konfirmasi sekolah | QR token + jumlah diterima + timestamp |
| Approval/Suspend/Cabut izin BGN | Keputusan + actor + alasan |

**Requirements:**
- Data asli tetap di database — blockchain hanya menyimpan hash (fingerprint)
- Proses hashing dan penulisan ke chain berjalan di background, tidak memblokir UX
- Jika penulisan ke chain gagal: retry otomatis, bukan data hilang
- Siapapun dapat mengambil data dari database, hash ulang, dan memverifikasi kecocokan dengan yang di blockchain

**Acceptance criteria:**
- [ ] Hash tercatat di blockchain dalam < 30 detik setelah event
- [ ] Verifikasi independen oleh pihak ketiga berhasil untuk 100% event yang di-chain
- [ ] Penulisan ke chain tidak pernah memblokir UX (async sepenuhnya)

#### 6.5 — Integration Contract

| Aspek | Detail |
|-------|--------|
| **Queue** | Events masuk DB dulu → queue table → worker picks up (tidak pernah hilang) |
| **Worker** | Background job, runs setiap 30 detik, batch jika multiple pending |
| **Chain target** | EVM-compatible: Polygon testnet (demo) → mainnet/private chain (prod) |
| **Smart contract** | `NutrioAuditLog.sol`: `function logEvent(bytes32 dataHash, string eventType, string vendorId) external` |
| **Hash construction** | JSON.stringify(event_data, sorted_keys) → SHA-256 → bytes32 |
| **DB record** | `blockchain_record` {event_id, event_type, data_hash, tx_hash, chain_status, created_at} |
| **Retry policy** | Fail → retry 5x dengan exponential backoff (1s, 2s, 4s, 8s, 16s) |
| **Verification endpoint** | `GET /public/verify/{data_hash}` → returns original event data |
| **Latency target** | Hash tercatat di chain < 30 detik setelah event |

---

## 7. Metrics Keberhasilan

### Untuk Calon Vendor
| Metric | Target |
|--------|--------|
| Waktu eligibility check sampai output | < 3 menit |
| Tingkat penyelesaian onboarding wizard | > 80% |
| Waktu persiapan dokumen rata-rata | Berkurang 40% vs proses manual |

### Untuk Vendor Aktif
| Metric | Target |
|--------|--------|
| Tingkat checkpoint selesai tepat waktu | > 90% dalam 30 hari pertama |
| Waktu penyelesaian satu checkpoint | < 3 menit |
| Skor rata-rata vendor setelah 30 hari aktif | > 80/100 |

### Untuk BGN
| Metric | Target |
|--------|--------|
| Waktu identifikasi SPPG bermasalah | < 30 detik |
| Tingkat akurasi fraud detection | Precision > 85% |
| Cakupan vendor yang terpantau tanpa tambahan staf | 100% vendor aktif |

### Untuk Platform
| Metric | Target |
|--------|--------|
| Blockchain hash coverage | 100% event kritis |
| RAG answer relevance | > 90% pertanyaan terjawab tanpa eskalasi |
| Uptime | > 99.5% |
| WebSocket score latency | < 5 detik end-to-end |
| RAG response time | < 3 detik p90 |

---

## 8. Di Luar Scope (v1)

- Real-time chat antara vendor dan supplier
- GPS logistics tracking real-time
- Laporan analitik lanjutan berbasis AI (butuh data historis dulu)
- Integrasi langsung dengan sistem penggajian
- Multi-bahasa (selain Bahasa Indonesia)
- Modul keuangan vendor (accounting, pembukuan)

---

## 9. Asumsi & Pertanyaan Terbuka

| # | Asumsi / Pertanyaan | Perlu Dikonfirmasi |
|---|--------------------|--------------------|
| 1 | Kurir pihak ketiga bersedia membuka link dan menyelesaikan flow sederhana | Perlu validasi dengan kurir aktual |
| 2 | Pihak sekolah memiliki akses HP dengan kamera untuk scan QR | Perlu konfirmasi dari BGN |
| 3 | BGN bersedia menggunakan platform yang sama untuk form inspeksi | Perlu alignment dengan proses internal BGN |
| 4 | Jaringan internet di lokasi dapur dan sekolah cukup untuk upload foto | Perlu solusi offline-first yang lebih matang untuk v2 |
| 5 | Blockchain yang digunakan: publik (testnet untuk demo, mainnet untuk produksi) atau private chain? | Keputusan teknis yang belum final |
| 6 | Apa yang terjadi jika vendor tidak menyelesaikan seluruh checkpoint dalam satu hari? | Didefinisikan di v2: skor 0 untuk hari itu via force-close cron 14:00; jika zero checkpoint: -50 |
| 7 | Tabel penalti di Section 5.6 bersifat contoh — angka final harus dikonfirmasi dengan Juknis BGN | Perlu validasi dengan BGN sebelum implementasi |
| 8 | 2-level approval untuk suspend/revoke: siapa Level 1 dan Level 2 di struktur BGN? | Perlu mapping ke struktur jabatan BGN aktual |
| 9 | Base rate disbursement per porsi: berapa nilai Rp yang dikonfigurasi BGN? | Input dari BGN — platform harus configurable per wilayah |
