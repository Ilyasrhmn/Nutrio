## Context

Sistem saat ini memiliki halaman operasional yang bersifat statis dan berorientasi pada "penerimaan tugas" dari pusat. SPPG tidak memiliki alat untuk merencanakan menu mereka sendiri berdasarkan target nutrisi yang dinamis. Visualisasi jadwal saat ini juga masih berupa list sederhana yang kurang intuitif untuk perencanaan mingguan.

## Goals / Non-Goals

**Goals:**
- Mengimplementasikan UI **Planning Hub** dengan kalender strip mingguan.
- Membangun **Menu Planner** yang interaktif dengan kalkulasi nutrisi real-time di sisi client.
- Mengotomatisasi kalkulasi bahan baku (Auto-Scale) berdasarkan target porsi.
- Menstandarisasi tema visual menggunakan Indigo (#4F46E5) dan Emerald (#10B981) sesuai brand guidelines.

**Non-Goals:**
- Implementasi API backend dan skema database (untuk fase ini akan menggunakan mock data/state management lokal).
- Implementasi alur eksekusi checkpoint dan logistik pengiriman.

## Decisions

- **Weekly Strip Calendar**: Menggunakan desain strip mingguan (bukan kalender bulanan penuh) untuk fokus pada operasional harian yang cepat dan responsif.
- **Client-side Nutri-Calc Engine**: Kalkulasi nutrisi dilakukan langsung di frontend menggunakan state React untuk memberikan feedback instan tanpa delay network.
- **Indigo & Emerald Palette**: Indigo digunakan sebagai warna primer untuk navigasi dan aksi (authority), sedangkan Emerald digunakan khusus untuk indikator nutrisi dan status "Target Tercapai" (health & success).
- **Component Reusability**: Menggunakan kembali komponen dari `@workspace/ui` (Button, Card, Input) namun dengan penyesuaian styling yang lebih modern (soft shadows).

## Risks / Trade-offs

- **[Risk] Complex State Management** → Perubahan bahan baku yang masif bisa membuat UI terasa berat. 
  - *Mitigation*: Menggunakan debouncing pada input bahan baku sebelum melakukan kalkulasi ulang nutrisi.
- **[Risk] UI Clutter** → Input Menu + Nutrisi + Bahan Baku dalam satu halaman bisa membingungkan.
  - *Mitigation*: Menggunakan layout dua kolom (Kiri: Input Menu/Bahan, Kanan: Nutrisi Visualizer Sticky).
- **[Trade-off] No Persistence** → Karena fokus di frontend dulu, data perencanaan akan hilang saat refresh.
  - *Mitigation*: Memberikan warning kepada user bahwa ini adalah prototipe frontend dan integrasi database dilakukan di fase berikutnya.
