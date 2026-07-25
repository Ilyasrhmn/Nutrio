# Rencana Orang 2 — Web, PWA, dan Integrasi Pengguna

> **Pemilik area:** `apps/web/**`, `apps/pwa/**`, dan komponen UI yang hanya diperlukan oleh aplikasi. Orang 2 tidak mengubah `apps/api/**`, migration, atau `packages/common/**`; kebutuhan kontrak disampaikan kepada Orang 1.

**Tujuan:** menjadikan web portal dan PWA sebagai pengalaman peran yang nyata, bukan kumpulan halaman demo—semua status dan aksi berasal dari API workflow yang dimiliki Orang 1.

**Prinsip:** UI tidak menyimpan aturan bisnis. UI menampilkan state dari API, mengirim command tervalidasi, dan menangani loading/error/empty/retry/offline secara eksplisit.

## Hasil audit

| Kesenjangan                                                 | Bukti di repo                                                                                                                                             | Prioritas                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Banyak portal UI memakai array state dan toast sukses lokal | marketplace vendor, daftar produk supplier, stock opname, kalkulasi bahan, inventory, chat, audit, logistics, dan map memiliki data hard-coded/aksi lokal | P0 — pengguna mengira data tersimpan, padahal tidak              |
| PWA belum memakai akun asli                                 | `apps/pwa/components/providers/auth-provider.tsx` memilih `mockUsers` berdasarkan role                                                                    | P0 — semua data PWA tidak terikat identitas/otorisasi sebenarnya |
| PWA masih menampilkan hasil AI buatan setelah submit        | `apps/pwa/app/operasional/live/page.tsx` membuat `AiResult` statis setelah request                                                                        | P0 — hasil lapangan tidak sesuai keputusan backend               |
| Jalur pembelian salah semantik                              | `apps/pwa/app/orders/page.tsx` membaca checkpoint, bukan purchase order                                                                                   | P0 — procurement dan operasi tercampur                           |
| Hanya sebagian kecil halaman web memanggil API              | halaman eligibility, onboarding, mission-control, debrief, public, RBAC, delivery, school confirmation, RAG terhubung; sebagian besar portal belum        | P1                                                               |
| Build belum sehat                                           | `pnpm typecheck` gagal di web: route `.next` stale, dependensi `date-fns`, tipe Jest, dan fixture tanggal                                                 | P0 — harus dibereskan sebelum integrasi besar                    |

## Aturan antarmuka dengan Orang 1

1. Gunakan endpoint dan enum `v1` yang dipublikasikan Orang 1; jangan menebak nama field atau status.
2. Simpan API call di client/service per domain, bukan langsung tersebar di tiap page. Gunakan client web yang ada dan satu wrapper PWA yang setara.
3. Saat endpoint belum siap, gunakan adapter lokal dengan fixture yang memiliki bentuk respons final; beri label `temporary` dan hapus pada PR integrasi.
4. Setiap UI state wajib memiliki minimal: loading, empty, actionable error, dan success/revalidation. Aksi mutasi harus disabled saat request berjalan.
5. Jangan mengubah file backend atau schema untuk mengejar deadline UI. Buat issue kontrak berisi URL, body, respons, role, dan acceptance test yang dibutuhkan.

## Urutan kerja

### Sprint 0 — Baseline aplikasi dan kerangka integrasi (hari 1–2)

**Deliverable:** kedua aplikasi dapat build/typecheck secara bersih dan memiliki pola API/auth yang sama.

- [ ] Bersihkan hasil build `.next` lalu perbaiki dua route yang tidak lagi ada atau pulihkan route yang memang dibutuhkan; jangan commit artifact build.
- [ ] Tambahkan/benahi dependensi `date-fns` atau hapus penggunaan yang tidak diperlukan dengan solusi standar; perbaiki konfigurasi Jest agar file test tidak merusak `tsc` produksi dan selaraskan fixture tanggal dengan tipe service.
- [ ] Ganti PWA `mockUsers` dengan login, refresh, logout, `GET /auth/me`, role guard, dan redirect setelah login. PWA serta web harus menangani 401 dengan pola yang konsisten.
- [ ] Buat service/client domain di masing-masing app: `auth`, `orders`, `inventory`, `operation`, `delivery`, `school-confirmation`, `monitoring`. Halaman hanya memanggil service ini.
- [ ] Tambahkan satu komponen/pola status standar untuk loading, empty, forbidden, network error, dan retry agar halaman tidak diam ketika API gagal.
- [ ] Tambahkan indikator environment demo yang jelas apabila API mock aktif; jangan pernah menampilkan data demo seolah data akun pengguna.

### Sprint 1 — Marketplace, pesanan, dan stok nyata (hari 3–6)

**Deliverable:** vendor bisa menemukan produk, membuat PO, supplier memprosesnya, dan vendor melihat penerimaan/stok aktual.

- [ ] Ganti katalog statis pada `apps/web/app/portal/(vendor)/marketplace/**` dengan daftar supplier/produk dari API, search/filter yang diterjemahkan ke query API, detail produk, dan empty state.
- [ ] Implementasikan cart dan submit PO di web vendor. Tampilkan validasi stok/harga dari server, detail PO, timeline status, serta cancel hanya saat state mengizinkan.
- [ ] Sambungkan area supplier (`products`, `shop`, inventory, dan order queue bila dibuat) ke profil/produk/PO API. Tombol tambah/edit/hapus/status produk harus mengubah data server dan melakukan revalidate.
- [ ] Ubah `apps/pwa/app/orders/**` menjadi daftar/detail purchase order yang benar; buat halaman progress checkpoint tetap di area operasional agar istilah produk tidak membingungkan.
- [ ] Sambungkan stock opname dan kalkulasi bahan web ke inventory/menu API. Hilangkan `Math.random`, initial array bahan, dan toast sukses tanpa respons server.
- [ ] Tampilkan asal stok (goods receipt/opname/waste) serta status sinkronisasi pada layar yang relevan, bukan hanya angka total.
- [ ] Tambahkan Playwright test untuk vendor membuat PO dan supplier melakukan aksi status yang tersedia pada role-nya.

### Sprint 2 — PWA hari operasional, delivery, dan sekolah (hari 7–10)

**Deliverable:** pekerja lapangan dapat menyelesaikan satu hari operasional memakai PWA dengan bukti yang benar.

- [ ] PWA dashboard membaca operation day/checkpoint hari ini; navigasi hanya membuka checkpoint yang diizinkan backend.
- [ ] Ubah capture checkpoint untuk menampilkan respons AI/checkpoint asli—temuan, skor, status, URL bukti, dan alasan gagal—bukan `AiResult` statis.
- [ ] Implementasikan retry aman ketika upload gagal dan status upload yang jujur. Untuk fase pertama, simpan antrian terenkripsi/terbatas di IndexedDB hanya untuk payload foto yang belum terkirim; hapus setelah server mengakui idempotency key.
- [ ] Tambahkan batas ukuran foto, petunjuk izin kamera, fallback upload file, dan UI ketika browser offline/kamera ditolak.
- [ ] Sambungkan jadwal pengantaran, QR/token, arrived, foto serah-terima, dan complete ke endpoint delivery. Jangan menyimpan token atau hasil QR di route state saja.
- [ ] Sambungkan layar sekolah dan konfirmasi QR ke token asli; tampilkan identitas delivery, jumlah porsi, waktu, bukti, serta state sudah digunakan/kedaluwarsa/ditolak.
- [ ] PWA score, history, notifications, dan public harus membaca endpoint masing-masing. Hapus file mock yang tidak lagi dipakai setelah seluruh consumer bermigrasi.
- [ ] Tambahkan Playwright/mobile smoke test: login -> CP1 -> CP4/delivery -> sekolah confirm; tambah kasus offline submit/retry bila IndexedDB sudah diterapkan.

### Sprint 3 — Monitoring, transparansi, dan operasi admin (hari 11–13)

**Deliverable:** semua peran melihat fakta yang sama dari operation day dan dapat menindaklanjuti masalah.

- [ ] Sambungkan command center ke overview, alerts, delivery, dan vendor detail API; tombol acknowledge alert harus memanggil server dan memperbarui daftar.
- [ ] Ganti data statis halaman map/logistics/audit/reports/funds dengan query API. Jika endpoint belum ada, tampilkan empty state yang transparan—bukan angka/foto demo.
- [ ] Tambahkan drill-down dari alert/dashboard ke vendor, operation day, checkpoint/delivery, incident, dan audit trail terkait agar admin dapat menelusuri sebab akibat.
- [ ] Sambungkan mission-control, debrief, dan notification bell pada event yang sama. Gunakan Socket.IO untuk invalidasi/reload ringan, dengan fallback polling/retry saat socket terputus.
- [ ] Halaman publik menampilkan aggregate dan traceability yang aman untuk publik; jangan kirim PII, lokasi detail, token, atau signed URL privat.
- [ ] Beri label eksplisit untuk fitur yang belum produktif—misalnya pembayaran sebenarnya, model AI live, atau blockchain—agar demo tidak mengklaim integrasi yang belum ada.

### Sprint 4 — QA pengalaman lintas peran (hari 14)

- [ ] Jalankan `pnpm --filter web test:e2e` dan test PWA yang tersedia; tambah smoke test login semua role serta forbidden access.
- [ ] Uji dengan seed scenario Orang 1 dari tiga browser/session: vendor, supplier, sekolah/admin. Verifikasi perubahan status terlihat tanpa reload penuh atau dengan revalidate yang jelas.
- [ ] Audit seluruh tombol yang memberi toast sukses: setiap tombol harus terbukti memanggil endpoint atau diubah menjadi nonaktif/coming soon.
- [ ] Hapus fixture/mock yang consumer-nya sudah tidak ada dan pastikan tidak ada navigasi ke halaman `_archive` dari UI aktif.
- [ ] Jalankan `pnpm typecheck`, `pnpm lint`, dan build aplikasi yang diubah; sertakan output ringkas pada PR.

## Pembagian file dan titik rawan konflik

| Orang 2 miliki           | Tidak disentuh Orang 2              | Koordinasi wajib                                 |
| ------------------------ | ----------------------------------- | ------------------------------------------------ |
| `apps/web/**`            | `apps/api/**`                       | body/response endpoint, enum status, error code  |
| `apps/pwa/**`            | migrations dan `packages/common/**` | idempotency upload, token QR, auth cookie/header |
| komponen UI khusus layar | service/domain backend              | realtime event name dan payload                  |

Jika dua aplikasi memerlukan UI yang sama, orang ini boleh memindahkannya ke `packages/ui` **hanya** setelah menyepakati ownership dengan Orang 1 dan memastikan komponen tersebut murni presentational. Jangan menaruh service/API client di `packages/ui`.

## Definition of done

- Pengguna setiap role dapat login sebagai dirinya sendiri; tidak ada switch role berbasis mock di runtime.
- Tidak ada angka bisnis, daftar produk/pesanan/stok, status checkpoint, atau hasil AI yang diciptakan sendiri oleh halaman produksi.
- Setiap alur utama dapat ditelusuri dari UI kembali ke endpoint dan ID record yang sama.
- Web dan PWA membedakan dengan jelas loading, data kosong, error, akses terlarang, offline, serta proses berhasil.
- `pnpm typecheck` tidak gagal karena aplikasi web/PWA dan smoke test lintas peran melewati alur inti.
