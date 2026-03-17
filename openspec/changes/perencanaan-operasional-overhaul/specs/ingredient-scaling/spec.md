# Ingredient Scaling Spec

## Capability Overview
Otomatisasi kalkulasi kebutuhan logistik bahan baku berdasarkan total porsi harian.

## User Stories
- Sebagai SPPG, saya ingin sistem menghitung otomatis jumlah kg ayam atau beras yang harus dibeli agar saya tidak salah belanja.

## Requirements
- **Total Portion Sync**: Mengambil data total porsi dari zona yang aktif.
- **Auto-Scale Table**: Menghitung (Gram per porsi * Total porsi) / 1000 = KG kebutuhan.
- **Stock Adjustment**: Input manual untuk "Stok yang sudah ada" (misal: sisa kemarin).
- **Net Purchase Calculation**: Menampilkan jumlah bersih yang harus dibeli.

## Technical Constraints
- Perhitungan dilakukan di level tabel kalkulasi bahan (`/portal/operasional/kalkulasi-bahan`).
