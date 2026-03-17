## Why
Sistem pemantauan saat ini masih terfragmentasi, memisahkan antara eksekusi tugas (live) dengan pelacakan performa (skor), yang mengurangi akuntabilitas vendor. Vendor kekurangan "pusat kendali" real-time yang mampu menegakkan SOP kritis (seperti Golden Rule 4 Jam) secara otomatis dan memberikan umpan balik instan terhadap kesehatan operasional mereka.

## What Changes
- **Restrukturisasi Sidebar**: Konsolidasi menu eksekusi, skor, audit log, dan SOP ke dalam satu menu induk "Monitoring & Kepatuhan AI" dengan sub-menu yang terorganisir.
- **Live Execution Overhaul**: Implementasi kartu tugas yang sadar konteks (context-aware) dengan validasi kamera wajib dan pengenalan citra berbasis AI.
- **Operational Health Scoring**: Memperkenalkan sistem bar kesehatan 100 poin harian yang terhubung langsung dengan pencairan dana Smart Contract (pembekuan jika skor < 75).
- **Gamifikasi (Sistem Streak)**: Memberikan imbalan bagi vendor yang konsisten berkinerja tinggi (misal: streak 5 hari) melalui penambahan poin atau peningkatan status.
- **Fraud-Proof Incident Reporting**: Antarmuka khusus untuk melaporkan kendala darurat (misal: ban bocor) menggunakan pengambilan foto live wajib dan verifikasi AI untuk mencegah alibi palsu.
- **Interactive SOP (Manual Book)**: Mengintegrasikan panduan teknis dan penjelasan aturan langsung ke dalam UI (bantuan kontekstual) alih-alih dokumen terpisah.

## Capabilities

### New Capabilities
- `monitoring-sidebar`: Navigasi terstruktur dengan indikator status visual (Dot warna: Hijau/Kuning/Merah).
- `operational-health-scoring`: Logika dan UI untuk sistem 100 poin, pinalti bertingkat (-2, -5, -10, -50), dan mekanisme streak.
- `live-checkpoint-execution`: Kartu tugas dinamis dengan integrasi Kamera/AI dan countdown "Zona Aman 4 Jam".
- `fraud-proof-incidents`: Sistem pelaporan darurat dengan validasi AI dan sensor (GPS/Timestamp) untuk mencegah penipuan.
- `integrated-sop-manual`: Dokumentasi dalam aplikasi dan penjelasan aturan interaktif dari hulu ke hilir.

### Modified Capabilities
- `rbac-implementation`: Penyesuaian izin akses (CASL) untuk sub-menu baru di rumpun Monitoring.

## Impact
- `apps/web/app/portal/layout.tsx`: Pembaruan navigasi sidebar.
- `apps/web/app/portal/live/page.tsx`: Perombakan total UI/UX eksekusi.
- `apps/web/app/portal/checkpoints/page.tsx`: Evolusi menjadi dashboard Skor Kesehatan.
- Penambahan rute baru: `/portal/audit`, `/portal/incidents`, `/portal/sop`.
