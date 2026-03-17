## Context
Sistem monitoring saat ini memiliki dua halaman terpisah (`/portal/live` dan `/portal/checkpoints`) yang tidak terhubung secara logis dalam navigasi. Vendor kesulitan memahami korelasi antara keterlambatan real-time dengan pengurangan skor dan potensi pembekuan dana. Diperlukan satu rumpun menu yang menyatukan alur kerja dari persiapan (SOP), eksekusi (Live), hingga evaluasi (Skor & Audit).

## Goals / Non-Goals

**Goals:**
- Menyatukan menu operasional ke dalam satu rumpun "Monitoring & Kepatuhan AI" di sidebar.
- Mengimplementasikan sistem skor harian (100 poin) dengan logika pinalti bertingkat.
- Membuat antarmuka pelaporan insiden yang memvalidasi bukti fisik menggunakan kamera live.
- Menyediakan panduan SOP yang terintegrasi secara kontekstual di dalam UI.

**Non-Goals:**
- Implementasi backend AI Recognition secara penuh (saat ini menggunakan mock/simulasi validasi).
- Perubahan pada sistem Smart Contract di blockchain (hanya simulasi status berdasarkan skor).

## Decisions

### 1. Struktur Navigasi Sidebar (Dropdown)
- **Keputusan**: Menggunakan komponen `Button` dengan state `isMonitoringOpen` untuk membuat grup menu dropdown, serupa dengan "Perencanaan & Operasional".
- **Rasional**: Konsistensi UI/UX di seluruh portal dan menghemat ruang vertikal sidebar.
- **Izin Akses**: Menggunakan CASL (`ability.can('read', 'Monitoring')`) untuk mengontrol visibilitas seluruh grup menu bagi vendor dan admin.

### 2. Logika Scoring & Streak
- **Keputusan**: Skor disimpan dalam state lokal (simulasi) yang direset setiap hari.
- **Pinalti**: 
  - Telat 1-15m: -2 Poin
  - Telat 16-30m: -5 Poin
  - Telat >30m: -10 Poin
  - Pelanggaran Fatal/Fraud: -50 Poin
- **Streak**: Jika skor harian > 95 selama 5 hari berturut-turut, status vendor berubah menjadi "Gold" (Visual Badge).

### 3. Fraud-Proof Incident Interface
- **Keputusan**: Menggunakan MediaDevices API untuk akses kamera langsung tanpa opsi upload galeri.
- **Validasi**: Menambahkan metadata GPS dan Timestamp pada setiap foto laporan insiden.

### 4. Integrated SOP Manual
- **Keputusan**: Menggunakan komponen `Tabs` di halaman `/portal/sop` untuk memisahkan aturan main, panduan foto, dan FAQ.
- **Konteks**: Menambahkan icon informasi (Tooltip) di samping elemen skor untuk penjelasan cepat aturan pinalti.

## Risks / Trade-offs
- **[Risiko]** Vendor merasa terbebani dengan aturan yang ketat. 
  - **Mitigasi**: Memberikan fitur "Early Warning" (Timer Kuning/Merah) sebelum checkpoint berakhir.
- **[Risiko]** Akses kamera gagal pada perangkat tertentu. 
  - **Mitigasi**: Menyediakan fallback instruksi teknis di menu SOP.
- **[Trade-off]** Penggunaan state lokal untuk simulasi skor.
  - **Alasan**: Mempercepat pembuatan prototipe visual sebelum integrasi database penuh.

## Migration Plan
1. Update `apps/web/app/portal/layout.tsx` untuk sidebar baru.
2. Buat halaman baru: `/portal/audit`, `/portal/incidents`, `/portal/sop`.
3. Update halaman `/portal/live` dan `/portal/checkpoints` dengan UI baru.
4. Uji coba alur dari CP1 hingga CP4.
