# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

pnpm + Turborepo monorepo. Workspaces are `apps/*` and `packages/*`. Node `>=20`, package manager `pnpm@10.4.1`.

Apps:
- `apps/api` — NestJS 11 + TypeORM (Postgres) backend. Port `3001`.
- `apps/web` — Next.js 16 (App Router, Turbopack) admin/portal SPA. Port `3000`.
- `apps/pwa` — Next.js 16 PWA (`@ducanh2912/next-pwa`) for field/school users; uses camera + QR scanner.

Packages:
- `@workspace/common` — Shared TS types/enums/constants. `UserRole` enum and CASL `AppAction`/`AppSubject` types live here and are imported by both api and web.
- `@workspace/ui` — shadcn/ui components, hooks, Tailwind v4 globals. Consumed via subpath exports like `@workspace/ui/components/button`. Must be added to `transpilePackages` in any consuming Next config.
- `@workspace/modules` — Higher-level page modules (currently `landing`).
- `@workspace/eslint-config`, `@workspace/typescript-config` — Shared configs.

## Common commands

Run from the repo root unless noted. `turbo` orchestrates per-package scripts.

```bash
pnpm dev          # turbo dev — runs every app's dev script concurrently
pnpm build        # turbo build
pnpm lint
pnpm typecheck
pnpm test
pnpm format       # prettier write across **/*.{ts,tsx,md}
```

Target a single workspace with pnpm filters:

```bash
pnpm --filter web dev
pnpm --filter api dev
pnpm --filter pwa dev
pnpm --filter web test -- path/to/file.test.ts   # single Jest test
pnpm --filter web test:e2e                       # Playwright
pnpm --filter api test:e2e
```

Adding shadcn components — run at repo root, scoped to a Next app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components land in `packages/ui/src/components`, not in the app.

## Database (apps/api)

TypeORM with `synchronize: false` — migrations are the only way to change schema. Data source is `apps/api/src/config/data-source.ts` and requires `DATABASE_URL` in `apps/api/.env` (it throws on boot otherwise).

```bash
pnpm db:migrate                    # root alias → pnpm --filter api db:migrate
pnpm db:seed                       # root alias → typeorm-extension seed:run
pnpm --filter api typeorm migration:generate -d src/config/data-source.ts src/database/migrations/<Name>
pnpm --filter api seed:generate -- <name>
```

Seeders are idempotent (skip by unique key) and live in `apps/api/src/database/seeds/`. See `apps/api/SEEDERS.md` for the canonical test-user accounts (admin, vendor, inspector, coordinator, dinkes, school/parent) and their plain-text passwords for local login.

## Authentication & access control

This codebase has **two layered access-control systems** — be aware of both when changing permission logic:

1. **CASL ability** (in-memory, hardcoded). The source of truth for UI gating and quick checks.
   - Backend: `apps/api/src/modules/auth/casl-ability.factory.ts`
   - Frontend mirror: `apps/web/lib/casl.ts` (`defineAbilitiesFor(role)` — switches on `UserRole`)
   - Subjects/actions are typed in `packages/common/src/types/casl.ts` and shared.
   - **Both files must be kept in sync** when adding a subject or changing a role's abilities.

2. **DB-backed RBAC** (roles, permissions, menus). Managed by `apps/api/src/modules/access-control/` and exposed to the frontend so the sidebar can render per-user menu trees. The web portal sidebar (`apps/web/app/portal/layout.tsx`) calls `useUserMenu()` which hits the menus endpoint; CASL still gates individual nav items.

Auth flow: JWT access token (15 min) + refresh token (7 days), both stored in **cookies** via `apps/web/lib/api-client.ts` (`TokenStorage`). The axios instance auto-refreshes on 401 and queues concurrent requests during refresh. `apps/web/proxy.ts` redirects unauthenticated requests off `/portal` and authenticated ones away from `/login` and `/`.

## Frontend conventions

- App Router with route groups. The web portal segments by role: `apps/web/app/portal/(admin|vendor|supplier|shared)/...`. The PWA segments by user type: `apps/pwa/app/(sekolah|operasional|publik)/...`. Route groups don't appear in the URL — they're for layout/code organization.
- Tailwind v4 — config lives in `packages/ui/src/styles/globals.css` (note the `.vscode/settings.json` pointing the Tailwind extension at it). Each Next app imports `@workspace/ui/globals.css`.
- API calls go through `apps/web/lib/api-client.ts` (`api.get/post/...`) so they get the auth + refresh interceptors automatically. Don't `fetch` directly from components.
- Frontend env: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001`).

## Backend conventions

- `main.ts` enables global `ValidationPipe` with `whitelist + forbidNonWhitelisted + transform` — DTOs must declare every accepted field with `class-validator` decorators or the request will be rejected.
- Global `AllExceptionsFilter` wraps all errors; throw `HttpException` subclasses, don't return error payloads manually.
- New feature modules go under `apps/api/src/modules/<name>/`. Register them in `app.module.ts`. Entities are auto-discovered by the glob `**/*.entity.{ts,js}` from the data source.

## OpenSpec workflow

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven change management. Active proposals live under `openspec/changes/<change-id>/`, archived under `openspec/changes/archive/`, current specs under `openspec/specs/`. The `.agent/skills/`, `.github/prompts/`, `.gemini/`, and `.qwen/` directories contain the workflow prompts (`opsx-*`) used by various assistants. If a task touches an active change directory, read its `proposal.md`/`tasks.md` first.

## AI/LLM integration (apps/api)

Uses `@anthropic-ai/sdk` (or equivalent) via an `AiModule`. Set `AI_MOCK=true` during local dev to skip real API calls and return canned responses instead.

```
AI_PROVIDER=anthropic          # anthropic | openai | gemini
AI_API_KEY=your-api-key
AI_MODEL=claude-sonnet-4-6     # model id for the chosen provider
AI_MOCK=true                   # true = canned responses (no token cost)
```

## File storage (apps/api)

Uses `@aws-sdk/client-s3` against a MinIO instance (Docker) for local development. Production can swap to any S3-compatible endpoint.

```
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=nutrio-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```
