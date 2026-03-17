## Why
Vendor membutuhkan cara yang terstruktur untuk melaporkan kendala operasional (lapangan) dan teknis (aplikasi) dalam satu hub terpadu. Sidebar Monitoring perlu dioptimalkan menjadi 5 sub-menu untuk memisahkan fungsi pelaporan aktif (Insiden) dengan referensi statis (SOP) demi kenyamanan navigasi standar internasional.

## What Changes
- **Sidebar Expansion**: Memperluas sub-menu Monitoring menjadi 5 item terorganisir.
- **Integrated Incident Hub**: Mengembangkan halaman `/portal/incidents` dengan sistem Tab (Operasional vs Teknis).
- **Self-Diagnostic Feature**: Implementasi modul cek kesehatan perangkat otomatis (GPS, Kamera, Koneksi).
- **Technical Bug Reporting**: Form laporan bug aplikasi dengan integrasi status sensor perangkat.

## Capabilities

### New Capabilities
- `technical-incident-reporting`: Kemampuan melaporkan masalah aplikasi dengan verifikasi diagnostik otomatis.
- `refined-monitoring-navigation`: Struktur navigasi 5-item dengan indikator status cerdas.

### Modified Capabilities
- `monitoring-sidebar`: Update persyaratan navigasi untuk menyertakan 5 sub-menu terpisah.
- `fraud-proof-incidents`: Perluasan validasi mencakup data sensor teknis perangkat.

## Impact
- `apps/web/app/portal/layout.tsx`: Update susunan sub-menu sidebar.
- `apps/web/app/portal/incidents/page.tsx`: Perombakan total dengan Tab Teknis & Diagnostik.
- `apps/web/app/portal/sop/page.tsx`: Refaktor konten agar fokus pada dokumentasi statis.
