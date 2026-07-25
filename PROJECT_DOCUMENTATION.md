# 📋 NUTRIO — Dokumentasi Proyek Lengkap

> **Platform Perizinan dan Pengawasan Vendor Makan Bergizi Gratis (MBG) Indonesia**  
> Versi Dokumentasi: Juni 2026  
> Hackathon BI x OJK (FEKDI)

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Arsitektur Proyek](#2-arsitektur-proyek)
3. [Teknologi Stack](#3-teknologi-stack)
4. [Struktur Monorepo](#4-struktur-monorepo)
5. [Backend API (apps/api)](#5-backend-api-appsapi)
6. [Web Portal (apps/web)](#6-web-portal-appsweb)
7. [Progressive Web App (apps/pwa)](#7-progressive-web-app-appspwa)
8. [Shared Packages](#8-shared-packages)
9. [Database Schema](#9-database-schema)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Business Logic & Workflow](#11-business-logic--workflow)
12. [AI/ML Integration](#12-aiml-integration)
13. [Real-time Features](#13-real-time-features)
14. [File Storage](#14-file-storage)
15. [OpenSpec Workflow](#15-openspec-workflow)
16. [Testing](#16-testing)
17. [Deployment](#17-deployment)
18. [Environment Variables](#18-environment-variables)
19. [Perintah CLI](#19-perintah-cli)
20. [API Reference Lengkap](#20-api-reference-lengkap)

---

## 1. Ringkasan Eksekutif

### 1.1 Tentang Proyek

**Nutrio** adalah platform digital komprehensif untuk perizinan, pengawasan, dan transparansi program **Makan Bergizi Gratis (MBG)** Indonesia. Platform ini dibangun untuk:

- **Vendor SPPG**: Mengelola operasional harian (checkpoint foto, menu, scoring)
- **Supplier**: Marketplace bahan makanan dengan sistem Purchase Order
- **Sekolah**: Konfirmasi penerimaan makanan via QR code
- **Admin BGN**: Command center monitoring, risk assessment, manajemen dana
- **Publik**: Dashboard transparansi akuntabilitas program

### 1.2 Masalah yang Diselesaikan

| Masalah | Solusi Nutrio |
|---------|---------------|
| 1.030+ SPPG ditutup karena gagal standar sanitasi | Perizinan digital + validasi otomatis dokumen |
| Keracunan makanan berulang (lele mentah, makanan basi) | AI checkpoint photo validation |
| SOP belum memadai untuk verifikasi | Digitalisasi SOP + automated scoring |
| Budget Rp71T tanpa transparansi | Blockchain audit trail |
| Hanya 6.2% target SPPG beroperasi | Dashboard real-time + percepatan onboarding |
| UMKM lokal sulit masuk | Marketplace fair dengan verifikasi UMKM |

### 1.3 Unique Value Proposition

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NUTRIO VALUE PROPOSITION                        │
├─────────────────────────────────────────────────────────────────────┤
│ 🤖 AI-Powered        → Photo validation, nutrition compliance      │
│ ⛓️ Blockchain Trust  → Immutable audit trail, smart contract escrow│
│ 📱 Multi-Platform    → Web Portal + PWA (offline-capable)          │
│ 👥 Multi-Role        → Vendor, Supplier, Sekolah, Admin, Publik    │
│ 🔄 Full Lifecycle    → Registrasi → Operasional → Pembayaran       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arsitektur Proyek

### 2.1 High-Level Architecture

```
                           ┌─────────────────────────────────┐
                           │         LOAD BALANCER           │
                           └────────────────┬────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
┌───────────────┐                 ┌───────────────┐                 ┌───────────────┐
│   apps/web    │                 │   apps/pwa    │                 │   apps/api    │
│   Next.js 16  │                 │   Next.js 16  │                 │   NestJS 11   │
│   Port 3000   │                 │   Port 3002   │                 │   Port 3333   │
│               │                 │   (PWA)       │                 │               │
│ • Web Portal  │                 │ • Field Ops   │                 │ • REST API    │
│ • Landing     │                 │ • QR Scan     │                 │ • WebSocket   │
│ • Admin       │                 │ • Camera      │                 │ • Cron Jobs   │
└───────┬───────┘                 └───────┬───────┘                 └───────┬───────┘
        │                                 │                                 │
        └─────────────────────────────────┴─────────────────────────────────┘
                                          │
                           ┌──────────────┴──────────────┐
                           │                             │
                           ▼                             ▼
              ┌─────────────────────┐       ┌─────────────────────┐
              │   PostgreSQL 16     │       │      Redis 7        │
              │   + PostGIS         │       │    (Cache)          │
              └─────────────────────┘       └─────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐
    │   MinIO/S3      │       │   Anthropic AI  │
    │   (Storage)     │       │   (Claude API)  │
    └─────────────────┘       └─────────────────┘
```

### 2.2 Platform Distribution Strategy

```mermaid
graph TB
    subgraph CLIENTS["📱 Client Apps"]
        direction LR
        WEB_PUB["🌐 Web Public<br/>Landing + Transparansi"]
        WEB_PORTAL["💻 Web Portal<br/>Vendor + Supplier + Admin"]
        PWA_PORTAL["📱 PWA Portal<br/>Sekolah + Operasional"]
        PWA_PUB["📱 PWA Public<br/>Warga / Orangtua"]
    end

    subgraph API["⚙️ Shared Backend (NestJS)"]
        AUTH["Auth Module"]
        RBAC["Access Control"]
        SUP["Suppliers Module"]
        CP["Checkpoints Module"]
        AI["AI/RAG Module"]
    end

    WEB_PUB --> API
    WEB_PORTAL --> API
    PWA_PORTAL --> API
    PWA_PUB --> API
```

---

## 3. Teknologi Stack

### 3.1 Core Technologies

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Monorepo** | Turborepo + pnpm | 2.8+ / 10.4.1 | Build orchestration, workspace management |
| **Language** | TypeScript | 6.0+ | Type-safe development |
| **Backend** | NestJS | 11.x | REST API, WebSocket, DI framework |
| **Frontend** | Next.js | 16.x | React framework, App Router |
| **Database** | PostgreSQL + PostGIS | 16.x | Primary data store + geospatial |
| **ORM** | TypeORM | 0.3.x | Database abstraction |
| **Cache** | Redis | 7.x | Session cache, rate limiting |
| **Storage** | MinIO / S3 | - | File uploads, photos |
| **AI** | Anthropic Claude | - | Vision AI, RAG, text generation |
| **Real-time** | Socket.IO | 4.x | WebSocket connections |

### 3.2 Frontend Stack

| Teknologi | Fungsi |
|-----------|--------|
| **React 19** | UI library |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui + Radix** | Accessible component library |
| **React Hook Form + Zod** | Form management + validation |
| **CASL** | Client-side ability checks |
| **Axios** | HTTP client with interceptors |
| **Leaflet** | Map visualization |
| **ApexCharts** | Dashboard charts |
| **Socket.IO Client** | Real-time updates |
| **react-webcam** | Camera capture (PWA) |
| **html5-qrcode** | QR scanner (PWA) |
| **GSAP** | Animations |
| **Lenis** | Smooth scrolling |

### 3.3 Backend Stack

| Teknologi | Fungsi |
|-----------|--------|
| **NestJS 11** | Application framework |
| **Passport + JWT** | Authentication |
| **CASL** | Authorization (ability-based) |
| **TypeORM** | ORM + migrations |
| **class-validator** | DTO validation |
| **bcrypt** | Password hashing |
| **Socket.IO** | WebSocket server |
| **@nestjs/schedule** | Cron jobs |
| **@aws-sdk/client-s3** | S3 operations |
| **@anthropic-ai/sdk** | AI integration |

---

## 4. Struktur Monorepo

```
Nutrio/
├── apps/
│   ├── api/                    # NestJS Backend (Port 3333)
│   ├── web/                    # Next.js Web Portal (Port 3000)
│   └── pwa/                    # Next.js PWA (Port 3002)
├── packages/
│   ├── common/                 # Shared types, enums, utils
│   ├── ui/                     # shadcn/ui components
│   ├── modules/                # Shared page modules (landing)
│   ├── eslint-config/          # Shared ESLint configs
│   └── typescript-config/      # Shared TS configs
├── openspec/                   # Spec-driven development
│   ├── changes/                # Active change proposals
│   ├── specs/                  # Current specifications
│   └── config.yaml
├── docs/                       # Project documentation
├── docker-compose.yml          # Local development services
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # Workspace definition
└── package.json                # Root package
```

### 4.1 Turbo Tasks

| Task | Deskripsi | Command |
|------|-----------|---------|
| `build` | Build all packages | `pnpm build` |
| `dev` | Run development servers | `pnpm dev` |
| `lint` | Lint all packages | `pnpm lint` |
| `typecheck` | TypeScript check | `pnpm typecheck` |
| `test` | Run tests | `pnpm test` |
| `format` | Prettier format | `pnpm format` |
| `db:migrate` | Run migrations | `pnpm db:migrate` |
| `db:seed` | Seed database | `pnpm db:seed` |

---

## 5. Backend API (apps/api)

### 5.1 Module Overview

Backend terdiri dari 24+ modul NestJS yang terorganisir berdasarkan domain:

```
apps/api/src/modules/
├── access-control/       # RBAC: roles, permissions, menus
├── ai/                   # LLM integration (Anthropic Claude)
├── auth/                 # JWT authentication, refresh tokens
├── cache/                # Redis cache management
├── checkpoints/          # CP1-CP4 foto workflow
├── command-center/       # Admin monitoring dashboard
├── debrief/              # Daily AI-generated summaries
├── delivery/             # Delivery token lifecycle
├── eligibility/          # Pre-registration wizard
├── funds/                # Fund tracking & disbursement
├── health/               # Health check endpoints
├── mission-control/      # Vendor daily dashboard
├── notifications/        # Multi-channel notifications
├── onboarding/           # 5-step vendor onboarding
├── public/               # Public transparency endpoints
├── rag/                  # RAG-based SOP assistant
├── realtime/             # WebSocket gateway
├── scheduler/            # Cron jobs
├── school-confirm/       # QR-based school confirmation
├── scoring/              # Daily scoring & penalties
├── storage/              # S3 file uploads
├── suppliers/            # Supplier marketplace
├── users/                # User management
└── vendors/              # Vendor lifecycle management
```

### 5.2 Module Details

#### 5.2.1 AUTH Module

**Entities:**
- `RefreshToken`: Token hash, expiration, revocation, IP tracking

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| POST | `/auth/register` | Registrasi user baru |
| POST | `/auth/login` | Login, return JWT |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user info |

**DTOs:**
- `LoginDto`: email, password
- `RegisterDto`: email, password, fullName, role, eligibilityToken?, businessName?, phone?
- `RefreshDto`: refreshToken

**Token Configuration:**
- Access Token: 15 menit expiry
- Refresh Token: 7 hari expiry
- Cookie-based storage

#### 5.2.2 ACCESS-CONTROL Module

**Entities:**
- `Role`: name, description, permissions[]
- `Permission`: action (CASL), subject (CASL), description
- `RolePermission`: Junction table
- `Menu`: name, path, icon, order, parentId, requiredPermission
- `RoleMenu`: Junction table

**Endpoints (Admin only):**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/roles` | List all roles |
| POST | `/roles` | Create role |
| POST | `/roles/:id/permissions` | Add permissions |
| GET | `/menus/tree` | Get full menu tree |
| GET | `/menus/user/me` | Get user's menu |
| POST | `/menus` | Create menu item |

#### 5.2.3 VENDORS Module

**Entity: Vendor**
| Column | Type | Deskripsi |
|--------|------|-----------|
| id | UUID | Primary key |
| userId | UUID | FK to users |
| businessName | string | Nama usaha |
| ownerName | string | Nama pemilik |
| nib | string | Nomor Induk Berusaha |
| npwp | string | NPWP |
| phone, email | string | Kontak |
| addressStreet/City/Province/District/Postal | string | Alamat lengkap |
| status | enum | draft, pending_review, verified, rejected, suspended, probation |
| lifecycleStatus | enum | Status lifecycle lengkap |
| dailyCapacityPax | int | Kapasitas produksi |
| specialization | string[] | Spesialisasi makanan |
| currentRiskScore | decimal | Skor risiko (0-100) |

**Lifecycle Status Flow:**
```
ANONYMOUS → ELIGIBILITY_CHECKED → REGISTERED → PREPARING_DOCS 
→ DOCS_SUBMITTED → INSPECTION_SCHEDULED → INSPECTION_COMPLETED 
→ UNDER_REVIEW → APPROVED → ONBOARDING → ACTIVE → (SUSPENDED/REVOKED)
```

**StateMachineService:**
- Manages lifecycle transitions
- Validates allowed transitions
- Creates audit logs
- Resolves portal routes by status

#### 5.2.4 ELIGIBILITY Module

**Entity: EligibilitySession**
- sessionToken, answers (JSONB), roadmapResult (JSONB), vendorId, expiresAt

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| POST | `/eligibility/sessions` | Create session |
| PATCH | `/eligibility/sessions/:token` | Save answer |
| POST | `/eligibility/sessions/:token/generate` | Generate roadmap |
| GET | `/eligibility/sessions/:token` | Get session |

**PersonalRoadmap Output:**
- `docsHave[]`: Documents already owned
- `docsInProgress[]`: Documents being processed  
- `docsMissing[]`: Documents needed (with estimated days/cost)
- `flags[]`: Warnings/info messages
- `eligibilityScore`: 0-100 readiness score
- `recommendedNextStep`: Action guidance

#### 5.2.5 ONBOARDING Module

**Entities:**
- `OnboardingProgress`: step1Done-step5Done flags, completedAt
- `VendorTeamMember`: role, inviteToken, status (pending/accepted)

**5 Steps:**
1. Complete profile (phone, address, logo)
2. Invite team members (kepala_dapur, staf_masak, admin)
3. Complete simulation training
4. Connect to supplier
5. Finalize and activate

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/onboarding/state` | Get progress |
| POST | `/onboarding/step1/profile` | Complete profile |
| POST | `/onboarding/step2/team/invite` | Invite member |
| POST | `/onboarding/step2/team/accept/:token` | Accept invite |
| POST | `/onboarding/step3/simulation/complete` | Complete simulation |
| POST | `/onboarding/step4/supplier/connect` | Connect supplier |
| POST | `/onboarding/complete` | Finalize |

#### 5.2.6 CHECKPOINTS Module

**Entities:**
- `CheckpointEvent`: vendorId, cpType (CP1-4), cpStatus, photos[], aiValidation, scoreDelta
- `DeliveryToken`: token, vendorId, schoolId, porsiCount, expiredAt, status

**4 Checkpoint Types:**
| CP | Label | Instruksi |
|-----|-------|-----------|
| CP1 | Bahan Mentah | Foto semua bahan yang diterima hari ini |
| CP2 | Proses Masak | Foto kondisi dapur dan proses memasak |
| CP3 | Makanan Siap | Foto makanan yang siap dikemas |
| CP4 | Serah Terima | Foto saat menyerahkan makanan ke sekolah |

**Golden Rule:** CP2 harus ≤4 jam setelah CP1

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/checkpoints/today` | Get today's state |
| POST | `/checkpoints/:cpType/submit` | Submit checkpoint with photo |

#### 5.2.7 SCORING Module

**Entities:**
- `DailyScoreRecord`: vendorId, scoreDate, scoreCurrent (starts at 100), scoreFinal
- `ScoreEvent`: eventType, scoreDelta, reason, regulationRef

**Penalty Types:**
| Type | Delta | Deskripsi |
|------|-------|-----------|
| GOLDEN_RULE_VIOLATION | -20 | CP2 >4hrs setelah CP1 |
| AI_VALIDATION_FAIL_3X | -5 | 3x gagal AI berturut |
| FORCE_CLOSED_NO_CP | -50 | Tidak ada checkpoint s/d 14:00 |
| SCHOOL_COMPLAINT | -10 | Keluhan dari sekolah |
| CP_LATE_START | -5 | CP1 setelah 10:00 |
| DELIVERY_LATE | -15 | Token expired unused |
| PHOTO_QUALITY_POOR | -3 | AI confidence rendah |

**Disbursement Estimate:** `targetPorsi × Rp30.000 × (score/100)`

#### 5.2.8 DELIVERY Module

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/delivery/my/week-schedule` | Get weekly schedule |
| GET | `/delivery/:token` | Get delivery info |
| POST | `/delivery/:token/arrived` | Record arrival |
| POST | `/delivery/:token/photo` | Upload photo |
| GET | `/delivery/:token/qr-payload` | Get QR data |
| POST | `/delivery/:token/complete` | Complete delivery |

#### 5.2.9 SCHOOL-CONFIRM Module

**Entity: SchoolConfirmation**
- deliveryTokenId, jumlahDiterima, kondisi (baik/ada_masalah), masalahJenis[], catatan

**Endpoints (Public):**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/sekolah/confirm/:qrToken` | Get delivery info |
| POST | `/sekolah/confirm/:qrToken` | Submit confirmation |

**Logic:**
- Schools scan QR to confirm
- `kondisi: ada_masalah` → triggers penalty + alert
- Creates audit trail

#### 5.2.10 DEBRIEF Module

**Entity: DailyDebrief**
- vendorId, debriefDate, narrativeGood, narrativeImprove, recommendations[], fundEstimate, dataHash

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/debrief/:date` | Get/generate debrief |
| GET | `/public/verify/:dataHash` | Verify integrity |

**AI-Generated Content:**
- `narrativeGood`: Positive highlights
- `narrativeImprove`: Areas for improvement
- `recommendations[]`: Action items
- SHA256 hash for verification

#### 5.2.11 MISSION-CONTROL Module

**Endpoint:** `GET /mission-control/today`

**Returns comprehensive dashboard:**
- Target porsi, school list, menu
- Checkpoint matrix (CP1-4 status per school)
- Score + events + streak
- Disbursement estimate
- Unread alerts
- Team presence (real-time)

#### 5.2.12 COMMAND-CENTER Module (Admin)

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/command-center/overview` | System stats |
| GET | `/command-center/vendors` | All active vendors |
| GET | `/command-center/alerts` | Alerts with pagination |
| PATCH | `/command-center/alerts/:id/read` | Mark alert read |
| GET | `/command-center/deliveries` | Deliveries by date |
| GET | `/command-center/reports` | Compliance reports |
| GET | `/command-center/sppg/:vendorId` | Detailed SPPG info |

#### 5.2.13 FUNDS Module

**Endpoint:** `GET /funds/summary`

**Returns:**
- `totalAlokasi`: APBN budget
- `totalTersalurkan`: Total disbursed
- `sisaAnggaran`: Remaining
- `realisasiPct`: Percentage
- 30-day trend data

#### 5.2.14 SUPPLIERS Module

**Entities:**
- `Supplier`: businessName, supplierType, certifications, status, ratings
- `SupplierProduct`: name, category, price, stock, ratings
- `PurchaseOrder`: poNumber, items, status, delivery info, payment

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/suppliers` | List with filters |
| GET | `/suppliers/:id` | Detail + products + reviews |
| GET | `/suppliers/me/profile` | Own profile |
| PATCH | `/suppliers/me/profile` | Update profile |
| GET/POST/PATCH/DELETE | `/suppliers/me/products` | Product CRUD |

#### 5.2.15 AI Module

**LlmService:**
- Uses Anthropic Claude API
- Configurable provider (anthropic/openai/gemini)
- Mock mode for development (`AI_MOCK=true`)
- Response caching via CacheService

**VisionService:**
- Photo validation for checkpoints
- Returns: pass/fail, reason, confidence
- Mock responses for testing

#### 5.2.16 RAG Module

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| POST | `/rag/query` | Ask question |
| POST | `/rag/proactive` | Get contextual tips |
| POST | `/rag/admin/ingest` | Ingest documents |

**Logic:**
- Document chunking and storage
- Keyword-based retrieval
- LLM answer generation with source citations

#### 5.2.17 STORAGE Module

**Endpoint:** `POST /storage/upload`

**Features:**
- S3-compatible storage (MinIO for local)
- 10MB file limit
- Returns: fileKey, fileUrl, fileHash (SHA256)
- Signed URLs for private access

#### 5.2.18 NOTIFICATIONS Module

**Entity: Notification**
- userId, alertId, channel (in_app/email/whatsapp/sms), status, content

**Endpoints:**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/notifications/me` | List notifications |
| POST | `/notifications/:id/read` | Mark as read |

**Channels:**
- In-app via WebSocket
- Email via Resend
- Retry tracking

#### 5.2.19 REALTIME Module (WebSocket)

**Namespaces:**
- `/ops`: Vendor/staff operations
- `/bgn`: BGN admin dashboard

**Features:**
- JWT authentication on connect
- Room-based broadcasting (`vendor:{id}`, `bgn:all`)
- Presence tracking (online status)

**Events:**
- `mc:checkpoint:update`
- `score:update`
- `alert:new`
- `delivery:confirmed`
- `notification:new`

#### 5.2.20 SCHEDULER Module (Cron)

| Job | Schedule | Deskripsi |
|-----|----------|-----------|
| score-init | 00:01 daily | Initialize daily score records |
| force-close | 14:00 daily | Force-close pending checkpoints |
| review-sla | 09:00 daily | Check SLA on pending reviews |

#### 5.2.21 PUBLIC Module

**Endpoints (No auth):**
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/public/overview` | Public statistics |
| GET | `/public/sppg/search` | Search SPPG locations |
| GET | `/public/sppg/:id` | SPPG public profile |
| GET | `/public/audit-trail/:vendorId` | Vendor audit trail |

---

## 6. Web Portal (apps/web)

### 6.1 Route Structure

```
apps/web/app/
├── layout.tsx                  # Root layout
├── page.tsx                    # Landing page
├── login/                      # Authentication
├── register/                   # Registration
├── eligibility/               # Eligibility wizard
├── publik/                     # Public dashboard
├── sekolah/                    # School pages
├── delivery/                   # Delivery tracking
├── api-proxy/                  # Next.js API proxy
└── portal/                     # Authenticated portal
    ├── layout.tsx              # Portal layout with sidebar
    ├── page.tsx                # Dashboard redirect
    ├── (admin)/                # Admin route group
    │   ├── admin/              # Admin management
    │   ├── audit/              # Audit trail
    │   ├── command-center/     # Command center
    │   ├── funds/              # Fund tracking
    │   ├── logistics/          # Logistics
    │   ├── map/                # Distribution map
    │   └── reports/            # Reports
    ├── (vendor)/               # Vendor route group
    │   ├── checkpoints/        # Checkpoint history
    │   ├── debrief/            # Daily debrief
    │   ├── incidents/          # Incident reports
    │   ├── live/               # Live checkpoint
    │   ├── marketplace/        # Supplier marketplace
    │   ├── menu/               # Menu management
    │   ├── mission-control/    # Daily dashboard
    │   ├── onboarding/         # Onboarding steps
    │   └── operasional/        # Operational pages
    ├── (supplier)/             # Supplier route group
    │   └── supplier/           # Supplier management
    └── (shared)/               # Shared route group
        ├── help/               # Help center
        ├── settings/           # User settings
        └── sop/                # SOP guide
```

### 6.2 Key Files

#### API Client (`lib/api-client.ts`)
- Axios instance with interceptors
- Automatic token refresh on 401
- Queue failed requests during refresh
- Cookie-based token storage
- Cross-origin proxy support

```typescript
// Usage
import { api } from '@/lib/api-client';

const data = await api.get<T>('/endpoint');
const result = await api.post<T>('/endpoint', payload);
```

#### CASL Integration (`lib/casl.ts`)
- Client-side ability definitions
- Mirrors backend CaslAbilityFactory
- Role-based permission checks

```typescript
import { defineAbilitiesFor } from '@/lib/casl';

const ability = defineAbilitiesFor(user.role);
if (ability.can('read', 'Dashboard')) {
  // Show dashboard
}
```

#### Proxy Middleware (`proxy.ts`)
- Protects `/portal/*` routes
- Redirects based on auth state
- Lifecycle-based routing for vendors

### 6.3 Components

```
apps/web/components/
├── dashboard/              # Dashboard widgets
├── map/                    # Leaflet map components
├── floating-ai-button.tsx  # RAG assistant trigger
├── notification-bell.tsx   # Notification dropdown
├── providers.tsx           # Context providers
└── rag-drawer.tsx          # RAG chat drawer
```

### 6.4 Hooks

```
apps/web/hooks/
├── use-auth.tsx           # Authentication hook
├── use-menu-context.tsx   # Menu context
└── use-user-menu.ts       # User menu fetching
```

---

## 7. Progressive Web App (apps/pwa)

### 7.1 Route Structure

```
apps/pwa/app/
├── layout.tsx              # Root layout + bottom nav
├── page.tsx                # Home dashboard
├── login/                  # Mock auth
├── cp/                     # Checkpoint pages
├── notifications/          # Notification center
├── operasional/
│   ├── live/              # Live checkpoint (CP1-4)
│   ├── score/             # Daily score
│   └── history/           # Checkpoint history
├── orders/
│   ├── page.tsx           # Supplier orders list
│   └── [id]/              # Order detail
├── sekolah/
│   ├── page.tsx           # School dashboard
│   └── confirm/           # QR scan + confirm
├── publik/                 # Public dashboard
└── settings/               # User settings
```

### 7.2 PWA Configuration

**next.config.ts:**
```typescript
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});
```

**Manifest Features:**
- Standalone display
- Portrait orientation
- Theme color: #16a34a (MBG green)
- Offline support (visited pages)
- Camera access for checkpoints
- QR scanner for school confirm

### 7.3 Components

```
apps/pwa/components/
├── checkpoint/
│   ├── camera-capture.tsx    # Camera/file upload
│   ├── step-indicator.tsx    # CP1-4 progress
│   └── ai-result-card.tsx    # AI validation result
├── layout/
│   ├── bottom-nav.tsx        # Bottom navigation
│   └── page-header.tsx       # Sticky header
├── orders/
│   └── order-card.tsx        # PO card
└── providers/
    └── ...                    # Context providers
```

### 7.4 Mock Data

```
apps/pwa/lib/mock-data/
├── vendor.ts          # Vendor mock data
├── orders.ts          # PO mock data
├── checkpoints.ts     # Checkpoint mock data
└── public-stats.ts    # Public statistics mock
```

---

## 8. Shared Packages

### 8.1 @workspace/common

**Location:** `packages/common/`

**Exports:**
```typescript
// Types
export enum UserRole {
  VENDOR = 'vendor',
  INSPECTOR = 'inspector',
  ADMIN_BGN = 'admin_bgn',
  COORDINATOR_SPPG = 'coordinator_sppg',
  DINKES = 'dinkes',
  PUBLIC = 'public',
  SUPPLIER = 'supplier',
}

// CASL Types
export type AppAction = "manage" | "create" | "read" | "update" | "delete" | "view";
export type AppSubject = "Dashboard" | "Map" | "Funds" | ... | "all";

// API Types
export interface ApiResponse<T> { ... }
export interface PaginatedResult<T> { ... }

// Eligibility Types
export interface PersonalRoadmap { ... }
export interface DocumentRequirement { ... }
```

### 8.2 @workspace/ui

**Location:** `packages/ui/`

**shadcn/ui Components:**
- accordion, alert, avatar, badge, button
- card, checkbox, confirm-modal, dialog
- dropdown-menu, input, label, popover
- progress, scroll-area, select, separator
- table, tabs, textarea, toast, toaster

**Exports Pattern:**
```typescript
// Import components
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

// Import styles
import "@workspace/ui/globals.css";

// Import utilities
import { cn } from "@workspace/ui/lib/utils";
```

**Tailwind v4 Integration:**
- Config in `packages/ui/src/styles/globals.css`
- Each Next app imports globals
- VS Code settings point to this file

### 8.3 @workspace/modules

**Location:** `packages/modules/`

**Current Modules:**
- `landing/`: Landing page components
  - Hero section
  - Features section
  - CTA with animated "NUTRIO" text
  - SplitText animation component
  - useScrollReveal hook

---

## 9. Database Schema

### 9.1 Core Tables

#### users
| Column | Type | Deskripsi |
|--------|------|-----------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique |
| password_hash | TEXT | Bcrypt hash |
| role_id | UUID | FK to roles |
| role_legacy | user_role | Legacy enum |
| full_name | VARCHAR(255) | Nama lengkap |
| phone | VARCHAR(20) | Nomor telepon |
| is_active | BOOLEAN | Status aktif |
| is_email_verified | BOOLEAN | Email terverifikasi |
| last_login_at | TIMESTAMPTZ | Login terakhir |
| oss_id | VARCHAR(100) | OSS integration |
| dukcapil_nik | VARCHAR(16) | NIK |

#### vendors
| Column | Type | Deskripsi |
|--------|------|-----------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| business_name | VARCHAR(255) | Nama usaha |
| owner_name | VARCHAR(255) | Nama pemilik |
| nib | VARCHAR(30) | Nomor Induk Berusaha |
| npwp | VARCHAR(20) | NPWP |
| phone, email | STRING | Kontak |
| address_* | STRING | Alamat lengkap |
| coordinates | GEOGRAPHY | PostGIS point |
| status | vendor_status | Status verifikasi |
| lifecycle_status | lifecycle_status | Status lifecycle |
| daily_capacity_pax | INTEGER | Kapasitas harian |
| specialization | TEXT[] | Spesialisasi |
| current_risk_score | DECIMAL | Skor risiko |
| risk_category | risk_category | Kategori risiko |
| training_status | training_status | Status training |

### 9.2 Access Control Tables

#### roles
| Column | Type |
|--------|------|
| id | UUID |
| name | VARCHAR UNIQUE |
| description | TEXT |

#### permissions
| Column | Type |
|--------|------|
| id | UUID |
| action | VARCHAR(50) |
| subject | VARCHAR(100) |
| description | TEXT |

#### role_permissions
| Column | Type |
|--------|------|
| role_id | UUID FK |
| permission_id | UUID FK |

#### menus
| Column | Type |
|--------|------|
| id | UUID |
| name | VARCHAR |
| path | VARCHAR |
| icon | VARCHAR |
| order | INTEGER |
| parent_id | UUID FK |
| required_permission | VARCHAR |
| metadata | JSONB |

### 9.3 Document & Certification Tables

#### documents
| Column | Type |
|--------|------|
| id | UUID |
| vendor_id | UUID FK |
| doc_type | document_type |
| doc_number | VARCHAR |
| file_url, file_key, file_hash | TEXT |
| status | document_status |
| issued_at, expires_at | DATE |
| bpom_verified | BOOLEAN |

### 9.4 Checkpoint & Scoring Tables

#### checkpoint_events
| Column | Type |
|--------|------|
| id | UUID |
| vendor_id | UUID FK |
| sppg_location_id | UUID FK |
| cp_type | cp_type_enum |
| cp_status | cp_status_enum |
| photos | JSONB[] |
| ai_validation | JSONB |
| score_delta | INTEGER |
| started_at, completed_at | TIMESTAMPTZ |

#### daily_score_records
| Column | Type |
|--------|------|
| id | UUID |
| vendor_id | UUID FK |
| score_date | DATE |
| score_current | INTEGER |
| score_final | INTEGER |

#### score_events
| Column | Type |
|--------|------|
| id | UUID |
| daily_score_record_id | UUID FK |
| event_type | VARCHAR |
| score_delta | INTEGER |
| reason | TEXT |
| regulation_ref | VARCHAR |

### 9.5 Supplier & PO Tables

#### suppliers
| Column | Type |
|--------|------|
| id | UUID |
| user_id | UUID FK |
| business_name | VARCHAR |
| supplier_type | supplier_type |
| certifications | BOOLEAN flags |
| status | supplier_status |
| avg_rating | DECIMAL |
| total_reviews | INTEGER |

#### supplier_products
| Column | Type |
|--------|------|
| id | UUID |
| supplier_id | UUID FK |
| name | VARCHAR |
| category | VARCHAR |
| price_per_unit | DECIMAL |
| stock_available | DECIMAL |
| status | product_status |

#### purchase_orders
| Column | Type |
|--------|------|
| id | UUID |
| po_number | VARCHAR UNIQUE |
| vendor_id, supplier_id | UUID FK |
| status | po_status |
| delivery dates | DATE |
| payment info | JSONB |

### 9.6 Enums

```sql
-- User & Vendor
CREATE TYPE user_role AS ENUM ('vendor', 'inspector', 'admin_bgn', ...);
CREATE TYPE vendor_status AS ENUM ('draft', 'pending_review', 'verified', ...);
CREATE TYPE vendor_lifecycle_status AS ENUM ('ANONYMOUS', 'ELIGIBILITY_CHECKED', ...);

-- Documents
CREATE TYPE document_type AS ENUM ('pirt', 'halal', 'bpom', 'nib', 'siup', 'npwp');
CREATE TYPE document_status AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- Risk & Scoring
CREATE TYPE risk_category AS ENUM ('safe', 'watch', 'medium', 'high_risk');
CREATE TYPE cp_type AS ENUM ('CP1', 'CP2', 'CP3', 'CP4');
CREATE TYPE cp_status AS ENUM ('pending', 'in_progress', 'done', 'failed', 'force_closed');

-- Supplier
CREATE TYPE supplier_type AS ENUM ('petani', 'distributor', 'koperasi', 'fmcg');
CREATE TYPE supplier_status AS ENUM ('draft', 'pending_review', 'verified', ...);
CREATE TYPE po_status AS ENUM ('draft', 'pending_supplier', 'confirmed', ...);

-- Notifications & Alerts
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE notification_channel AS ENUM ('whatsapp', 'email', 'in_app', 'sms');
```

---

## 10. Authentication & Authorization

### 10.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION
   POST /auth/register
   ├── Validate email unique
   ├── Hash password (bcrypt)
   ├── Create user with role
   ├── If role=vendor → create vendor record
   └── Return JWT tokens

2. LOGIN
   POST /auth/login
   ├── Find user by email
   ├── Compare password hash
   ├── Generate access token (15 min)
   ├── Generate refresh token (7 days)
   └── Store refresh token hash in DB

3. TOKEN REFRESH
   POST /auth/refresh
   ├── Validate refresh token hash
   ├── Check not revoked/expired
   ├── Revoke old token (rotation)
   ├── Generate new token pair
   └── Return new tokens

4. AUTH GUARD
   All protected endpoints
   ├── Extract JWT from Authorization header
   ├── Verify signature & expiry
   ├── Inject user into request
   └── Proceed or 401
```

### 10.2 CASL Authorization

**Two-Layer System:**

1. **CASL Ability (In-memory, hardcoded)**
   - Source of truth for UI gating
   - Backend: `apps/api/src/modules/auth/casl-ability.factory.ts`
   - Frontend: `apps/web/lib/casl.ts`
   - **Both must be kept in sync**

2. **DB-backed RBAC (roles, permissions, menus)**
   - Managed by `access-control/` module
   - Exposed via API for dynamic menu rendering
   - Sidebar calls `useUserMenu()` → menus endpoint

**Role Abilities:**

```typescript
// Admin BGN
can("manage", "all");
cannot("read", "MonitoringKepatuhan");
cannot("read", "Operasional");

// Vendor
can("read", "Dashboard");
can("read", "Funds");
can("read", "Marketplace");
can("read", "Live");
can("read", "Checkpoints");
can("read", "MissionControl");
cannot("read", "Map");

// Supplier
can("read", "Dashboard");
can("read", "Marketplace");
can("read", "SupplierShop");
can("read", "SupplierProducts");
cannot("read", "Funds");

// Inspector
can("read", "Dashboard");
can("read", "Map");
can("read", "Inspection");
can("read", "Document");
```

---

## 11. Business Logic & Workflow

### 11.1 Daily Operations Loop

```
         ┌──────────────────────────────────────────────────────┐
         │              DAILY OPERATIONS LOOP                   │
         │                                                      │
         │   PLAN  →  SOURCE  →  COOK  →  DELIVER  →  GET PAID │
         │    ↑                                          │      │
         │    └──────────────────────────────────────────┘      │
         └──────────────────────────────────────────────────────┘
```

| Step | Deskripsi | Pages |
|------|-----------|-------|
| **1. PLAN** | Vendor cek jadwal, set menu hari ini | `/portal/operasional/jadwal`, `/portal/menu` |
| **2. SOURCE** | Kalkulasi bahan, order dari supplier | `/portal/operasional/kalkulasi-bahan`, `/portal/marketplace` |
| **3. COOK & CHECK** | Masak + foto checkpoint CP1-4 | `/portal/live`, `/pwa/operasional/live` |
| **4. DELIVER** | Kirim ke sekolah, sekolah konfirmasi | `/portal/logistics`, `/sekolah/confirm` |
| **5. SCORE & PAY** | Hitung skor, cairkan dana | `/portal/checkpoints`, `/portal/funds` |

### 11.2 Vendor Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VENDOR LIFECYCLE STATE MACHINE                       │
└─────────────────────────────────────────────────────────────────────────────┘

ANONYMOUS ──┬──► ELIGIBILITY_CHECKED ──► REGISTERED ──► PREPARING_DOCS
            │                                                │
            │    ◄── User belum terdaftar                    ▼
            │                                          DOCS_SUBMITTED
            │                                                │
            │                                                ▼
            │                                      INSPECTION_SCHEDULED
            │                                                │
            │                                                ▼
            │                                      INSPECTION_COMPLETED
            │                                                │
            │                                                ▼
            │                                          UNDER_REVIEW
            │                                           /        \
            │                              REVISION_REQUESTED    APPROVED
            │                                     │                │
            │                                     └────┬───────────┘
            │                                          ▼
            │                                      ONBOARDING
            │                                          │
            │                                          ▼
            └─────────────────────────────────────► ACTIVE
                                                    /      \
                                             SUSPENDED    REVOKED
```

### 11.3 Checkpoint Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CHECKPOINT FLOW                          │
└─────────────────────────────────────────────────────────────┘

[Start Day] ──► CP1: Terima Bahan
                    │
                    ├── Foto bahan mentah
                    ├── AI validasi kesegaran
                    ├── GPS timestamp
                    └── Score: +25 (if pass)
                    │
                    ▼
              CP2: Proses Masak (≤4 jam dari CP1 — GOLDEN RULE)
                    │
                    ├── Foto kondisi dapur
                    ├── AI validasi kebersihan
                    ├── Score: +25 (if pass)
                    └── Penalty: -20 (if >4 jam)
                    │
                    ▼
              CP3: Makanan Siap
                    │
                    ├── Foto makanan jadi
                    ├── AI validasi kelayakan
                    ├── Generate delivery tokens
                    └── Score: +25 (if pass)
                    │
                    ▼
              CP4: Serah Terima
                    │
                    ├── Foto serah terima
                    ├── School QR confirm
                    ├── Score: +25 (if pass)
                    └── Trigger daily debrief
                    │
                    ▼
              [Daily Score Finalized]
                    │
                    └── Disbursement = porsi × Rp30.000 × (score/100)
```

---

## 12. AI/ML Integration

### 12.1 AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI MODULE                               │
└─────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   AiModule      │
                         │  (NestJS)       │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
     │ LlmService  │     │VisionService│     │ RagService  │
     │             │     │             │     │             │
     │ • Chat      │     │ • Photo     │     │ • Query     │
     │ • Generate  │     │   validation│     │ • Proactive │
     │ • Debrief   │     │ • AI score  │     │ • Ingest    │
     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                     ┌──────────┴──────────┐
                     │  Anthropic Claude   │
                     │  (or Mock Service)  │
                     └─────────────────────┘
```

### 12.2 AI Use Cases

| Feature | Input | Output | Purpose |
|---------|-------|--------|---------|
| **Photo Checkpoint** | Image file | pass/fail, confidence, detected items | Validate food quality |
| **Nutrition Compliance** | Menu + ingredients | compliant/not, missing nutrients | Check PMK standards |
| **Daily Debrief** | Day's events | narrative, recommendations | AI summary |
| **RAG SOP Assistant** | User question | Answer with citations | SOP guidance |
| **Anomaly Detection** | Historical data | Risk flags | Fraud prevention |

### 12.3 Vision Service

```typescript
interface ValidationResult {
  status: 'pass' | 'fail' | 'review';
  score: number;        // 0-100
  confidence: number;   // 0.0-1.0
  notes: string;
  detectedItems: string[];
}
```

### 12.4 RAG Service

```typescript
// Query endpoint
POST /rag/query
{
  "question": "Apa saja syarat sertifikasi PIRT?"
}

// Response
{
  "answer": "Berdasarkan peraturan...",
  "sources": [
    { "document": "PMK-123", "chunk": 5, "relevance": 0.95 }
  ]
}
```

---

## 13. Real-time Features

### 13.1 WebSocket Gateway

**Namespaces:**
- `/ops`: Vendor operations room
- `/bgn`: BGN admin room

**Connection Flow:**
```
1. Client connects with JWT
2. Server validates token
3. Client joins room (`vendor:{id}` or `bgn:all`)
4. Server broadcasts events
5. Client receives updates
```

### 13.2 Event Types

| Event | Direction | Payload |
|-------|-----------|---------|
| `mc:checkpoint:update` | Server → Client | { vendorId, cpType, status } |
| `score:update` | Server → Client | { vendorId, score, delta, reason } |
| `alert:new` | Server → Client | { alertId, severity, title, body } |
| `delivery:confirmed` | Server → Client | { tokenId, schoolId, timestamp } |
| `notification:new` | Server → Client | { notificationId, subject, body } |
| `presence:update` | Bidirectional | { userId, status: online/offline } |

### 13.3 Client Integration

```typescript
// apps/web/lib/realtime-client.ts
import { io } from 'socket.io-client';

const socket = io('/ops', {
  auth: { token: accessToken }
});

socket.on('score:update', (data) => {
  // Handle real-time score update
});
```

---

## 14. File Storage

### 14.1 Storage Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE MODULE                            │
└─────────────────────────────────────────────────────────────┘

           Client
              │
              ▼
    POST /storage/upload
    (multipart/form-data)
              │
              ▼
     ┌─────────────────┐
     │ StorageService  │
     │                 │
     │ • Validate size │
     │ • Generate key  │
     │ • Compute hash  │
     │ • Upload to S3  │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │   MinIO / S3    │
     │                 │
     │ Bucket: nutrio- │
     │         uploads │
     └─────────────────┘
```

### 14.2 Upload Response

```typescript
interface UploadResult {
  fileKey: string;      // S3 object key
  fileUrl: string;      // Public URL
  fileHash: string;     // SHA256 hash
  fileSize: number;     // Bytes
  mimeType: string;     // Content type
}
```

### 14.3 Configuration

```env
S3_ENDPOINT=http://localhost:9000    # MinIO for local
S3_BUCKET=nutrio-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```

---

## 15. OpenSpec Workflow

### 15.1 Overview

Proyek ini menggunakan **OpenSpec** untuk spec-driven change management.

```
openspec/
├── config.yaml         # Configuration
├── changes/            # Active proposals
│   ├── access-control-mgmt/
│   │   ├── proposal.md
│   │   ├── design.md
│   │   ├── specs/
│   │   └── tasks.md
│   └── archive/        # Completed changes
│       └── 2026-03-16-refactor-casl-rbac/
└── specs/              # Current specifications
    └── rbac-implementation/
```

### 15.2 Change Artifacts

| Artifact | Purpose |
|----------|---------|
| `proposal.md` | Why, what changes, impact |
| `design.md` | Technical design decisions |
| `specs/` | Detailed specifications |
| `tasks.md` | Implementation task list |
| `.openspec.yaml` | Change metadata |

### 15.3 Workflow

```
1. New Change     → openspec-new-change
2. Continue       → openspec-continue-change
3. Fast-forward   → openspec-ff-change
4. Implement      → openspec-apply-change
5. Verify         → openspec-verify-change
6. Archive        → openspec-archive-change
```

---

## 16. Testing

### 16.1 Test Structure

```
apps/api/test/
├── casl-ability-factory.e2e-spec.ts
├── guards.e2e-spec.ts
├── jwt-permissions.e2e-spec.ts
├── menus.e2e-spec.ts
└── jest-e2e.json

apps/web/e2e/
└── (Playwright tests)
```

### 16.2 Test Commands

```bash
# Unit tests
pnpm test

# E2E tests (API)
pnpm --filter api test:e2e

# E2E tests (Web)
pnpm --filter web test:e2e

# Single test file
pnpm --filter web test -- path/to/file.test.ts
```

### 16.3 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@bgn.go.id | Admin123! | admin_bgn |
| vendor@sppg.go.id | Vendor123! | vendor (ACTIVE) |
| vendor2@sppg.go.id | Vendor123! | vendor (INSPECTION_SCHEDULED) |
| inspector@bgn.go.id | Inspector123! | inspector |
| coordinator@sppg.go.id | Coordinator123! | coordinator |
| dinkes@kesehatan.go.id | Dinkes123! | dinkes |
| school@sdn01.sch.id | School123! | school |
| parent@family.com | Parent123! | parent |

---

## 17. Deployment

### 17.1 Docker Services

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgis/postgis:16-3.4
    ports: ['5433:5432']
    environment:
      POSTGRES_DB: Nutrio
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  minio:
    image: minio/minio:latest
    command: server /data --console-address ':9001'
    ports: ['9000:9000', '9001:9001']
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
```

### 17.2 Build & Deploy

```bash
# Build all apps
pnpm build

# Start production
pnpm start

# API
node apps/api/dist/main.js

# Web
next start -p 3000

# PWA
next start -p 3002
```

---

## 18. Environment Variables

### 18.1 apps/api/.env

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5433/Nutrio

# AI
AI_PROVIDER=anthropic
AI_API_KEY=your-api-key
AI_MODEL=claude-sonnet-4-6
AI_MOCK=true

# Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=nutrio-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1

# Server
PORT=3333
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

# Database Roles (optional)
SKIP_DB_ROLES=true
```

### 18.2 apps/web/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 18.3 apps/pwa/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

---

## 19. Perintah CLI

### 19.1 Development

```bash
# Install dependencies
pnpm install

# Start all apps
pnpm dev

# Start specific app
pnpm --filter web dev
pnpm --filter api dev
pnpm --filter pwa dev
```

### 19.2 Database

```bash
# Run migrations
pnpm db:migrate

# Seed data
pnpm db:seed

# Generate migration
pnpm --filter api typeorm migration:generate -d src/config/data-source.ts src/database/migrations/<Name>

# Generate seeder
pnpm --filter api seed:generate -- <name>
```

### 19.3 Build & Test

```bash
# Build
pnpm build

# Lint
pnpm lint

# Typecheck
pnpm typecheck

# Test
pnpm test

# Format
pnpm format
```

### 19.4 shadcn/ui

```bash
# Add component (from repo root)
pnpm dlx shadcn@latest add button -c apps/web
```

---

## 20. API Reference Lengkap

### 20.1 Authentication

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /auth/register | - | Register user |
| POST | /auth/login | - | Login |
| POST | /auth/refresh | - | Refresh token |
| GET | /auth/me | JWT | Get current user |

### 20.2 Access Control

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /roles | Admin | List roles |
| POST | /roles | Admin | Create role |
| GET | /roles/:id | Admin | Get role |
| PUT | /roles/:id | Admin | Update role |
| DELETE | /roles/:id | Admin | Delete role |
| GET | /permissions | Admin | List permissions |
| GET | /menus/tree | - | Full menu tree |
| GET | /menus/user/me | JWT | User's menu |

### 20.3 Vendors

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /vendors/me | JWT | Own vendor profile |
| PATCH | /vendors/me | JWT | Update profile |

### 20.4 Eligibility

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /eligibility/sessions | - | Create session |
| PATCH | /eligibility/sessions/:token | - | Save answer |
| POST | /eligibility/sessions/:token/generate | - | Generate roadmap |
| GET | /eligibility/sessions/:token | - | Get session |

### 20.5 Onboarding

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /onboarding/state | JWT | Get progress |
| POST | /onboarding/step1/profile | JWT | Complete profile |
| POST | /onboarding/step2/team/invite | JWT | Invite member |
| GET | /onboarding/step2/team | JWT | Get team |
| POST | /onboarding/step2/team/accept/:token | - | Accept invite |
| POST | /onboarding/step3/simulation/complete | JWT | Complete sim |
| POST | /onboarding/step4/supplier/connect | JWT | Connect supplier |
| GET | /onboarding/step4/suppliers | JWT | List suppliers |
| POST | /onboarding/complete | JWT | Finalize |

### 20.6 Checkpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /checkpoints/today | JWT | Today's state |
| POST | /checkpoints/:cpType/submit | JWT | Submit checkpoint |

### 20.7 Scoring

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /scoring/today | JWT | Today's score |
| GET | /scoring/history | JWT | Score history |

### 20.8 Delivery

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /delivery/my/week-schedule | JWT | Weekly schedule |
| GET | /delivery/:token | - | Delivery info |
| POST | /delivery/:token/arrived | JWT | Record arrival |
| POST | /delivery/:token/photo | JWT | Upload photo |
| GET | /delivery/:token/qr-payload | - | QR data |
| POST | /delivery/:token/complete | JWT | Complete |

### 20.9 School Confirm

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /sekolah/confirm/:qrToken | - | Delivery info |
| POST | /sekolah/confirm/:qrToken | - | Submit confirm |

### 20.10 Debrief

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /debrief/:date | JWT | Get/generate debrief |
| GET | /public/verify/:dataHash | - | Verify hash |

### 20.11 Mission Control

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /mission-control/today | JWT | Today's dashboard |
| GET | /mission-control/team-presence | JWT | Team status |

### 20.12 Command Center

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /command-center/overview | Admin | System stats |
| GET | /command-center/vendors | Admin | All vendors |
| GET | /command-center/alerts | Admin | Alerts |
| PATCH | /command-center/alerts/:id/read | Admin | Mark read |
| GET | /command-center/deliveries | Admin | Deliveries |
| GET | /command-center/reports | Admin | Reports |
| GET | /command-center/sppg/:vendorId | Admin | SPPG detail |

### 20.13 Funds

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /funds/summary | JWT | Fund summary |
| GET | /funds/transactions | JWT | Transactions |

### 20.14 Suppliers

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /suppliers | JWT | List suppliers |
| GET | /suppliers/:id | JWT | Supplier detail |
| GET | /suppliers/me/profile | Supplier | Own profile |
| PATCH | /suppliers/me/profile | Supplier | Update profile |
| GET | /suppliers/me/products | Supplier | List products |
| POST | /suppliers/me/products | Supplier | Create product |
| PATCH | /suppliers/me/products/:id | Supplier | Update product |
| DELETE | /suppliers/me/products/:id | Supplier | Delete product |

### 20.15 RAG

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /rag/query | JWT | Ask question |
| POST | /rag/proactive | JWT | Contextual tips |
| POST | /rag/admin/ingest | Admin | Ingest docs |

### 20.16 Storage

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /storage/upload | JWT | Upload file |

### 20.17 Notifications

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /notifications/me | JWT | List notifications |
| POST | /notifications/:id/read | JWT | Mark as read |

### 20.18 Public

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /public/overview | - | Public stats |
| GET | /public/sppg/search | - | Search SPPG |
| GET | /public/sppg/:id | - | SPPG profile |
| GET | /public/audit-trail/:vendorId | - | Audit trail |

---

## Appendix A: ERD Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ENTITY RELATIONSHIPS                             │
└─────────────────────────────────────────────────────────────────────────────┘

users ──────┬────── vendors (1:1)
            │         │
            │         ├──── documents (1:N)
            │         ├──── sppg_locations (1:N)
            │         ├──── checkpoint_events (1:N)
            │         ├──── daily_score_records (1:N)
            │         ├──── daily_debriefs (1:N)
            │         ├──── vendor_team_members (1:N)
            │         ├──── onboarding_progress (1:1)
            │         ├──── eligibility_sessions (1:N)
            │         └──── purchase_orders (as buyer) (1:N)
            │
            ├──── roles (N:1)
            │       ├──── role_permissions (1:N)
            │       └──── role_menus (1:N)
            │
            ├──── refresh_tokens (1:N)
            ├──── notifications (1:N)
            └──── suppliers (1:1)
                    │
                    ├──── supplier_documents (1:N)
                    ├──── supplier_products (1:N)
                    │       └──── supplier_product_photos (1:N)
                    └──── purchase_orders (as seller) (1:N)

delivery_tokens ────── school_confirmations (1:1)

checkpoint_events ──── score_events (via daily_score_records)
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **MBG** | Makan Bergizi Gratis — Indonesia free school meal program |
| **SPPG** | Satuan Penyedia Pangan Gizi — Food Provider Unit |
| **BGN** | Badan Gizi Nasional — National Nutrition Agency |
| **CP** | Checkpoint — Photo verification points (CP1-4) |
| **SLHS** | Sertifikat Laik Higiene Sanitasi — Hygiene certificate |
| **NKV** | Nomor Kontrol Veteriner — Veterinary control number |
| **PIRT** | Pangan Industri Rumah Tangga — Home industry food permit |
| **NIB** | Nomor Induk Berusaha — Business ID number |
| **OSS** | Online Single Submission — Government business licensing system |
| **PO** | Purchase Order |
| **CASL** | Code Access Security Layer — Authorization library |
| **RAG** | Retrieval-Augmented Generation — AI technique |

---

> **Dokumen ini dihasilkan secara otomatis dari analisis codebase Nutrio.**  
> **Terakhir diperbarui:** Juni 2026
