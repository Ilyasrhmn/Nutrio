# Vendor Readiness E2E

Jalankan terhadap database Docker disposable:

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5433/Nutrio_e2e_clean'
pnpm --filter api db:migrate
$env:TEST_DATABASE_URL='postgresql://postgres:postgres@localhost:5433/Nutrio_e2e_clean'
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
pnpm --filter api test:e2e -- vendor-readiness.e2e-spec.ts
```

Suite mencakup readiness yang gagal ketika dokumen belum ada, auto-activation setelah evidence lengkap, pembatasan admin endpoint untuk vendor biasa, serta suspend/resume oleh admin.
