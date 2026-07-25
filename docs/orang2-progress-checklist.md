# Checklist Progress — Rencana Orang 2 (Web, PWA, Integrasi Pengguna)

Update terbaru: setelah `feature/operation-day-backend` (Orang 1) di-merge, backend nambah
modul `orders` (Purchase Order), `inventory` (opname/waste), `menu-plans`, dan `operation-days`
(alur harian: menu plan → operation day → CP1-4 → delivery → close). Ini nutup blocker utama
sesi sebelumnya. Bagian di bawah sudah diupdate untuk reflect integrasi terbaru.

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
- [ ] Delivery flow (`apps/pwa/app/cp/[cpId]/*`, `sekolah/*`) — backend `delivery.service.ts`
      dan `school-confirm.service.ts` berubah signifikan sesi ini (butuh JWT auth sekarang di
      endpoint yang sebelumnya publik: `arrived`, `photo`). **Belum diverifikasi ulang** apakah
      PWA existing pages masih kompatibel — endpoint path tidak berubah, hanya nambah guard,
      jadi kemungkinan tetap jalan karena `apiClient` PWA sudah attach Bearer token, tapi belum
      dites end-to-end.
- [ ] PWA score/history/notifications/publik — belum diaudit.
- [ ] Playwright/mobile smoke test login → CP1 → CP4/delivery → sekolah confirm — belum dibuat.

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
- [ ] Vendor reports & supplier reports charts — masih fake, belum diaudit ulang.
- [ ] Drill-down alert → vendor → operation day → checkpoint/delivery → incident → audit trail
      — belum. Audit trail sendiri masih belum ada endpoint lintas-vendor.
- [ ] Halaman publik — belum diaudit.

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
