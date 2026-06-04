# Database Seeders

Seeder untuk populate database dengan user-user berdasarkan role yang ada di sistem Nutrio.

Menggunakan **typeorm-extension** untuk CLI yang lebih mirip Sequelize.

## 📋 Daftar User yang Di-seed

### Admin BGN (Superuser)
| Email | Password | Role |
|-------|----------|------|
| `admin@bgn.go.id` | `Admin123!` | Administrator BGN Pusat |

### Vendor (Mitra SPPG)
| Email | Password | Role | Status |
|-------|----------|------|--------|
| `vendor@sppg.go.id` | `Vendor123!` | Mitra SPPG Jakarta | `ACTIVE` — 30-day history, CP1-4, deliveries, POs |
| `vendor2@sppg.go.id` | `Vendor123!` | Mitra SPPG Bandung | `INSPECTION_SCHEDULED` — mid-onboarding |
| `vendor3@sppg.go.id` | `Vendor123!` | Mitra SPPG Surabaya | `PREPARING_DOCS` |
| `vendor4@sppg.go.id` | `Vendor123!` | Mitra SPPG Medan | `UNDER_REVIEW` |
| `vendor5@sppg.go.id` | `Vendor123!` | Mitra SPPG Yogyakarta | `ONBOARDING` |

### Inspector (Pengawas)
| Email | Password | Role |
|-------|----------|------|
| `inspector@bgn.go.id` | `Inspector123!` | Pengawas BGN Wilayah 1 |
| `inspector2@bgn.go.id` | `Inspector123!` | Pengawas BGN Wilayah 2 |

### Coordinator SPPG
| Email | Password | Role |
|-------|----------|------|
| `coordinator@sppg.go.id` | `Coordinator123!` | Koordinator SPPG Nasional |
| `coordinator2@sppg.go.id` | `Coordinator123!` | Koordinator SPPG Provinsi |

### Dinkes (Dinas Kesehatan)
| Email | Password | Role |
|-------|----------|------|
| `dinkes@kesehatan.go.id` | `Dinkes123!` | Dinas Kesehatan Kota Jakarta |
| `dinkes2@kesehatan.go.id` | `Dinkes123!` | Dinas Kesehatan Kota Bandung |

### Public (Sekolah / Umum)
| Email | Password | Role |
|-------|----------|------|
| `school@sdn01.sch.id` | `School123!` | SDN 01 Jakarta Pusat |
| `school2@sdn02.sch.id` | `School123!` | SDN 02 Bandung |
| `parent@family.com` | `Parent123!` | Wali Murid Ahmad |

## 🚀 Cara Menggunakan

### Via CLI (Command Line)

```bash
# Masuk ke folder api
cd apps/api

# Jalankan seeders (menambahkan user baru jika belum ada)
npm run seed

# Atau
npm run db:seed

# Generate seeder baru
npm run seed:generate -- product-seeder
```

### Output yang Diharapkan

```
🌱 Starting user seeding...
✅ Created user: admin@bgn.go.id (admin_bgn)
✅ Created user: vendor@sppg.go.id (vendor)
✅ Created user: vendor2@sppg.go.id (vendor)
✅ Created user: inspector@bgn.go.id (inspector)
...
🎉 Seeding completed! Created: 12, Skipped: 0
```

## 🔐 Test Login

Setelah menjalankan seeder, Anda dapat login dengan salah satu user di atas.

**Contoh Login sebagai Admin:**
1. Buka halaman login: `http://localhost:3333/login`
2. Email: `admin@bgn.go.id`
3. Password: `Admin123!`

**Contoh Login sebagai Vendor:**
1. Buka halaman login: `http://localhost:3333/login`
2. Email: `vendor@sppg.go.id`
3. Password: `Vendor123!`

## 🛡️ Role-Based Access Control

Setiap role memiliki permissions yang berbeda-beda:

### Admin BGN
- ✅ Manage all (semua akses)

### Vendor
- ✅ View: Dashboard, Map, Funds, Menu, LiveExecution, Logistics, Checkpoints, Marketplace, Settings
- ❌ Cannot view: Audit, Reports

### Inspector
- ✅ View: Dashboard, Map, LiveExecution, Logistics, Checkpoints, Audit, Reports
- ❌ Cannot view: Funds, Menu, Marketplace

### Coordinator SPPG
- ✅ View: Dashboard, Map, LiveExecution, Logistics, Checkpoints, Audit, Reports, Settings
- ❌ Cannot view: Funds, Menu, Marketplace

### Dinkes
- ✅ View: Dashboard, Map, LiveExecution, Audit, Reports
- ❌ Cannot view: Funds, Menu, Marketplace

### Public (Sekolah/Parent)
- ✅ View: Dashboard, Map, LiveExecution
- ❌ Cannot view: Funds, Menu, Marketplace, Audit, Reports

## ⚠️ Catatan Penting

- Seeder **tidak akan** menghapus user yang sudah ada (skip jika email sudah terdaftar)
- Password di-hash menggunakan bcrypt sebelum disimpan ke database
- Semua user yang di-seed memiliki `isEmailVerified: true` untuk memudahkan testing
- Seeders menggunakan **typeorm-extension** untuk CLI yang lebih baik

## 📝 Menambahkan User Baru

Untuk menambahkan user baru ke seeder, edit file `src/database/seeds/user.seed.ts` dan tambahkan entry baru ke array `users`:

```typescript
{
  email: 'user@example.com',
  password: 'Password123!',
  fullName: 'Nama Lengkap',
  role: UserRole.VENDOR, // atau role lainnya
  phone: '+62-812-3456-7890',
  isActive: true,
},
```

## 🧩 Membuat Seeder Baru

Untuk membuat seeder baru (misalnya untuk data master):

```bash
npm run seed:generate -- product-seeder
```

Ini akan membuat file baru di `src/database/seeds/product-seeder.seed.ts`.

## 📦 Struktur File

```
apps/api/
├── src/
│   └── database/
│       └── seeds/
│           └── user.seed.ts          # Seeder untuk users
├── src/config/
│   └── data-source.ts                 # TypeORM DataSource config
└── package.json                       # Scripts: seed, seed:generate
```
