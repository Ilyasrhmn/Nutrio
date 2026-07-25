# Checklist Progress — Rencana Orang 2 (Web, PWA, Integrasi Pengguna)

Status per sesi ini. Dicocokkan ke struktur sprint di `Rencana Orang 2`. Commit terkait ada di
branch `feature/web-pwa-baseline`.

## Sprint 0 — Baseline aplikasi dan kerangka integrasi

- [x] Bersihkan build web — fix tsconfig exclude `__tests__` dari tsc produksi, fix ts-jest
      config (`rootDir`/`declaration`) yang bikin `pnpm test` gagal. `pnpm typecheck`,
      `pnpm test` (48/48), `pnpm build` semua hijau untuk `apps/web`.
- [x] Route `_archive` (checkpoints, live) dicek — sudah underscore-prefixed, otomatis tidak
      keroute Next.js, aman.
- [x] Komponen status standar: `packages/ui/src/components/query-state.tsx` (`QueryState`) —
      loading/empty/error/forbidden + retry. Dipasang di admin dashboard, roles, permissions,
      menus, marketplace, supplier products/shop/inventory, funds, reports, map, logistics.
- [x] Indikator env demo: `NEXT_PUBLIC_DEMO_MODE` banner di `apps/web/app/portal/layout.tsx`.
- [x] PWA: mockUsers diganti login/refresh/`/auth/me` asli (lihat Sprint 2).
- [ ] Service/client per-domain (`orders`, `inventory`, `operation`, `delivery`,
      `school-confirmation`, `monitoring`) di `apps/web/lib/services/` — baru dibuat
      `suppliers.service.ts`; domain lain (delivery, school-confirmation, monitoring) belum
      punya file service terpisah karena UI-nya belum digarap (dihindari servis kosong tanpa
      pemakai, sesuai YAGNI). Bikin saat halamannya digarap.

## Sprint 1 — Marketplace, pesanan, dan stok nyata

- [x] Marketplace vendor (`apps/web/app/portal/(vendor)/marketplace/page.tsx`) — data statis
      diganti `GET /suppliers` asli (search, filter kategori dinamis dari data, pagination).
- [x] Detail supplier (`marketplace/[supplierId]/page.tsx`) — `GET /suppliers/:id` asli
      (produk, ulasan, dokumen legalitas). Cart tetap lokal; tombol "Buat Purchase Order"
      **disabled** dengan label "Segera Hadir" — backend belum punya endpoint PO sama sekali.
- [x] Supplier products (`supplier/products`, `supplier/products/add`) — `GET/POST/PATCH/DELETE
      /suppliers/me/products` asli. Delete sekarang benar-benar memanggil server (sebelumnya
      cuma toast lokal).
- [x] Supplier shop (`supplier/shop`) — `GET/PATCH /suppliers/me/profile` asli. Field yang
      backend belum dukung ubah (nama perusahaan, alamat, radius, logo) dijadikan read-only
      dengan penjelasan, bukan pura-pura bisa disimpan.
- [x] Supplier inventory (`supplier/inventory`) — disederhanakan jadi tabel stok asli dari
      `listMyProducts`; angka KPI karangan (nilai aset gudang, PO belum kirim, dst — backend
      tidak punya ledger PO/inbound-outbound) dihapus, bukan dipertahankan sebagai dekorasi.
- [x] **Kontrak issue ditulis**: `docs/contract-purchase-orders.md` — spesifikasi endpoint
      `POST/GET /purchase-orders`, `PATCH /purchase-orders/:id/status` yang dibutuhkan Sprint 1
      lanjutan (cart checkout, PWA pesanan supplier), lengkap dengan body/response/acceptance
      test. **Ini blocker utama sisa Sprint 1** — submit PO real tidak bisa jalan sampai Orang 1
      menyediakan endpoint ini.
- [x] Stock opname & kalkulasi bahan (`operasional/stock-opname`, `operasional/kalkulasi-bahan`)
      — tidak ada modul menu/resep/inventory dapur di backend sama sekali. Diubah jadi
      kalkulator lokal jujur: input manual, draft tersimpan di `localStorage`, label eksplisit
      "belum tersinkron ke server" (bukan klaim "masuk sistem" seperti sebelumnya).
- [ ] Playwright test vendor buat PO / supplier ubah status PO — **tidak bisa dibuat**, fitur
      itu sendiri belum ada (blocked oleh kontrak PO di atas).

## Sprint 2 — PWA hari operasional, delivery, dan sekolah

- [x] PWA auth asli — `apps/pwa/lib/api-client.ts` ditulis ulang (Bearer token + refresh,
      match kontrak backend yang taruh token di body, bukan cookie). `auth-provider.tsx`
      pakai `POST /auth/login` asli, hapus `mockUsers` dan role-switcher demo di halaman
      Pengaturan.
- [x] Checkpoint capture (`operasional/live`) — hasil AI yang tadinya di-fabricate langsung
      setelah submit (score 90, confidence 0.88 hardcode) diganti polling `GET
      /checkpoints/today` untuk `aiValidation`/`scoreDelta` asli (validasi AI backend memang
      async). Kalau belum selesai dalam window polling, tampil status "masih diproses" — jujur,
      bukan dipalsuin.
- [x] Semantik "Orders" diperbaiki — halaman yang isinya progress checkpoint vendor (CP1-4)
      tapi dipasang di nav "Orders" milik role SUPPLIER dipindah ke
      `operasional/progress` (vendor). Supplier sekarang dapat `/pesanan` dengan status
      "belum tersedia" yang jujur (bukan 404 atau data vendor yang salah konteks).
- [ ] Retry upload aman + antrian IndexedDB untuk foto yang gagal terkirim — **belum
      dikerjakan**, di luar scope sesi ini.
- [ ] Batas ukuran foto, fallback upload file non-kamera, UI offline/kamera ditolak — belum
      dikerjakan.
- [ ] Delivery flow (jadwal, QR/token, arrived, foto serah-terima, complete) dan sekolah
      confirm — belum diaudit sesi ini; `apps/pwa/app/sekolah/*` sudah ada route-nya tapi
      belum dicek datanya real atau mock.
- [ ] PWA score/history/notifications/publik — belum diaudit sesi ini.
- [ ] Playwright/mobile smoke test login → CP1 → CP4/delivery → sekolah confirm — belum dibuat.

## Sprint 3 — Monitoring, transparansi, dan operasi admin

- [x] Command-center — sudah real dari sebelumnya (`GET /command-center/overview,vendors,alerts,
      deliveries,reports,sppg/:id`), dikonfirmasi lewat audit, tidak diubah.
- [x] Map (`portal/map`) — `GET /command-center/vendors` asli, status turunan dari skor. Backend
      tidak punya koordinat vendor sama sekali → area peta menampilkan pesan jujur "lokasi
      belum tersedia", bukan pin GPS ngarang.
- [x] Logistics (`portal/logistics`) — `GET /command-center/deliveries` asli (status, GPS token
      pengiriman kalau ada, manifest). Angka armada/SLA/tervalidasi yang hardcode dihapus,
      diganti hitungan real dari data pengiriman.
- [x] Audit (`portal/audit`) — tidak ada endpoint audit-log lintas vendor di backend sama
      sekali. Diubah jadi halaman "belum tersedia" eksplisit, bukan tabel log fiktif.
- [x] AI Reports admin (`reports/components/admin-reports.tsx`) — `GET /command-center/reports`
      asli untuk compliance/fraud-prevention rate dan anomali per vendor. Kartu batch/lab/fraud
      fiktif dihapus.
- [x] Funds admin (`components/funds/admin-funds.tsx`) — `GET /funds/summary` +
      `/funds/transactions` asli. Klaim "Smart Contract auto-disbursement" (fitur yang tidak
      ada) di-relabel jadi "Konsep — Belum Aktif" sesuai DoD (jangan klaim integrasi yang
      belum ada).
- [x] Funds vendor (`components/funds/vendor-funds.tsx`) — tidak ada modul pembukuan
      income/expense vendor di backend. Diubah jadi draft lokal (`localStorage`) yang jujur,
      `Math.random()` id diganti `crypto.randomUUID()`.
- [ ] Vendor reports & supplier reports (`reports/components/vendor-reports.tsx`,
      `supplier-reports.tsx`) — **masih fake**, belum diaudit/wiring sesi ini. Tidak ada
      endpoint per-role reports dengan chart yang jelas cocok; butuh kontrak tambahan atau
      keputusan reuse `scoring/history`.
- [ ] Drill-down alert → vendor → operation day → checkpoint/delivery → incident → audit trail
      — belum dikerjakan (audit trail sendiri belum ada).
- [ ] Mission-control, debrief, notification bell — mission-control & debrief sudah real dari
      sebelumnya (dikonfirmasi lewat audit), belum disambungkan ulang ke event yang sama /
      Socket.IO invalidation sesi ini.
- [ ] Halaman publik (`/publik`) — belum diaudit sesi ini.
- [x] Label eksplisit fitur belum produktif — diterapkan di funds ("Konsep — Belum Aktif"),
      marketplace PO ("Segera Hadir"), audit ("Belum Tersedia"), map ("lokasi belum
      tersedia").

## Sprint 4 — QA lintas peran

- [ ] `pnpm test:e2e` dan smoke test PWA — belum dijalankan sesi ini.
- [ ] Uji 3 browser/session (vendor/supplier/sekolah-admin) — belum dilakukan; verifikasi
      manual sesi ini terbatas pada login admin & vendor lewat browser tool untuk cek
      halaman yang diubah tidak regresi (roles, permissions, menus, dashboard, marketplace).
- [x] Audit tombol toast-sukses-tanpa-server — ditemukan & diperbaiki: supplier products
      delete, shop save, funds vendor expense (sekarang localStorage jujur, bukan diam-diam
      tidak tersimpan sama sekali seperti sebelumnya).
- [x] Hapus fixture/mock yang consumer-nya hilang — `apps/pwa/lib/mock-data/orders.ts`,
      `apps/pwa/components/orders/order-card.tsx`, `apps/pwa/app/orders/[id]` (redirect stub)
      dihapus.
- [ ] `pnpm typecheck`, `pnpm lint`, build semua app — `typecheck` dan `build` untuk
      `apps/web` dan `apps/pwa` dijalankan berkali-kali sepanjang sesi ini dan selalu hijau
      di titik commit. `pnpm lint` **belum dijalankan** sesi ini.

## Ringkasan blocker terbesar

1. **Tidak ada endpoint Purchase Order** (`docs/contract-purchase-orders.md`) — menahan
   checkout marketplace web dan halaman Pesanan supplier PWA supaya jadi nyata.
2. **Tidak ada endpoint audit-log lintas vendor** — halaman Audit BGN masih kosong by design.
3. **Tidak ada koordinat vendor** — peta sebaran mitra tidak bisa plot pin asli.
4. **Tidak ada modul menu/resep/inventory dapur vendor** — stock opname & kalkulasi bahan jadi
   kalkulator lokal, bukan terintegrasi backend.
5. **Tidak ada modul pembukuan vendor** (income/expense pribadi) — funds vendor jadi draft
   lokal.

## File baru/berubah signifikan

- `packages/ui/src/components/query-state.tsx` (baru)
- `apps/web/lib/services/suppliers.service.ts` (baru)
- `apps/web/lib/services/error-handler.ts` (`toQueryError` ditambah)
- `apps/pwa/lib/api-client.ts` (ditulis ulang total)
- `apps/pwa/components/providers/auth-provider.tsx` (ditulis ulang total)
- `docs/contract-purchase-orders.md` (baru)
- `docs/orang2-progress-checklist.md` (file ini)
