# Vendor Readiness dan Admin Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat vendor aktif otomatis untuk demo setelah seluruh evidence onboarding lengkap, lalu menyediakan console admin untuk mengawasi vendor dan stafnya secara aman.

**Architecture:** `VendorReadinessService` membaca evidence profil, lokasi, dokumen, tim, simulasi, supplier, dan inspeksi demo untuk menghasilkan snapshot readiness. Service ini memakai `StateMachineService.advanceTo()` untuk menjalankan transisi lifecycle legal secara berurutan dan mencatat event/audit; controller onboarding maupun admin tidak pernah mengubah `lifecycle_status` langsung.

**Tech Stack:** NestJS, TypeORM/PostgreSQL, class-validator, Next.js App Router, React, `@workspace/ui`, Jest, Supertest, Playwright E2E.

## Global Constraints

- RAG, chat AI, pembayaran, dan approval manual berjenjang tidak termasuk.
- Semua endpoint vendor memakai JWT dan ownership berdasarkan `vendors.user_id`.
- Semua endpoint admin menerima hanya `admin_bgn`, `coordinator_sppg`, atau `dinkes`; gunakan guard yang membaca `user.role.name ?? user.roleLegacy`.
- Mutasi replayable memakai header `Idempotency-Key`, audit append-only, dan alasan wajib untuk suspend, resume, serta revision.
- Foto/dokumen memakai object key + signed URL; hanya JPEG/PNG/WebP/PDF, maksimum 10 MB.
- Jangan mengubah layar workflow operation-day yang sudah selesai.

---

## File map

| File                                                                | Tanggung jawab                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/api/src/database/migrations/1711300000006-VendorReadiness.ts` | Tabel koneksi supplier dan timeline lifecycle terindeks.              |
| `apps/api/src/modules/vendors/vendor-readiness.service.ts`          | Hitung syarat, snapshot, dan auto-advance lifecycle.                  |
| `apps/api/src/modules/vendors/state-machine.service.ts`             | Transisi legal atomik dan `advanceTo`.                                |
| `apps/api/src/modules/onboarding/*`                                 | Evidence onboarding, dokumen, tim, dan status readiness milik vendor. |
| `apps/api/src/modules/admin-vendors/*`                              | Query/admin action vendor dan anggota tim.                            |
| `apps/web/app/portal/(vendor)/onboarding/page.tsx`                  | Form onboarding yang membaca readiness API.                           |
| `apps/web/app/portal/(admin)/vendors/**`                            | Daftar/detail vendor, timeline, dan aksi override.                    |
| `apps/api/test/vendor-readiness.e2e-spec.ts`                        | Alur lengkap auto-active dan guard admin/ownership.                   |

## Task 1: Persistensi readiness dan lifecycle timeline

**Files:**

- Create: `apps/api/src/database/migrations/1711300000006-VendorReadiness.ts`
- Create: `apps/api/src/modules/vendors/entities/vendor-supplier-connection.entity.ts`
- Create: `apps/api/src/modules/vendors/entities/vendor-lifecycle-event.entity.ts`
- Modify: `apps/api/src/modules/vendors/vendors.module.ts`
- Test: `apps/api/src/modules/vendors/state-machine.service.spec.ts`

**Interfaces:**

- Produces `vendor_supplier_connections(vendor_id, supplier_id, connected_by, connected_at)` with unique `(vendor_id, supplier_id)`.
- Produces `vendor_lifecycle_events(vendor_id, from_status, to_status, actor_user_id, actor_type, reason, correlation_id, created_at)`.

- [ ] **Step 1: Write migration assertions and a failing state-machine test**

```ts
expect(await service.getTimeline(vendorId)).toEqual([
  expect.objectContaining({
    from: VendorLifecycleStatus.REGISTERED,
    to: VendorLifecycleStatus.PREPARING_DOCS,
    actorType: "system",
  }),
]);
```

- [ ] **Step 2: Run the narrow test to verify it fails**

Run: `pnpm --filter api test -- state-machine.service.spec.ts`

Expected: FAIL because `getTimeline` does not exist.

- [ ] **Step 3: Create the migration and entities**

```sql
CREATE TABLE vendor_supplier_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  connected_by UUID REFERENCES users(id),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vendor_id, supplier_id)
);
CREATE INDEX idx_vendor_lifecycle_events_vendor_created
  ON vendor_lifecycle_events(vendor_id, created_at DESC);
```

Map both tables with TypeORM entities and register them with `TypeOrmModule.forFeature` in `VendorsModule`.

- [ ] **Step 4: Run migration and test**

Run: `pnpm --filter api db:migrate && pnpm --filter api test -- state-machine.service.spec.ts`

Expected: migration succeeds; state-machine test passes.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/database/migrations/1711300000006-VendorReadiness.ts apps/api/src/modules/vendors
git commit -m "feat(api): persist vendor readiness evidence"
```

## Task 2: State machine auto-advance yang tetap legal

**Files:**

- Modify: `apps/api/src/modules/vendors/state-machine.service.ts`
- Modify: `apps/api/src/modules/vendors/state-machine.service.spec.ts`
- Modify: `apps/api/src/modules/vendors/vendors.module.ts`

**Interfaces:**

- Consumes `VendorLifecycleStatus` dan `vendor_lifecycle_events` dari Task 1.
- Produces `advanceTo(vendorId, target, actorUserId | null, actorType, reason, correlationId): Promise<TransitionResult[]>`.

- [ ] **Step 1: Add failing tests for legal sequence and illegal target**

```ts
await expect(
  service.advanceTo(
    vendorId,
    VendorLifecycleStatus.ACTIVE,
    null,
    "system",
    "demo readiness",
    "corr-1",
  ),
).resolves.toHaveLength(8);
await expect(
  service.advanceTo(
    vendorId,
    VendorLifecycleStatus.REVOKED,
    null,
    "system",
    "bad",
    "corr-2",
  ),
).rejects.toThrow("tidak diizinkan");
```

- [ ] **Step 2: Run the test to verify the new API fails**

Run: `pnpm --filter api test -- state-machine.service.spec.ts`

Expected: FAIL because `advanceTo` is undefined.

- [ ] **Step 3: Implement one transaction per advance request**

Use a fixed next-state path:

```ts
const DEMO_PATH = [
  "PREPARING_DOCS",
  "DOCS_SUBMITTED",
  "INSPECTION_SCHEDULED",
  "INSPECTION_COMPLETED",
  "UNDER_REVIEW",
  "APPROVED",
  "ONBOARDING",
  "ACTIVE",
] as const;
```

Lock the vendor row with `FOR UPDATE`, call the existing transition rule one edge at a time, insert a lifecycle event for each edge, and write the existing audit log in the same transaction. Do not accept a target outside the legal forward path from the current state.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter api test -- state-machine.service.spec.ts`

Expected: PASS, including persisted timeline order.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/vendors
git commit -m "feat(api): advance vendor lifecycle from readiness"
```

## Task 3: Readiness evaluator dan onboarding evidence API

**Files:**

- Create: `apps/api/src/modules/vendors/vendor-readiness.service.ts`
- Create: `apps/api/src/modules/vendors/vendor-readiness.service.spec.ts`
- Create: `apps/api/src/modules/onboarding/dto/upload-document.dto.ts`
- Create: `apps/api/src/modules/onboarding/dto/update-team-member.dto.ts`
- Modify: `apps/api/src/modules/onboarding/onboarding.service.ts`
- Modify: `apps/api/src/modules/onboarding/onboarding.controller.ts`
- Modify: `apps/api/src/modules/onboarding/onboarding.module.ts`
- Modify: `apps/api/src/modules/vendors/vendors.module.ts`

**Interfaces:**

- Produces `ReadinessSnapshot { ready: boolean; missingRequirements: Array<{ code: string; message: string }>; nextAction: string | null; lifecycleStatus: VendorLifecycleStatus }`.
- Produces `evaluate(vendorId, actorUserId?, correlationId?): Promise<ReadinessSnapshot>`.

- [ ] **Step 1: Write failing readiness tests for each missing requirement**

```ts
expect(snapshot.missingRequirements.map((item) => item.code)).toEqual([
  "PROFILE",
  "SPPG_LOCATION",
  "DOCUMENT",
  "KEPALA_DAPUR",
  "SIMULATION",
  "SUPPLIER",
  "DEMO_INSPECTION",
]);
expect(readySnapshot).toMatchObject({ ready: true, lifecycleStatus: "ACTIVE" });
```

- [ ] **Step 2: Run readiness tests**

Run: `pnpm --filter api test -- vendor-readiness.service.spec.ts`

Expected: FAIL because the evaluator does not exist.

- [ ] **Step 3: Implement evaluator and wire every onboarding mutation to it**

Query only persisted facts: complete profile fields in `vendors`, active `sppg_locations`, valid `documents`, accepted `kepala_dapur`, `onboarding_progress.step3_done`, `vendor_supplier_connections`, and a completed passing inspection. For demo seed, accept a completed inspection with `critical_fails = 0` and `inspection_score >= 80`.

Extend onboarding endpoints with:

```text
POST /onboarding/documents
GET  /onboarding/documents
POST /onboarding/step2/team/:id/resend
DELETE /onboarding/step2/team/:id
PATCH /onboarding/step2/team/:id
GET  /onboarding/readiness
```

Store document object keys, never public storage URLs. Ensure `CurrentUser` uses `user.id`, not `user.sub`; all mutations call `evaluate` after their database write and return the refreshed snapshot.

- [ ] **Step 4: Test controller ownership and readiness response**

Run: `pnpm --filter api test -- vendor-readiness.service.spec.ts && pnpm --filter api typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/vendors apps/api/src/modules/onboarding
git commit -m "feat(api): evaluate vendor onboarding readiness"
```

## Task 4: Admin vendor and team management API

**Files:**

- Create: `apps/api/src/modules/admin-vendors/admin-vendors.module.ts`
- Create: `apps/api/src/modules/admin-vendors/admin-vendors.controller.ts`
- Create: `apps/api/src/modules/admin-vendors/admin-vendors.service.ts`
- Create: `apps/api/src/modules/admin-vendors/dto/vendor-action.dto.ts`
- Create: `apps/api/src/modules/admin-vendors/dto/list-vendors-query.dto.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/modules/auth/guards/roles.guard.ts`
- Test: `apps/api/test/vendor-readiness.e2e-spec.ts`

**Interfaces:**

- Consumes `VendorReadinessService.evaluate`, `StateMachineService`, and team members.
- Produces guarded endpoints:

```text
GET   /admin/vendors?lifecycleStatus=&ready=&province=&page=&limit=
GET   /admin/vendors/:id
POST  /admin/vendors/:id/suspend
POST  /admin/vendors/:id/resume
POST  /admin/vendors/:id/revision
PATCH /admin/vendors/:id/team/:memberId
POST  /admin/vendors/:id/team/:memberId/resend
DELETE /admin/vendors/:id/team/:memberId
```

- [ ] **Step 1: Add E2E assertions for admin and non-admin**

```ts
await request(app.getHttpServer())
  .post(`/admin/vendors/${vendorId}/suspend`)
  .set(auth(vendorToken))
  .send({ reason: "audit" })
  .expect(403);
await request(app.getHttpServer())
  .post(`/admin/vendors/${vendorId}/suspend`)
  .set(auth(adminToken))
  .send({ reason: "Dokumen perlu diperiksa" })
  .expect(201);
```

- [ ] **Step 2: Run the E2E file to verify the route is absent**

Run: `TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/Nutrio_e2e_clean pnpm --filter api test:e2e -- vendor-readiness.e2e-spec.ts`

Expected: FAIL with `404` for `/admin/vendors`.

- [ ] **Step 3: Implement query projection and override policies**

Use `JwtAuthGuard` plus `RolesGuard` with three permitted admin roles. Validate pagination range `1..100`; parameterize filters. Require non-empty `reason` for every lifecycle override. `resume` re-runs readiness and only advances to `ACTIVE` if `ready === true`; otherwise return `409` with `missingRequirements`. Emit audit event and realtime `vendor:lifecycle:update` after committed changes.

- [ ] **Step 4: Run API E2E**

Run: `TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/Nutrio_e2e_clean pnpm --filter api test:e2e -- vendor-readiness.e2e-spec.ts`

Expected: PASS for list/detail, authorization, suspend, revision, and resume.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/admin-vendors apps/api/src/app.module.ts apps/api/src/modules/auth/guards/roles.guard.ts apps/api/test/vendor-readiness.e2e-spec.ts
git commit -m "feat(api): manage vendor lifecycle from admin"
```

## Task 5: Protect core roles and expose safe user management

**Files:**

- Modify: `apps/api/src/modules/access-control/roles/roles.service.ts`
- Modify: `apps/api/src/modules/access-control/roles/roles.controller.ts`
- Modify: `apps/api/src/modules/access-control/common/admin.guard.ts`
- Create: `apps/api/src/modules/access-control/roles/roles.service.spec.ts`
- Modify: `apps/web/app/portal/(admin)/admin/roles/page.tsx`
- Modify: `apps/web/app/portal/(admin)/admin/permissions/page.tsx`
- Modify: `apps/web/app/portal/(admin)/admin/menus/page.tsx`

**Interfaces:**

- Produces `isSystemRole(name): boolean` for `admin_bgn`, `coordinator_sppg`, `dinkes`, `vendor`, `supplier`, `inspector`, and `public`.
- Produces a consistent admin identity check without `console.log` or `console.error` output.

- [ ] **Step 1: Write failing core-role tests**

```ts
await expect(rolesService.remove(adminRoleId)).rejects.toThrow(
  "Role sistem tidak dapat dihapus",
);
await expect(rolesService.update(vendorRoleId, "x", "x")).rejects.toThrow(
  "Role sistem tidak dapat diubah",
);
```

- [ ] **Step 2: Run the service test**

Run: `pnpm --filter api test -- roles.service.spec.ts`

Expected: FAIL because the guard policy is absent.

- [ ] **Step 3: Enforce policy and update admin screens**

Block rename/delete and permission reassignment of system roles in service methods, not only in UI. Remove debug logging from `AdminGuard`; read `user.role?.name ?? user.roleLegacy`. Disable destructive controls for system roles in the three admin pages and display the API error in the existing toast component.

- [ ] **Step 4: Run API and Web narrow tests**

Run: `pnpm --filter api test -- roles.service.spec.ts && pnpm --filter web test -- lib/services/__tests__/roles.service.test.ts`

Expected: API policy test passes; Web test either passes or records the existing `rootDir` baseline failure without changing unrelated config.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/access-control apps/web/app/portal/'(admin)'/admin
git commit -m "feat(admin): protect system role management"
```

## Task 6: Vendor onboarding and admin console UI

**Files:**

- Modify: `apps/web/app/portal/(vendor)/onboarding/page.tsx`
- Create: `apps/web/lib/services/vendor-readiness.service.ts`
- Create: `apps/web/lib/services/admin-vendors.service.ts`
- Create: `apps/web/app/portal/(admin)/vendors/page.tsx`
- Create: `apps/web/app/portal/(admin)/vendors/[vendorId]/page.tsx`
- Modify: `apps/web/app/portal/(admin)/admin/layout.tsx`
- Test: `apps/web/e2e/vendor-readiness.spec.ts`

**Interfaces:**

- Consumes `ReadinessSnapshot` and `/admin/vendors` contracts from Tasks 3–4.
- Produces vendor status guidance and admin lifecycle controls backed only by API data.

- [ ] **Step 1: Write Playwright scenarios first**

```ts
test("vendor sees missing readiness requirement and admin can suspend", async ({
  page,
}) => {
  await page.goto("/portal/vendor/onboarding");
  await expect(
    page.getByText("Kepala dapur belum menerima undangan"),
  ).toBeVisible();
  await page.goto("/portal/admin/vendors");
  await page.getByRole("button", { name: "Suspend vendor" }).click();
  await expect(page.getByText("Vendor disuspend")).toBeVisible();
});
```

- [ ] **Step 2: Run the Playwright test to verify it fails**

Run: `pnpm --filter web test:e2e -- vendor-readiness.spec.ts`

Expected: FAIL because the admin vendor route does not exist.

- [ ] **Step 3: Implement API-backed screens**

Replace onboarding completion assumptions with readiness cards showing `missingRequirements`, `nextAction`, and lifecycle timeline. Use the existing `api-client`, `@workspace/ui` controls, loading states, and destructive confirmation dialog for lifecycle override. Admin list uses query-string filters and pagination; detail page presents evidence/timeline/team without exposing raw storage object URLs.

- [ ] **Step 4: Run UI E2E and typecheck**

Run: `pnpm --filter web typecheck && pnpm --filter web test:e2e -- vendor-readiness.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/portal/'(vendor)'/onboarding apps/web/app/portal/'(admin)'/vendors apps/web/lib/services apps/web/e2e/vendor-readiness.spec.ts
git commit -m "feat(web): show vendor readiness and admin controls"
```

## Task 7: Full E2E, migration, and release evidence

**Files:**

- Modify: `apps/api/test/vendor-readiness.e2e-spec.ts`
- Modify: `docs/rencana-orang-1-platform-api.md` only if its scope is intentionally extended
- Create: `docs/testing/vendor-readiness-e2e.md`

**Interfaces:**

- Consumes all API/UI contracts from Tasks 1–6.
- Produces documented repeatable commands and a clean-database E2E trace.

- [ ] **Step 1: Complete API E2E success and failure flows**

```ts
expect(readinessBefore.ready).toBe(false);
expect(readinessBefore.missingRequirements).toEqual(
  expect.arrayContaining([expect.objectContaining({ code: "DOCUMENT" })]),
);
expect(readinessAfter).toMatchObject({
  ready: true,
  lifecycleStatus: "ACTIVE",
});
```

Cover duplicate invite, cross-vendor document/team access, resume while not ready, and admin-only lifecycle action.

- [ ] **Step 2: Reset a disposable Docker database and run migrations/seeds**

Run:

```powershell
wsl -d Ubuntu -- docker exec nutrio-postgres dropdb -U postgres --if-exists Nutrio_vendor_e2e
wsl -d Ubuntu -- docker exec nutrio-postgres createdb -U postgres Nutrio_vendor_e2e
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5433/Nutrio_vendor_e2e'
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

Expected: all migrations and seeders succeed on an empty database.

- [ ] **Step 3: Run API, Web, and full relevant verification**

Run:

```powershell
$env:TEST_DATABASE_URL='postgresql://postgres:postgres@localhost:5433/Nutrio_vendor_e2e'
pnpm --filter api test:e2e -- vendor-readiness.e2e-spec.ts
pnpm --filter api test
pnpm --filter api typecheck
pnpm --filter api build
pnpm --filter web test:e2e -- vendor-readiness.spec.ts
```

Expected: API E2E, unit test, typecheck, build, and Web E2E pass. If the unrelated Web Jest `rootDir` baseline remains, state it explicitly in the release evidence rather than masking it.

- [ ] **Step 4: Document results and commit**

```bash
git add apps/api/test/vendor-readiness.e2e-spec.ts apps/web/e2e/vendor-readiness.spec.ts docs/testing/vendor-readiness-e2e.md
git commit -m "test: cover vendor readiness lifecycle"
```

## Parallel work allocation

After Task 2 defines the backend contracts, two people can work without file overlap:

| Person  | Owns                                                 | Starts after              |
| ------- | ---------------------------------------------------- | ------------------------- |
| Orang 1 | Tasks 3–5 and API part of Task 7 under `apps/api/**` | Task 2                    |
| Orang 2 | Task 6 and Web part of Task 7 under `apps/web/**`    | Task 3 contract published |

Task 1–2 must be completed first by a single owner because both alter lifecycle persistence and contract. Merge the API contract before UI begins; UI uses only the endpoints listed in Task 4.

## Plan self-review

- Spec coverage: onboarding evidence (Task 3), auto lifecycle (Task 2), admin/vendor/team operations (Tasks 4–6), system-role protection (Task 5), and full E2E/release evidence (Task 7) are all covered.
- Scope: RAG, payments, and manual approval are explicitly excluded.
- Interface consistency: `ReadinessSnapshot` is produced in Task 3 and consumed by Tasks 4 and 6; `advanceTo` is produced in Task 2 and consumed by Tasks 3–4.
