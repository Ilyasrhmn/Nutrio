## 1. Sidebar & Nav Refactor

- [x] 1.1 Update Sidebar Nav di `apps/web/app/portal/layout.tsx` untuk bagian "Perencanaan & Operasional".
- [x] 1.2 Sesuaikan icon dan label agar mencerminkan alur SPPG-centric (Kalender Plan, Menu & Nutrisi, Logistik).

## 2. Planning Hub (Jadwal) - UI Update

- [x] 2.1 Implementasi `WeeklyCalendarStrip` di `/portal/operasional/jadwal` menggunakan warna existing (Indigo/Slate).
- [x] 2.2 Tambahkan "Demand Insight" (Target Porsi & Nutrisi per Zona) di halaman jadwal.

## 3. Menu Planner Interface

- [x] 3.1 Update `/portal/menu` (atau `/portal/operasional/menu` jika dipindah) menjadi Menu Planner.
- [x] 3.2 Implementasi visualisasi nutrisi (Progress Bar Emerald/Amber) sesuai dashboard existing.

## 4. Logistik & Auto-Scale

- [x] 4.1 Update `/portal/operasional/kalkulasi-bahan` dengan logic scaling otomatis dari porsi zona.
- [x] 4.2 Styling tabel kalkulasi agar konsisten dengan tabel di dashboard utama.
