# Planning Hub Spec

## Capability Overview
Pusat kendali operasional harian dan mingguan bagi SPPG untuk merencanakan dan memonitor tugas memasak per zona MBG.

## User Stories
- Sebagai SPPG, saya ingin melihat kalender strip mingguan agar saya bisa merencanakan menu untuk beberapa hari ke depan dengan cepat.
- Sebagai SPPG, saya ingin melihat target porsi dan nutrisi per zona pada hari yang dipilih agar perencanaan menu saya akurat.

## Requirements
- **Weekly Calendar Strip**: Menampilkan tanggal 7 hari ke depan dengan status perencanaan (Planned, Draft, Empty).
- **Demand Context**: Menampilkan data agregat porsi dan nutrisi yang harus dipenuhi untuk zona tersebut.
- **Navigation**: Klik pada tanggal akan memperbarui konteks hari yang aktif di seluruh modul perencanaan.

## Technical Constraints
- Harus menggunakan komponen `Calendar` dari `@workspace/ui` atau custom strip UI.
- Mock data porsi per zona: SD (550 Kcal), SMP (700 Kcal).
