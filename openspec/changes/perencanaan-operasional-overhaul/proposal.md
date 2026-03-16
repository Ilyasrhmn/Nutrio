## Why

Modul Perencanaan saat ini masih bersifat pasif (menerima order dari BGN) dan tidak mencerminkan alur operasional di lapangan di mana SPPG seharusnya menjadi perencana aktif. Perubahan ini diperlukan untuk memberdayakan SPPG dalam merencanakan menu berdasarkan kebutuhan nutrisi dan jumlah porsi per zona secara mandiri dan akurat.

## What Changes

- **Planning Hub Overhaul**: Mengubah tampilan daftar jadwal menjadi kalender strip mingguan yang interaktif untuk manajemen perencanaan harian.
- **Menu Planner with Nutri-Calc**: Fitur baru untuk menyusun menu dengan kalkulasi nutrisi (Kcal, Protein) secara real-time berdasarkan bahan baku yang diinput.
- **Automated Ingredient Scaling**: Sistem yang secara otomatis menghitung total kebutuhan bahan baku berdasarkan target porsi per zona yang telah ditentukan.
- **Theme & UI Modernization**: Pembaruan tema visual menggunakan warna Indigo (#4F46E5) untuk navigasi dan Emerald (#10B981) untuk indikator keberhasilan/nutrisi, dengan desain card yang lebih bersih.

## Capabilities

### New Capabilities
- `planning-hub`: Pusat kendali perencanaan mingguan dan harian untuk SPPG.
- `menu-planner`: Fitur penyusunan menu mandiri dengan kalkulator nutrisi real-time.
- `ingredient-scaling`: Kalkulasi otomatis kebutuhan logistik bahan baku berdasarkan volume porsi.

### Modified Capabilities
- `rbac-implementation`: Penyesuaian hak akses (ability) untuk memastikan SPPG memiliki wewenang penuh dalam modul perencanaan baru ini.

## Impact

- **Frontend**: Perubahan signifikan pada direktori `apps/web/app/portal/operasional` dan `apps/web/app/portal/menu`.
- **UI System**: Penggunaan token warna Indigo dan Emerald yang konsisten sesuai `packages/ui/src/styles/globals.css`.
- **User Experience**: Alur kerja SPPG menjadi lebih proaktif dan terukur.
