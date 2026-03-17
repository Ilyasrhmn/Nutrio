# Menu Planner Spec

## Capability Overview
Antarmuka penyusunan menu mandiri bagi SPPG dengan feedback nutrisi langsung.

## User Stories
- Sebagai SPPG, saya ingin memilih menu atau membuat menu baru agar saya bisa menyajikan makanan yang bervariasi.
- Sebagai SPPG, saya ingin melihat hitungan nutrisi (Kcal, Protein) secara real-time saat saya menginput bahan baku agar menu saya memenuhi standar BGN.

## Requirements
- **Menu Input Form**: Nama menu dan deskripsi singkat.
- **Ingredient List**: Tambah bahan baku (e.g., Ayam, Beras, Wortel) dengan input gram per porsi.
- **Real-time Nutri-Calc**: Visualisasi progress bar untuk Kalori dan Protein dibandingkan dengan target zona.
- **Save Draft**: Menyimpan konfigurasi menu sementara di local state.

## Technical Constraints
- Rumus kalkulasi sederhana: (Berat Bahan * Standar Nutrisi Bahan / 100).
- Animasi bar nutrisi menggunakan Tailwind transitions.
