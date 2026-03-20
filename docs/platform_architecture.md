# Platform Architecture — Web vs PWA Distribution

## System Overview

```mermaid
graph TB
    subgraph CLIENTS["📱 Client Apps"]
        direction LR
        WEB_PUB["🌐 Web Public<br/><small>Landing + Transparency</small>"]
        WEB_PORTAL["💻 Web Portal<br/><small>Vendor + Supplier + Admin</small>"]
        PWA_PORTAL["📱 PWA Portal<br/><small>Sekolah + Supplier Field</small>"]
        PWA_PUB["📱 PWA Public<br/><small>Warga / Orangtua</small>"]
    end

    subgraph API["⚙️ Shared Backend (NestJS)"]
        AUTH["Auth Module"]
        RBAC["Access Control"]
        SUP["Suppliers Module"]
        PO["Purchase Orders"]
        CP["Checkpoints Module"]
        AI["AI/RAG Module"]
    end

    subgraph DATA["🗄️ Data Layer"]
        PG[(PostgreSQL)]
        S3["S3 / MinIO<br/>(Photos)"]
        REDIS["Redis<br/>(Cache)"]
    end

    WEB_PUB --> API
    WEB_PORTAL --> API
    PWA_PORTAL --> API
    PWA_PUB --> API
    API --> PG & S3 & REDIS
```

---

## Page-to-Platform Mapping

### 🌐 Web Public — `apps/web` (unauthenticated routes)

> **Audience:** Siapa saja, tanpa login
> **Tech:** Next.js SSR/SSG untuk SEO
> **Device:** Desktop-first, responsive

| Page | Route | Fungsi |
|------|-------|--------|
| Landing | `/` | Homepage, fitur, CTA |
| Login | `/login` | Auth entry |
| Register Gateway | `/register` | Pilih role |
| Register Vendor | `/register/vendor` | Form registrasi vendor |
| Register Supplier | `/register/supplier` | Form registrasi supplier |
| **Transparansi Publik** | `/transparansi` | 🆕 Dashboard dana publik (read-only) |
| **Skor Vendor Publik** | `/transparansi/vendors` | 🆕 Scoreboard kepatuhan vendor |

---

### 💻 Web Portal — `apps/web` (authenticated `/portal/*`)

> **Audience:** Vendor, Supplier, Admin — di kantor/dapur (desktop)
> **Tech:** Next.js CSR with auth guards
> **Device:** Desktop-first, beberapa responsive

| Page | Route | Role | Loop Step |
|------|-------|------|-----------|
| Dashboard | `/portal` | All | — |
| Jadwal Mingguan | `/portal/operasional/jadwal` | Vendor | PLAN |
| Menu & Nutrisi | `/portal/menu` | Vendor | PLAN |
| Kalkulasi Bahan | `/portal/operasional/kalkulasi-bahan` | Vendor | SOURCE |
| Marketplace | `/portal/marketplace` | Vendor | SOURCE |
| Supplier Detail | `/portal/marketplace/[id]` | Vendor | SOURCE |
| Supplier Shop | `/portal/supplier/shop` | Supplier | — |
| Supplier Products | `/portal/supplier/products` | Supplier | — |
| Add Product | `/portal/supplier/products/add` | Supplier | — |
| Supplier Chat | `/portal/supplier/chat` | Supplier | — |
| Fund Tracking | `/portal/funds` | Admin | PAY |
| Reports & AI | `/portal/reports` | Admin | — |
| Audit Trail | `/portal/audit` | Admin | — |
| Map Distribution | `/portal/map` | Admin | — |
| Logistics | `/portal/logistics` | Admin | DELIVER |
| Admin RBAC | `/portal/admin/*` | Admin | — |
| Settings | `/portal/settings` | All | — |
| SOP Guide | `/portal/sop` | All | — |

---

### 📱 PWA Portal — `apps/pwa` (authenticated, mobile-first)

> **Audience:** Vendor (di lapangan), Supplier (gudang), Sekolah
> **Tech:** Next.js PWA atau standalone (Vite + PWA plugin)
> **Device:** Mobile-first, offline-capable, camera access

| Page | Route | Role | Loop Step | Why PWA? |
|------|-------|------|-----------|----------|
| **Live Checkpoint** | `/live` | Vendor | COOK & CHECK | 📸 Camera wajib, di dapur |
| **Photo Upload** | `/live/photo` | Vendor | COOK & CHECK | 📸 Upload langsung dari HP |
| **Incidents** | `/incidents` | Vendor | COOK & CHECK | 📸 Foto bukti insiden |
| **Daily Score** | `/checkpoints` | Vendor | SCORE | 📊 Cek skor cepat di HP |
| **School Confirm** | `/school/confirm` | Sekolah | DELIVER | 🆕 QR scan + receipt |
| **School Dashboard** | `/school` | Sekolah | — | 🆕 Lihat jadwal kirim |
| **School Nutrition** | `/school/nutrition` | Sekolah | — | 🆕 Info gizi menu hari ini |
| **Supplier Orders** | `/orders` | Supplier | SOURCE | 📦 Manage PO di gudang |
| **Supplier Delivery** | `/orders/[id]/deliver` | Supplier | DELIVER | 📸 Foto bukti kirim |
| **Quick Chat** | `/chat` | All | — | 💬 Chat di lapangan |

> [!IMPORTANT]
> PWA Portal menangani semua fitur yang **butuh kamera, GPS, atau akses cepat di lapangan**. Halaman yang sama (Live Checkpoint, Incidents) ada di Web Portal juga, tapi pengalaman utamanya di PWA.

---

### 📱 PWA Public — `apps/pwa` (unauthenticated, mobile-first)

> **Audience:** Warga, orangtua murid, jurnalis
> **Tech:** Same PWA shell, public routes
> **Device:** Mobile-first, shareable via link

| Page | Route | Fungsi |
|------|-------|--------|
| **Cek Sekolah** | `/public/school/[id]` | 🆕 Orangtua cek menu & jadwal di sekolah anaknya |
| **Skor Vendor** | `/public/vendor/[id]` | 🆕 Lihat skor kepatuhan vendor |
| **Lapor Masalah** | `/public/report` | 🆕 Warga lapor jika makanan tidak sampai |
| **Dashboard Publik** | `/public` | 🆕 Statistik nasional MBG |

---

## Arsitektur Lengkap

```mermaid
graph LR
    subgraph MONOREPO["📁 Monorepo"]
        subgraph APPS["apps/"]
            WEB["apps/web<br/>Next.js<br/><small>Web Public + Web Portal</small>"]
            PWA["apps/pwa<br/>Next.js PWA / Vite<br/><small>PWA Portal + PWA Public</small>"]
            API["apps/api<br/>NestJS<br/><small>Shared Backend</small>"]
        end
        subgraph PACKAGES["packages/"]
            UI["packages/ui<br/><small>Shared Components</small>"]
            COMMON["packages/common<br/><small>Types, Utils, Constants</small>"]
            MODULES["packages/modules<br/><small>Shared Feature Modules</small>"]
        end
    end

    WEB --> UI & COMMON & MODULES
    PWA --> UI & COMMON & MODULES
    WEB & PWA -->|REST API| API
```

---

## Shared vs Platform-Specific

| Komponen | Web Portal | PWA Portal | Shared? |
|----------|-----------|------------|---------|
| `packages/ui` (Button, Card, dll) | ✅ | ✅ | ✅ Shared |
| `packages/common` (types, utils) | ✅ | ✅ | ✅ Shared |
| Auth hooks (`useAuth`, `usePermission`) | ✅ | ✅ | ✅ Bisa di `packages/` |
| Sidebar navigation | ✅ | ❌ | ❌ Web only (PWA pakai bottom nav) |
| Camera/Photo component | ⚠️ Basic | ✅ Full | ❌ PWA-optimized |
| Offline support | ❌ | ✅ | ❌ PWA only |
| QR Scanner | ❌ | ✅ | ❌ PWA only |
| Dashboard charts | ✅ Full | ✅ Summary | ⚠️ Shared chart lib, different layout |
| Admin RBAC pages | ✅ | ❌ | ❌ Web only |

---

## Keputusan Arsitektur

| Opsi | Kelebihan | Kekurangan | Rekomendasi |
|------|-----------|------------|-------------|
| **A) 1 Next.js app, PWA enabled** | Simple, shared routing | PWA overhead di semua page | ❌ |
| **B) 2 apps: `apps/web` + `apps/pwa`** | Optimal bundle per platform | Sedikit duplikasi routing | ✅ **Recommended** |
| **C) 3 apps: web + pwa-portal + pwa-public** | Maximum separation | Terlalu banyak apps | ❌ Overkill |

> [!TIP]
> **Rekomendasi: Opsi B** — `apps/web` handle Web Public + Web Portal;  `apps/pwa` handle PWA Portal + PWA Public. Shared melalui `packages/ui` dan `packages/common`. Backend tetap satu `apps/api`.
