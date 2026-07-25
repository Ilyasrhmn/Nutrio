# Rencana Orang 1 — Platform, API, dan Workflow Inti

> **Pemilik area:** `apps/api/**` dan, bila diperlukan untuk kontrak API, `packages/common/**`.
> Orang 2 tidak mengubah area ini. Semua perubahan kontrak dipublikasikan melalui PR kecil dan dicatat pada bagian "Kontrak yang Dibekukan" di bawah.

**Tujuan:** mengubah modul backend yang sudah tersebar menjadi satu workflow bisnis yang konsisten dari bahan baku hingga bukti penerimaan, skor, dana, dan audit.

**Prinsip:** selesaikan _vertical slice_ operasional lebih dahulu. Fitur AI, peta, dana, dan dashboard harus membaca fakta dari workflow ini; jangan lagi membuat angka, status, atau transaksi sendiri di tiap halaman.

## Hasil audit

Backend sudah mempunyai fondasi yang baik: autentikasi/RBAC, vendor lifecycle, onboarding, checkpoint, delivery token, konfirmasi sekolah, scoring, notifikasi, command center, public transparency, RAG, dan funds. Namun sambungan antarmodul belum membentuk satu siklus transaksi.

| Kesenjangan                               | Bukti di repo                                                                                                                                                  | Dampak                                                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Marketplace hanya direktori/profil/produk | `suppliers.controller.ts` tidak menyediakan cart, purchase order, penerimaan barang, invoice, atau pembayaran; padahal skema migrasi sudah punya tabel terkait | Vendor tidak dapat benar-benar membeli bahan dan supplier tidak dapat memenuhi pesanan                         |
| Menu, kebutuhan bahan, dan stok hanya UI  | halaman `menu`, `operasional/kalkulasi-bahan`, serta `operasional/stock-opname` tidak punya API/domain backend                                                 | Rencana masak tidak dapat menghasilkan kebutuhan belanja atau menelusuri bahan ke checkpoint                   |
| Workflow harian tidak diorkestrasi        | checkpoint, delivery, school confirmation, scoring, funds, dan command-center hidup sebagai modul terpisah                                                     | Status berakhir di layar masing-masing; skor/dana/audit tidak dapat dipercaya sebagai hasil kejadian yang sama |
| Event lintas modul belum menjadi kontrak  | ada Realtime dan Notifications, tetapi belum ada event domain baku untuk perubahan order/operasional/pengantaran                                               | Notifikasi, dashboard, dan audit terlambat atau harus polling data yang berbeda                                |
| Integrasi eksternal masih mode demo       | `AI_MOCK` default aktif; cache dapat fallback ke memory; tidak ada webhook pembayaran                                                                          | Demo tampak hidup, tetapi tidak siap untuk alur nyata atau kegagalan integrasi                                 |
| Kualitas rilis belum hijau                | `pnpm typecheck` gagal pada web (route `.next` usang, `date-fns` hilang, konfigurasi tipe Jest, dan fixture tanggal)                                           | Tidak ada baseline aman untuk menggabungkan pekerjaan dua orang                                                |

## Bentuk sistem yang dituju

```text
Supplier catalog
  -> purchase order -> goods receipt -> kitchen inventory
  -> daily menu + production plan -> CP1 -> CP2 -> CP3
  -> delivery assignment/token -> CP4 + school confirmation
  -> daily score + incident/alert -> eligible funds/audit/public aggregate
```

Setiap panah menghasilkan record persisten, audit event, dan event real-time. Command center, laporan vendor/supplier/admin, publik, dan notifikasi hanya membaca proyeksi dari record tersebut.

## Kontrak yang dibekukan

Sebelum Orang 2 mulai menyambungkan layar, Orang 1 mengirimkan daftar endpoint, JSON contoh respons, role yang berhak, serta status enum final di PR/komentar PR. Gunakan format respons yang sudah ada; jangan mengganti nama endpoint yang telah dipublikasikan tanpa versi baru.

| Area        | Endpoint minimum yang harus stabil                                                                   | Konsumen                        |
| ----------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| Identitas   | `GET /auth/me`, login/refresh/logout, profil vendor dan supplier aktif                               | Web dan PWA                     |
| Marketplace | katalog supplier/produk, cart/PO, detail dan status PO, penerimaan barang                            | Web vendor dan supplier         |
| Operasional | menu harian, kebutuhan bahan, inventory snapshot/opname, `GET /checkpoints/today`, submit checkpoint | Web vendor dan PWA              |
| Pengantaran | jadwal, penugasan, token/QR, arrived/photo/complete, konfirmasi sekolah                              | Web admin dan PWA sekolah/kurir |
| Monitoring  | score/history, incidents/alerts, funds, audit trail, command-center overview                         | Web admin/vendor/publik         |

Status lintas modul yang tidak boleh ditulis bebas di UI:

```text
PO: draft -> submitted -> accepted | rejected -> preparing -> dispatched -> received -> invoiced -> paid
Operasional: planned -> CP1 -> CP2 -> CP3 -> dispatched -> CP4 -> school_confirmed -> closed
```

## Urutan kerja

### Sprint 0 — Fondasi kolaborasi (hari 1–2)

- [x] Buat `apps/api` e2e scenario dengan satu vendor, satu supplier, satu sekolah, dan satu hari operasional; tambahkan seed yang idempotent.
- [ ] Tentukan DTO/enum publik di `packages/common` hanya bila benar-benar dipakai dua aplikasi; selain itu simpan DTO di modul NestJS agar shared package tidak menjadi tempat sampah.
- [x] Dokumentasikan endpoint dan contoh respons untuk Orang 2, lalu tandai versi `v1` sebagai stabil.
- [ ] Pastikan validasi role pada setiap endpoint: vendor hanya melihat datanya, supplier hanya melihat tokonya, sekolah hanya token sah, admin lintas data.
- [x] Tambahkan test API untuk auth, otorisasi, dan error state utama sebagai pagar regresi.

### Sprint 1 — Procurement dan inventaris (hari 3–6)

**Deliverable:** pesanan nyata bisa dibuat vendor, dipenuhi supplier, diterima sebagai stok dapur.

- [x] Implementasikan domain Purchase Order di modul baru `orders` atau modul `suppliers` yang fokus; jangan menggunakan halaman frontend sebagai sumber status.
- [x] Gunakan tabel migrasi supplier yang sudah ada bila cocok; audit dahulu agar tidak menduplikasi schema. Buat migration tambahan hanya untuk kolom/tabel yang benar-benar belum tersedia.
- [x] Tambahkan cart/PO item, submit/cancel/accept/reject/dispatch/receive, invoice reference, riwayat status, dan validasi stok/harga server-side.
- [x] Implementasikan inventory ledger dan snapshot opname: sumber dapat berasal dari goods receipt, pemakaian recipe, waste, atau penyesuaian opname; jangan hanya menyimpan angka stok terakhir.
- [x] Tambahkan menu harian/recipe/bahan baku dan endpoint perhitungan kebutuhan terhadap kapasitas/pax serta stok tersedia.
- [x] Buat event `order.*`, `inventory.*`, dan notifikasi in-app untuk perubahan status yang relevan.
- [x] Tulis e2e test: vendor membuat PO -> supplier menerima -> vendor menerima barang -> stok meningkat.

### Sprint 2 — Orkestrasi hari operasional (hari 7–10)

**Deliverable:** satu `operationDay` menjadi aggregate tunggal yang menautkan menu, PO/stock, checkpoint, delivery, dan sekolah.

- [x] Tambahkan `operation-day`/service orchestration dengan state-machine; operasi tidak boleh lompat CP1–CP4 dan harus idempotent terhadap retry dari PWA.
- [x] Kaitkan CP1 dengan bahan/PO atau stock reference, CP2/CP3 dengan menu dan jumlah porsi, serta CP4 dengan delivery token yang benar.
- [x] Ubah hasil validasi AI menjadi respons checkpoint nyata yang disimpan: skor, temuan, model/version, URL bukti, dan keputusan pass/warning/fail. Mock tetap boleh ada di environment demo, tetapi melalui antarmuka yang sama.
- [x] Buat alur penugasan delivery dari operation day hingga token QR, lokasi/waktu tiba, foto, dan complete.
- [x] Konfirmasi sekolah harus menutup delivery yang tepat dan menerbitkan event `school.confirmed`; token harus sekali pakai, kedaluwarsa, dan tercatat auditornya.
- [x] Tambahkan incident ketika validasi gagal, telat, jumlah tidak cocok, atau konfirmasi ditolak; jangan menyembunyikan kasus gagal sebagai skor nol semata.
- [x] Tulis e2e test untuk jalur sukses dan jalur ditolak: CP urut, QR kedaluwarsa, token dipakai ulang, dan akses lintas vendor.

### Sprint 3 — Closing the loop (hari 11–13)

**Deliverable:** skor, dana, audit, notifikasi, dan dashboard merupakan konsekuensi dari operation day yang sama.

- [ ] Jadikan scoring membaca checkpoint/delivery/school confirmation/incident, bukan input terpisah. Simpan alasan per perubahan skor.
- [x] Hubungkan eligibility dana/fund ledger dengan operation day yang `closed`; pembayaran nyata dapat tetap di luar scope hackathon, tetapi status simulasi wajib berasal dari event dan aman untuk diproses ulang.
- [x] Tambahkan audit-event append-only untuk perubahan state kritis: PO, stok, checkpoint, delivery, sekolah, skor, dan dana.
- [x] Implementasikan proyeksi query untuk command center, laporan, dan public aggregate dengan filter tanggal/vendor/wilayah. Jangan menghitung dari data dummy di controller.
- [ ] Emisikan event Socket.IO dan notification per transisi penting; email/Resend hanya adapter tambahan dan tidak boleh menjadi satu-satunya bukti notifikasi.
- [x] Tambahkan endpoint health yang memeriksa konfigurasi wajib secara aman dan log correlation ID untuk alur satu operation day.

### Sprint 4 — Penguatan rilis (hari 14)

- [x] Jalankan migration pada database kosong dan seed skenario demo.
- [x] Jalankan test modul baru dan e2e workflow penuh; catat command serta hasil pada PR.
- [x] Pastikan retry tidak menduplikasi PO receipt, checkpoint, score event, atau pembayaran.
- [ ] Review query untuk data personal dan bukti foto: signed URL, batas ukuran/mime, dan role ownership.

## Batas kerja agar tidak bentrok

- Orang 1 satu-satunya yang mengubah `apps/api/**`, migration, seed API, serta tipe kontrak bersama.
- Orang 1 tidak mengubah file halaman/komponen di `apps/web` maupun `apps/pwa`; jika UI belum cocok, ubah kontrak secara backward-compatible atau diskusikan di daily sync.
- Orang 2 boleh membuat mock adapter sementara di aplikasinya, tetapi tidak boleh menganggap mock sebagai kontrak final.
- Perubahan pada `packages/common` harus berupa PR kecil, diberi daftar breaking change, dan digabung sebelum UI menggunakannya.

## Definition of done

- Satu e2e scenario yang bisa diulang menampilkan jejak lengkap dari PO sampai school confirmation dan score/fund/audit.
- Tidak ada status bisnis penting yang hanya berada di memori browser atau array hard-coded.
- Endpoint memiliki auth, ownership check, validasi input, respons error yang konsisten, dan test jalur gagal utama.
- Orang 2 dapat menyambungkan UI hanya dengan endpoint/DTO yang dipublikasikan, tanpa harus membaca implementasi service backend.
