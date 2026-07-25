# Vendor Readiness dan Admin Management — Design

## Tujuan

Menyatukan onboarding vendor, lifecycle vendor, dan admin management menjadi satu alur yang secara otomatis mengaktifkan vendor untuk kebutuhan demo, tetapi tetap dapat diaudit dan siap diganti dengan approval manual di masa depan.

## Scope

- Onboarding profil, lokasi, bukti, tim inti, simulasi, dan koneksi supplier.
- Penilaian readiness otomatis serta transisi lifecycle sampai `ACTIVE`.
- Console admin untuk memantau vendor, evidence, lifecycle timeline, staf vendor, serta override suspend/resume/revision.
- RBAC, ownership, idempotensi, dan audit untuk aksi kritis.
- Unit/API/E2E pada jalur sukses dan gagal utama.

## Non-scope

- RAG dan fitur AI percakapan.
- Pembayaran, disbursement, dan marketplace di luar koneksi supplier onboarding.
- Approval manual berjenjang, integrasi email/SMS produksi, atau workflow inspeksi lapangan baru.

## Arsitektur

`VendorReadinessService` menjadi satu-satunya penyusun keputusan otomatis. Ia membaca evidence onboarding dan lifecycle yang tersimpan, menghasilkan daftar syarat yang belum lengkap, lalu memanggil `StateMachineService` hanya untuk transisi yang legal. UI tidak menulis `lifecycle_status` secara langsung.

```text
Evidence onboarding + status inspeksi demo
  -> VendorReadinessService.evaluate(vendorId)
  -> readiness snapshot + audit event
  -> StateMachineService.transition(...)
  -> vendor ACTIVE / daftar kekurangan
```

Lifecycle tetap menggunakan enum dan aturan transisi yang ada. Implementasi demo menambahkan policy otomatis di atas state machine, bukan jalan pintas untuk mengubah status.

## Readiness policy demo

Vendor dinyatakan siap bila seluruh syarat berikut terpenuhi:

1. Profil vendor berisi telepon dan alamat lengkap.
2. Satu lokasi SPPG aktif tersedia.
3. Bukti/dokumen minimum terunggah dan valid secara metadata.
4. Minimal satu anggota tim dengan peran `kepala_dapur` telah menerima undangan.
5. Simulasi operasional selesai.
6. Minimal satu supplier terverifikasi telah tersambung.
7. Inspeksi demo berstatus lulus, atau sebuah fixture/demo evidence eksplisit tersedia.

Jika satu syarat belum terpenuhi, API mengembalikan `ready: false` bersama daftar kode dan pesan yang dapat ditampilkan UI. Ketika semua syarat terpenuhi, service menjalankan transisi legal yang tersisa menuju `ACTIVE`; setiap transisi dicatat dengan actor sistem dan correlation ID.

## Onboarding

Onboarding memiliki satu state endpoint yang mengembalikan progress, readiness snapshot, dan langkah berikutnya. Setiap aksi step bersifat idempotent:

- profil/lokasi: upsert evidence profil;
- bukti: upload aman dan simpan object key/metadatanya;
- tim: invite, resend, revoke, dan accept tanpa membuat user duplikat;
- simulasi: completion evidence;
- supplier: koneksi vendor-supplier persisten;
- complete: hanya memicu `evaluate`, bukan memaksa `ACTIVE`.

Vendor hanya dapat membaca dan mengubah evidence miliknya sendiri.

## Admin management

Console admin menampilkan daftar vendor dengan filter lifecycle/readiness/wilayah dan detail vendor dengan timeline lifecycle, evidence, serta anggota tim. Aksi admin:

- suspend dengan alasan wajib;
- resume untuk kembali ke `ACTIVE` bila readiness masih terpenuhi;
- request revision dengan daftar kekurangan;
- resend/revoke undangan dan nonaktifkan/aktifkan staf vendor;
- mengelola role, permission, dan menu yang sudah ada dengan perlindungan role inti.

Admin tidak dapat menghapus role inti atau mengescalate dirinya sendiri. Aksi override dan perubahan staf selalu menulis audit append-only.

## API dan error contract

- Endpoint vendor memakai `JwtAuthGuard` dan ownership check.
- Endpoint admin memakai guard role yang membaca `role.name` atau `roleLegacy` konsisten.
- Input memakai DTO/class-validator; error bisnis memakai `400`, `403`, `404`, atau `409` sesuai kondisi.
- Aksi mutasi replayable menerima `Idempotency-Key`.
- Respons readiness berbentuk `{ ready, missingRequirements, nextAction, lifecycleStatus }`.

## Testing dan definition of done

- Unit: semua syarat readiness, transisi ilegal, serta role inti terproteksi.
- API: owner vs non-owner, admin vs non-admin, invite replay, suspend/resume/revision.
- E2E: register vendor -> isi semua evidence -> aktif otomatis -> admin suspend -> resume; dan jalur evidence kurang tidak dapat aktif.
- RAG tidak disentuh oleh perubahan ini.
