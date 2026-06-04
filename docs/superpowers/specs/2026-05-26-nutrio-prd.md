# PRD — Nutrio: Platform Perizinan & Monitoring Vendor MBG

**Versi:** 1.0  
**Tanggal:** 26 Mei 2026  
**Status:** Draft — Pending Review  

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

---

### 5.3 Checkpoint Flow (CP1–CP4)

**Deskripsi:** Empat checkpoint wajib harian yang harus diselesaikan berurutan, masing-masing dengan validasi AI dan pencatatan blockchain.

#### CP1 — Terima Bahan (07:00–08:00)
- Checklist visual kondisi bahan (gambar, bukan teks)
- Foto seluruh bahan dari PO hari ini
- AI validasi: kesegaran visual, kelengkapan vs PO, kondisi kemasan
- RAG proaktif: standar penyimpanan per jenis bahan

#### CP2 — Proses Masak (08:30–11:00)
- Golden Rule 4 Jam countdown aktif sejak CP1 selesai
- Foto proses memasak aktif
- AI validasi: kompor menyala visible, APD dipakai, kebersihan area
- RAG proaktif: suhu minimum per jenis bahan, standar higiene

#### CP3 — Makanan Siap (11:00–11:30)
- Foto makanan sudah dikemas dengan label sekolah
- Input manual jumlah porsi aktual
- AI validasi: kemasan tertutup, label terbaca, jumlah kontainer sesuai
- Jika porsi kurang: notifikasi langsung ke owner + prompt buat laporan insiden

#### CP4 — Serah Terima (12:00–13:00)
- Dilakukan oleh kurir (bisa pihak ketiga via delivery token)
- GPS aktif otomatis saat tiba di lokasi sekolah
- Foto serah terima
- QR ditampilkan untuk di-scan pihak sekolah
- Selesai hanya setelah kedua sisi (kurir + sekolah) konfirmasi

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

**Requirements:**
- Link di-generate oleh vendor saat CP3 selesai
- Link hanya valid untuk satu pengiriman dan expired setelah CP4 selesai
- Interface kurir: nama sekolah tujuan, jumlah porsi, link maps, tombol GPS aktif, tombol foto, tombol selesai
- Tidak ada data pribadi kurir yang disimpan — hanya event delivery
- Jika kurir tidak menyelesaikan dalam batas waktu: notifikasi otomatis ke owner

**Acceptance criteria:**
- [ ] Kurir dapat menyelesaikan CP4 tanpa install app dan tanpa registrasi
- [ ] Owner mendapat notifikasi real-time jika delivery belum terkonfirmasi 30 menit sebelum deadline

---

### 5.5 Konfirmasi Sekolah (Verifikator Pasif)

**Deskripsi:** Pihak sekolah cukup scan QR dari kurir menggunakan kamera HP biasa — terbuka halaman web sederhana untuk konfirmasi penerimaan.

**Requirements:**
- Tidak memerlukan akun atau instalasi apapun
- Form konfirmasi: jumlah porsi diterima + kondisi (Baik / Ada Masalah)
- Jika "Ada Masalah": satu pertanyaan lanjutan dengan pilihan singkat
- Response sekolah masuk ke skor CP4 vendor secara real-time
- Halaman expired setelah dikonfirmasi (tidak bisa konfirmasi dua kali)

**Acceptance criteria:**
- [ ] Pihak sekolah dapat konfirmasi dalam < 1 menit
- [ ] Konfirmasi duplikat dari QR yang sama ditolak sistem

---

### 5.6 Scoring Real-Time

**Deskripsi:** Skor tidak muncul di akhir hari — berubah setiap kali ada event, dengan breakdown yang jelas.

**Requirements:**
- Skor dimulai dari 100 setiap hari
- Penalti diterapkan real-time saat event terjadi, bukan batch di akhir hari
- Setiap penalti disertai: berapa poin dikurangi, alasan, referensi juknis
- Estimasi dana yang akan cair diupdate setiap kali skor berubah
- Owner mendapat push notification saat skor turun signifikan (> 10 poin dalam satu event)

**Tabel penalti (contoh):**

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

---

### 6.2 AI Risk Intelligence

**Deskripsi:** Tiga model prediktif yang mendeteksi masalah sebelum terjadi.

#### Vendor Risk Score
- Skor kesehatan jangka panjang berdasarkan tren, bukan hanya hari ini
- Faktor: tren skor mingguan, konsistensi checkpoint per hari dalam seminggu, turnover staf, tren keluhan sekolah
- Output: probabilitas suspend dalam 30 hari

#### Fraud Pattern Detection
- Deteksi anomali berbasis metadata foto (interval waktu antar foto, konsistensi GPS, perbandingan porsi dilaporkan vs dikonfirmasi sekolah)
- Confidence score per anomali
- Threshold yang bisa dikonfigurasi per wilayah

#### Supply Chain Early Warning
- Deteksi risiko pasokan dari data order dan konfirmasi supplier
- Alert ke BGN jika ada potensi shortage yang berdampak ke banyak SPPG
- Tool broadcast notifikasi ke vendor terdampak

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
| 6 | Apa yang terjadi jika vendor tidak menyelesaikan seluruh checkpoint dalam satu hari (bukan sekadar terlambat, tapi tidak dilakukan sama sekali)? Apakah hari itu skor 0, atau ada mekanisme force-close di akhir hari? | Perlu didefinisikan untuk menghindari edge case di scoring engine |
| 7 | Tabel penalti di Section 5.6 bersifat contoh — angka final harus dikonfirmasi dengan Juknis BGN yang berlaku | Perlu validasi dengan BGN sebelum implementasi |
