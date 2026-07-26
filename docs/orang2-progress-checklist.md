# Checklist Progress — Rencana Orang 2 (Web, PWA, Integrasi Pengguna)

Update terbaru: setelah `feature/operation-day-backend` (Orang 1) di-merge, backend nambah
modul `orders` (Purchase Order), `inventory` (opname/waste), `menu-plans`, dan `operation-days`
(alur harian: menu plan → operation day → CP1-4 → delivery → close). Ini nutup blocker utama
sesi sebelumnya. Bagian di bawah sudah diupdate untuk reflect integrasi terbaru.

## Lanjutan sesi kelima — verifikasi ulang PWA visual parity

Task tracker sempat menandai "PWA visual restyle to match web design system" selesai tanpa
bukti kerjaan konkret di transcript sesi ini. Diverifikasi ulang:

- [x] `web` dan `pwa` sudah share `globals.css` yang sama dari awal (`@workspace/ui/styles/
      globals.css`) — token warna/font/radius identik di level CSS variable, bukan gap di sini.
- [x] Gap sebenarnya di level komponen: flow `app/cp/[cpId]/{validate,confirm,capture}` masih
      pakai div full-bleed warna hardcode + emoji (✅❌⏳📡🎯🔄) alih-alih pola `Card`+`Badge`+
      lucide-react yang konsisten dipakai di web (`QueryState`) dan halaman PWA lain
      (`pesanan`, `sekolah`, `AIResultCard`). **Sudah direstyle** — semua state screen di
      `validate` dan `confirm` sekarang pola Card-di-tengah dengan icon lingkaran bertint,
      dan kontrol emoji tersisa di `capture` diganti lucide icon.
- [x] IndexedDB offline queue (task sebelumnya) diverifikasi ulang — memang sudah wired penuh
      di kedua flow (`operasional/live` dan `cp/[cpId]/validate`), bukan cuma import tanpa
      dipakai. State `'queued'` render-nya juga sudah dibenerin ke pola Card yang sama.

## Sprint 0 — Baseline aplikasi dan kerangka integrasi

- [x] Build web sehat (`typecheck`, `test` 48/48, `build` semua hijau).
- [x] `QueryState` component + dipasang di banyak halaman.
- [x] Indikator env demo (`NEXT_PUBLIC_DEMO_MODE`).
- [x] PWA auth asli (login/refresh/`/auth/me`).
- [x] Service per-domain: `suppliers.service.ts`, `orders.service.ts`, `inventory.service.ts`,
      `menu-plans.service.ts` (web). PWA masih inline `apiClient` call langsung di tiap page
      (tidak ada layer service terpisah) — konsisten dgn pola PWA yang sudah ada sebelumnya.

## Sprint 1 — Marketplace, pesanan, dan stok nyata

- [x] Marketplace vendor & detail supplier — `GET /suppliers`, `GET /suppliers/:id` real.
- [x] **Checkout PO real** — `POST /orders` dengan `Idempotency-Key` header wajib. Tombol
      "Buat Purchase Order" di marketplace detail sekarang submit sungguhan, redirect ke
      `/portal/orders/:id`.
- [x] **Vendor "My Orders"** (`/portal/orders`, `/portal/orders/[id]`) — list + detail + aksi
      cancel/receive (vendor) dan accept/reject/dispatch (supplier, halaman sama, role-branch).
- [x] **Supplier order queue** (`/portal/supplier/orders`) — list PO masuk, badge highlight
      yang perlu ditinjau.
- [x] Supplier products/shop — `GET/POST/PATCH/DELETE /suppliers/me/products`,
      `GET/PATCH /suppliers/me/profile` real (dari sesi sebelumnya, tidak berubah).
- [x] **Stock opname real** — `GET /inventory/current`, `POST /inventory/opname`,
      `POST /inventory/waste`. Bahan yang muncul cuma yang pernah diterima lewat PO (sesuai
      semantik inventory_ledger backend).
- [x] **Kalkulasi bahan real** — `GET/POST /menu-plans/:date`. Vendor pilih produk lewat
      pencarian supplier inline, backend hitung `requiredQuantity/availableQuantity/
      shortageQuantity` — bukan kalkulasi client lagi.
- [x] Kontrak PO ditulis lalu **resolved** — `docs/contract-purchase-orders.md` diupdate status.
- [ ] Playwright test vendor buat PO / supplier ubah status — belum dibuat (fiturnya sudah
      nyata sekarang, tinggal ditulis testnya).

## Sprint 2 — PWA hari operasional, delivery, dan sekolah

- [x] PWA auth asli (JWT Bearer + refresh, `mockUsers` dihapus).
- [x] Checkpoint capture — polling `GET /checkpoints/today` untuk hasil AI asli (bukan fabricated).
- [x] **Operation-day gating** — backend sekarang mewajibkan `operation_day` aktif sebelum CP1
      bisa submit (409 kalau belum ada). PWA `operasional/live` sekarang: cek
      `GET /operation-days/today` → kalau kosong, coba bikin dari menu plan hari ini via
      `POST /operation-days` → kalau menu plan juga belum ada, tampil pesan jelas "susun menu
      dulu di web" (bukan submit checkpoint yang gagal membingungkan). Kalau stok kurang
      (422 `INSUFFICIENT_INVENTORY`), tampilkan daftar shortage asli dari server.
- [x] Semantik "Orders" — halaman checkpoint progress pindah ke `operasional/progress`
      (vendor), supplier dapat `/pesanan`.
- [x] **`/pesanan` (supplier) real** — `GET /orders/supplier` + accept/reject/dispatch.
      Sebelumnya "belum tersedia", sekarang fungsional penuh.
- [ ] Retry upload foto + antrian offline (IndexedDB) — belum dikerjakan.
- [ ] Batas ukuran foto, fallback upload non-kamera, UI offline/kamera ditolak — belum.
- [x] **Ketemu flow checkpoint KEDUA yang aktif** — `apps/pwa/app/cp/[cpId]/{context,capture,
      validate,confirm}`, dilink dari home dashboard (`app/page.tsx`), paralel sama
      `operasional/live`. Punya bug sama persis (klaim "Foto Valid!" instan tanpa nunggu AI,
      gak ada operation-day gating). Di-extract jadi `hooks/use-operation-day-check.ts` dipakai
      di kedua flow; `validate/page.tsx` sekarang polling `/checkpoints/today` buat hasil AI
      asli.
- [x] Sekolah flow (`app/sekolah/page.tsx`, `sekolah/confirm/page.tsx`) — sudah real dari
      awal (`/public/sppg/search`, `/public/overview`, `GET/POST /sekolah/confirm/:token`).
      Dicek ulang field DTO backend (`jumlahDiterima`, `kondisi`, `catatan`) masih cocok
      persis sama request body PWA — tidak ada breaking change dari perubahan backend.
- [x] PWA score/history/notifications/publik — dicek, semua sudah panggil endpoint real
      (`/scoring/history`, dst), tidak ada data fake.
- [x] Fallback upload file non-kamera — sudah, lihat bagian "Lanjutan sesi ketiga" di bawah.
- [ ] Retry upload foto + antrian offline (IndexedDB) — belum dikerjakan.
- [ ] Batas ukuran foto, UI offline/kamera ditolak — belum.
- [ ] Playwright/mobile smoke test login → CP1 → CP4/delivery → sekolah confirm — belum dibuat.
- [x] **End-to-end PO flow dites manual via browser**: marketplace checkout (vendor) →
      accept → dispatch (supplier) → receive (vendor) → stok inventory bertambah real.
      Nemu & fix 2 bug: migration belum jalan di DB lokal pasca-merge (`pnpm db:migrate`),
      dan `GET /orders/:id` balikin `items`/`history` snake_case + angka string (beda dari
      top-level yang camelCase) — dinormalize di `orders.service.ts`. Juga nemu bug kecil di
      backend: `po_status_logs` ke-insert dobel (DB trigger + kode service) — dicatat, tidak
      difix (di luar scope `apps/api`).

## Sprint 3 — Monitoring, transparansi, dan operasi admin

- [x] Command-center, map, logistics, audit, admin-reports, funds admin — real (sesi
      sebelumnya, tidak berubah signifikan oleh merge ini kecuali funds: query transaksi
      sekarang UNION dengan `fund_projections`, `paidAt` bisa null — sudah dipatch supaya
      tidak nampilkan "Invalid Date").
- [x] Funds vendor — draft lokal (masih tidak ada modul pembukuan vendor personal di backend,
      belum berubah oleh merge ini).
- [x] `GET /command-center/operation-days` — endpoint baru (overview operation day per vendor:
      checkpoint done, delivery confirmed, fund projection, score). **Belum dipakai** di web —
      peluang bagus buat command-center/mission-control drill-down, belum digarap sesi ini.
- [x] Vendor reports & supplier reports — lihat bagian "Lanjutan sesi ketiga" di bawah.
- [ ] Drill-down alert → vendor → operation day → checkpoint/delivery → incident → audit trail
      — belum. Audit trail sendiri masih belum ada endpoint lintas-vendor.
- [ ] Halaman publik — belum diaudit.

## Lanjutan sesi ketiga (setelah "gass" #2)

- [x] `pnpm lint` dijalankan (`next lint` sudah deprecated di Next 16, dipakai `eslint .`
      langsung) — 0 error, ~21rb warning `no-explicit-any` yang mayoritas baseline lama
      (pre-existing di repo, bukan dari kerjaan sesi ini). Tidak di-fix massal karena scope
      di luar permintaan dan bukan bug.
- [x] `apps/web/app/portal/(vendor)/operasional/jadwal/page.tsx` — halaman jadwal minggu
      ini yang tadinya 100% hardcode (menu ngarang, alamat/jarak sekolah ngarang, badge kalori
      ngarang), sekarang pakai `GET /delivery/my/week-schedule` asli. Klaim yang gak bisa
      dibuktikan (alamat, jarak, kalori) dihapus, bukan dipertahankan.
- [x] Delivery kurir flow (`apps/web/app/delivery/[token]/page.tsx`) dicek — sudah **fully
      real** dari awal (GPS, foto native camera+galeri, QR, complete), tidak perlu diubah.
- [x] `/cp/[cpId]/capture` — tadinya blokir total `<input type="file">` di seluruh dokumen,
      tanpa jalan keluar kalau izin kamera ditolak. Ditambah fallback upload galeri
      eksplisit + retry kamera, konsisten sama pola yang dipakai `operasional/live` dan
      halaman delivery kurir.
- [x] Supplier reports (`reports/components/supplier-reports.tsx`) — diganti total pakai
      `GET /orders/supplier` real (total PO, nilai, status breakdown, tren mingguan dari
      tanggal kirim, tabel PO terbaru).
- [x] Vendor reports (`vendor-reports.tsx`) — food cost / wastage-per-kategori / log produksi
      **tidak ada endpoint sama sekali** di backend (inventory cuma expose saldo saat ini,
      bukan riwayat harian). Bagian itu diganti alert eksplisit "belum tersedia" +
      alasannya; satu-satunya metrik real yang ada (`GET /scoring/history`) dipertahankan
      sebagai chart tren skor.

## Lanjutan sesi keempat ("gass" #3, exclude e2e)

- [x] Command-center vendor detail — sudah ada drill-down alert→vendor dari sesi sebelumnya;
      ditambah kartu **Hari Operasional** (target pax, checkpoint, delivery dikonfirmasi,
      estimasi dana) dari `GET /command-center/operation-days?vendorId=` yang sebelumnya belum
      dipakai sama sekali. Drill-down ke incident masih belum bisa — endpoint-nya gak ada
      (lihat kontrak baru).
- [x] **IndexedDB offline retry queue** — `apps/pwa/lib/offline-queue.ts` +
      `hooks/use-offline-queue-sync.ts` + banner global di layout. Kegagalan submit foto
      checkpoint akibat network (bukan validasi server) sekarang disimpan ke IndexedDB dan
      di-retry otomatis pas online lagi. Dipasang di kedua flow checkpoint
      (`operasional/live` dan `cp/[cpId]/validate`).
- [x] 3 kontrak issue baru ditulis buat gap backend yang genuinely gak bisa dikerjain dari
      sisi frontend: `docs/contract-audit-trail.md` (audit log + incidents read/patch),
      `docs/contract-vendor-coordinates.md` (lat/lng vendor buat peta),
      `docs/contract-vendor-bookkeeping.md` (income vendor-scoped + expense tracking).
      **Ketemu isu keamanan sekalian**: `GET /funds/transactions` gak di-scope per role —
      semua user login bisa lihat payment history vendor lain. Dicatat di kontrak, bukan
      difix (backend, di luar scope).

## Sprint 4 — QA lintas peran

- [ ] `pnpm test:e2e` — belum dijalankan.
- [x] Verifikasi manual: `pnpm typecheck` + `pnpm build` untuk `apps/web` dan `apps/pwa`
      dijalankan berkali-kali sepanjang integrasi ini, selalu hijau di titik commit.
- [ ] `pnpm lint` — belum dijalankan sesi ini.
- [ ] Uji 3 role browser (vendor/supplier/sekolah-admin) end-to-end untuk alur PO baru —
      belum dilakukan (perlu login manual tiap role, cek create PO → accept → dispatch →
      receive → stok bertambah).

## Blocker yang sudah resolved sesi ini

1. ~~Tidak ada endpoint Purchase Order~~ → **ADA** (`orders` module).
2. ~~Tidak ada modul menu/resep/inventory dapur vendor~~ → **ADA** (`inventory` +
   `menu-plans` module).

## Blocker yang masih ada

1. **Tidak ada endpoint audit-log lintas vendor** — halaman Audit BGN masih kosong by design.
2. **Tidak ada koordinat vendor** — peta sebaran mitra tidak bisa plot pin asli.
3. **Tidak ada modul pembukuan vendor** (income/expense pribadi) — funds vendor tetap draft
   lokal.
4. **Delivery/sekolah flow PWA belum diverifikasi ulang** pasca perubahan backend (guard baru
   di beberapa endpoint delivery).

## File baru/berubah signifikan (sesi integrasi ini)

- `apps/web/lib/services/orders.service.ts`, `inventory.service.ts`, `menu-plans.service.ts` (baru)
- `apps/web/app/portal/(vendor)/orders/**`, `apps/web/app/portal/(supplier)/supplier/orders/**` (baru)
- `apps/web/app/portal/(vendor)/marketplace/[supplierId]/page.tsx` (checkout real)
- `apps/web/app/portal/(vendor)/operasional/stock-opname/page.tsx` (rewrite total, real)
- `apps/web/app/portal/(vendor)/operasional/kalkulasi-bahan/page.tsx` (rewrite total, real)
- `apps/web/components/funds/admin-funds.tsx` (null-safety `paidAt`)
- `apps/pwa/app/pesanan/page.tsx` (rewrite total, real)
- `apps/pwa/app/operasional/live/page.tsx` (tambah operation-day gating)
- `docs/contract-purchase-orders.md` (status resolved)
