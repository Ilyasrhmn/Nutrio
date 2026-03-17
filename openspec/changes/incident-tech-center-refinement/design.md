## Context
Sistem monitoring perlu dipoles untuk mendukung pelaporan masalah yang lebih spesifik (Operasional vs Teknis). Pemisahan navigasi diperlukan untuk memudahkan vendor mengakses bantuan tanpa teralihkan oleh dokumen SOP yang panjang.

## Goals / Non-Goals

**Goals:**
- Menata ulang sidebar menjadi 5 sub-menu Monitoring.
- Membangun antarmuka "Incident Hub" dengan sistem tab (Operasional vs Teknis).
- Implementasi simulasi diagnostik perangkat (GPS, Kamera, Internet).
- Standarisasi UI komponen menggunakan Shadcn UI (Tabs, Card, Alert).

**Non-Goals:**
- Integrasi riil dengan sensor hardware (menggunakan simulasi/mock API status sensor).
- Pengiriman tiket ke sistem helpdesk eksternal (hanya UI/UX flow).

## Decisions

### 1. Refactor Navigasi Monitoring
- **Pilihan**: Memecah "Pusat Kendali & Panduan SOP" menjadi dua menu terpisah di sidebar.
- **Alasan**: Efisiensi navigasi saat kondisi darurat.

### 2. Dual-Tab Incident Reporting
- **Pilihan**: Menggunakan sistem Tab untuk memisahkan pelaporan lapangan (Operasional) dan pelaporan aplikasi (Teknis).
- **Rasional**: Field data yang dibutuhkan sangat berbeda (Foto AI vs Status Diagnostik).

### 3. Automated Device Diagnostic
- **Pilihan**: Menyediakan tombol "Jalankan Diagnostik" yang memberikan hasil real-time status sensor HP.
- **Rasional**: Akuntabilitas laporan kendala teknis.

## Risks / Trade-offs
- [Risiko] Vendor merasa navigasi terlalu kompleks. → [Mitigasi] Icon yang deskriptif dan hierarki font yang jelas.
- [Risiko] Diagnostik simulasi tidak mencerminkan bug yang sebenarnya. → [Mitigasi] Berikan field deskripsi bebas untuk penjelasan tambahan.
