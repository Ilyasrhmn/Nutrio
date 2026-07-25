# Operation-Day Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver one idempotent, role-safe daily vendor workflow from purchase order through school confirmation to derived score, fund projection, audit, and notification.

**Architecture:** Keep `orders`, `inventory`, `menu-plans`, and `operation-days` as small NestJS modules. Existing checkpoint, delivery, school-confirmation, scoring, funds, notification, and realtime modules retain their domains and are amended to reference `operation_day_id`; the operation-day service only validates transitions and coordinates transactionally durable effects.

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL, class-validator, Jest/Supertest, Socket.IO, existing S3 storage and Anthropic/mock vision adapters.

## Global Constraints

- Only `apps/api/**`, API migrations, API seed data, and truly cross-client DTO/enum types in `packages/common/**` are in scope.
- Preserve existing public endpoint fields; amended checkpoint, delivery, and school-confirmation responses add `operationDayId` and `eventId` only.
- Every state-changing endpoint requires JWT except token-scoped school confirmation; all mutation endpoints accept `Idempotency-Key`.
- Use database transactions for a domain mutation plus its audit/outbox event. Post-commit Socket.IO/email may retry and must not mutate domain state.
- `409` is for illegal state/idempotency conflicts; `422` is for stock/menu domain invalidity; `403` is for role/ownership; `404` hides aggregates outside the caller's scope.
- Use the existing raw-`DataSource.query` style when working with legacy schema tables; add focused entities only for new tables owned by the new modules.
- Do not implement payment gateway/webhook work. `operation-day closed` creates a persisted fund projection only.
- Commands run from `D:\development\Nutrio`.

---

## File Structure

| File                                                                     | Responsibility                                                                                                                               |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/database/migrations/1711300000000-OperationDayWorkflow.ts` | Adds operation-day, menu, inventory ledger, idempotency, audit/outbox, incident, and fund-projection schema; links existing workflow tables. |
| `apps/api/src/common/idempotency/idempotency.service.ts`                 | Reserves/completes/replays an authenticated mutation by key and request hash.                                                                |
| `apps/api/src/common/audit/audit.service.ts`                             | Persists sanitized append-only audit/outbox records in the caller's transaction.                                                             |
| `apps/api/src/modules/orders/**`                                         | Vendor/supplier PO lifecycle and receipt command.                                                                                            |
| `apps/api/src/modules/inventory/**`                                      | Inventory ledger append operations and stock projection query.                                                                               |
| `apps/api/src/modules/menu-plans/**`                                     | Menu/recipe plan persistence and required-material/shortage calculation.                                                                     |
| `apps/api/src/modules/operation-days/**`                                 | Daily aggregate, CP1 inventory consumption, legal transition validation, close command.                                                      |
| `apps/api/src/modules/checkpoints/**`                                    | Resolves operation day for CP commands and delegates CP1 consumption / CP3 delivery creation / CP4 validation.                               |
| `apps/api/src/modules/delivery/**`                                       | Binds generated tokens to an operation day and requires authenticated vendor for mutable delivery actions.                                   |
| `apps/api/src/modules/school-confirm/**`                                 | Marks the matching operation day school-confirmed in the same confirmation transaction.                                                      |
| `apps/api/src/modules/workflow-projections/**`                           | Converts `operation.closed` to score finalization, fund projection, audit, alert/incident, realtime, and notification effects.               |
| `apps/api/test/operation-day-workflow.e2e-spec.ts`                       | End-to-end success, replay, ownership, invalid-state, insufficient-stock, and expired-token scenario.                                        |
| `apps/api/src/database/seeds/operation-day.seed.ts`                      | Idempotent vendor/supplier/school/products/menu workflow fixture.                                                                            |

## Task 1: Persist the workflow foundation

**Files:**

- Create: `apps/api/src/database/migrations/1711300000000-OperationDayWorkflow.ts`
- Create: `apps/api/src/common/idempotency/idempotency.service.ts`
- Create: `apps/api/src/common/audit/audit.service.ts`
- Create: `apps/api/src/common/workflow-common.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Test: `apps/api/test/operation-day-workflow.e2e-spec.ts`

**Interfaces:**

- Produces `operation_days(id, vendor_id, menu_plan_id, operation_date, status, closed_at)` with unique `(vendor_id, operation_date)` for non-closed days.
- Produces `inventory_ledger(id, vendor_id, product_id, unit, quantity_delta, entry_type, source_type, source_id, actor_user_id, created_at)` and unique `(source_type, source_id, entry_type)` for one-time sources.
- Produces `idempotency_records(actor_user_id, key, request_hash, status_code, response_body)` with unique `(actor_user_id, key)`.
- Produces `audit_events` and `workflow_outbox` records with `correlation_id`.

- [ ] **Step 1: Write the migration-focused e2e test**

Create `apps/api/test/operation-day-workflow.e2e-spec.ts` with a schema assertion before importing any new controller:

```ts
it("creates one active operation day and rejects a second one for the same vendor/date", async () => {
  await dataSource.query(
    `INSERT INTO operation_days (vendor_id, operation_date, status)
     VALUES ($1, CURRENT_DATE, 'planned')`,
    [fixture.vendorId],
  );

  await expect(
    dataSource.query(
      `INSERT INTO operation_days (vendor_id, operation_date, status)
       VALUES ($1, CURRENT_DATE, 'planned')`,
      [fixture.vendorId],
    ),
  ).rejects.toThrow();
});
```

- [ ] **Step 2: Run the test to verify the schema is absent**

Run: `pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts`

Expected: FAIL because relation `operation_days` does not exist.

- [ ] **Step 3: Add the migration and common records**

In `1711300000000-OperationDayWorkflow.ts`, create the tables below in `up`, with UUID keys and foreign keys to existing `vendors`, `users`, and `supplier_products` tables:

```sql
CREATE TYPE operation_day_status AS ENUM
  ('planned', 'in_progress', 'dispatched', 'school_confirmed', 'closed');
CREATE TYPE inventory_entry_type AS ENUM
  ('goods_receipt', 'consumption', 'waste', 'stock_opname_adjustment');

CREATE TABLE operation_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  menu_plan_id UUID NULL,
  operation_date DATE NOT NULL,
  status operation_day_status NOT NULL DEFAULT 'planned',
  closed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vendor_id, operation_date)
);

CREATE TABLE inventory_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  product_id UUID NOT NULL REFERENCES supplier_products(id),
  unit VARCHAR(32) NOT NULL,
  quantity_delta NUMERIC(14,3) NOT NULL CHECK (quantity_delta <> 0),
  entry_type inventory_entry_type NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  source_id UUID NOT NULL,
  actor_user_id UUID NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_type, source_id, entry_type)
);
```

Also create `menu_plans`, `menu_plan_items`, `incidents`, `audit_events`, `workflow_outbox`, `idempotency_records`, and `fund_projections`; add nullable `operation_day_id UUID REFERENCES operation_days(id)` to `checkpoint_events` and `delivery_tokens`. Write fully reversible `down` SQL in reverse dependency order.

Implement `IdempotencyService.execute<T>(input, command)` with this exact result contract:

```ts
type IdempotentResult<T> =
  | { replayed: false; statusCode: number; body: T }
  | { replayed: true; statusCode: number; body: T };
```

It locks/inserts the `(actorUserId, key)` row inside the passed transaction; same hash replays `response_body`, different hash throws `ConflictException`.

- [ ] **Step 4: Run migration and test**

Run: `pnpm db:migrate; pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts`

Expected: migration completes and the duplicate operation-day insert fails at the unique constraint.

- [ ] **Step 5: Commit the foundation**

```bash
git add apps/api/src/database/migrations/1711300000000-OperationDayWorkflow.ts apps/api/src/common apps/api/src/app.module.ts apps/api/test/operation-day-workflow.e2e-spec.ts
git commit -m "feat(api): add operation workflow foundation"
```

## Task 2: Build purchase orders and receipt-backed inventory

**Files:**

- Create: `apps/api/src/modules/orders/orders.module.ts`
- Create: `apps/api/src/modules/orders/orders.controller.ts`
- Create: `apps/api/src/modules/orders/orders.service.ts`
- Create: `apps/api/src/modules/orders/dto/create-order.dto.ts`
- Create: `apps/api/src/modules/orders/dto/reject-order.dto.ts`
- Create: `apps/api/src/modules/inventory/inventory.module.ts`
- Create: `apps/api/src/modules/inventory/inventory.service.ts`
- Create: `apps/api/src/modules/inventory/inventory.controller.ts`
- Create: `apps/api/src/modules/inventory/dto/create-opname.dto.ts`
- Modify: `apps/api/src/app.module.ts`
- Test: `apps/api/test/operation-day-workflow.e2e-spec.ts`

**Interfaces:**

- Consumes `IdempotencyService.execute`, supplier profile/product tables, vendor from `req.user.sub`, and `inventory_ledger`.
- Produces `OrdersService.receive(vendorUserId, orderId, key): Promise<PurchaseOrderResponse>` and `InventoryService.getCurrent(vendorUserId): Promise<InventoryBalance[]>`.
- `PurchaseOrderResponse.status` is exactly `'draft' | 'submitted' | 'accepted' | 'rejected' | 'dispatched' | 'received'`.

- [ ] **Step 1: Write failing PO lifecycle tests**

Add tests that create an order against a fixture product, use two authenticated agents, and assert ownership:

```ts
const created = await vendor
  .post("/orders")
  .set("Idempotency-Key", "po-001")
  .send({
    supplierId: fixture.supplierId,
    items: [{ productId: fixture.productId, quantity: 10 }],
  });
expect(created.status).toBe(201);
expect(created.body.status).toBe("submitted");

await supplier
  .post(`/orders/${created.body.id}/accept`)
  .set("Idempotency-Key", "po-accept-001")
  .expect(200);
await otherSupplier
  .post(`/orders/${created.body.id}/dispatch`)
  .set("Idempotency-Key", "po-dispatch-001")
  .expect(404);
```

- [ ] **Step 2: Run tests to verify endpoints do not exist**

Run: `pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts`

Expected: FAIL with `404` for `POST /orders`.

- [ ] **Step 3: Implement order commands and inventory writes**

Use the existing `purchase_orders` and `purchase_order_items` tables from `1710400000001-SupplierSchema.ts`; audit their actual enum column names before writing SQL. Add `orders` routes:

```ts
@Post()
create(@Req() req: RequestWithUser, @Body() dto: CreateOrderDto, @Headers('idempotency-key') key: string) {
  return this.orders.create(req.user.sub, dto, key);
}

@Post(':id/receive')
receive(@Req() req: RequestWithUser, @Param('id') id: string, @Headers('idempotency-key') key: string) {
  return this.orders.receive(req.user.sub, id, key);
}
```

`create` loads current supplier product prices inside a transaction and persists price snapshots to PO items. `accept`, `reject`, and `dispatch` lock the PO with `FOR UPDATE`, verify the address supplier, and apply only the allowed transition. `receive` locks the dispatched PO, writes one positive `goods_receipt` ledger entry per PO item, appends `order.received` audit/outbox rows, then returns the PO plus `eventId`.

Implement inventory balance query as:

```sql
SELECT product_id, unit, SUM(quantity_delta) AS quantity
FROM inventory_ledger
WHERE vendor_id = $1
GROUP BY product_id, unit
HAVING SUM(quantity_delta) <> 0;
```

`POST /inventory/opname` computes `quantity_delta = countedQuantity - currentBalance`, rejects an unchanged count with `422`, and records entry type `stock_opname_adjustment` plus mandatory `reason`.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts; pnpm --filter api typecheck`

Expected: PO only moves through allowed roles/states; first receipt increases stock once; same receipt idempotency key returns the original response.

- [ ] **Step 5: Commit procurement**

```bash
git add apps/api/src/modules/orders apps/api/src/modules/inventory apps/api/src/app.module.ts apps/api/test/operation-day-workflow.e2e-spec.ts
git commit -m "feat(api): add purchase order inventory flow"
```

## Task 3: Add menu plans and operation-day aggregate

**Files:**

- Create: `apps/api/src/modules/menu-plans/menu-plans.module.ts`
- Create: `apps/api/src/modules/menu-plans/menu-plans.controller.ts`
- Create: `apps/api/src/modules/menu-plans/menu-plans.service.ts`
- Create: `apps/api/src/modules/menu-plans/dto/upsert-menu-plan.dto.ts`
- Create: `apps/api/src/modules/operation-days/operation-days.module.ts`
- Create: `apps/api/src/modules/operation-days/operation-days.controller.ts`
- Create: `apps/api/src/modules/operation-days/operation-days.service.ts`
- Create: `apps/api/src/modules/operation-days/operation-day.types.ts`
- Modify: `apps/api/src/app.module.ts`
- Test: `apps/api/test/operation-day-workflow.e2e-spec.ts`

**Interfaces:**

- `MenuPlanItemDto` is `{ productId: string; unit: string; quantityPerPax: number }`.
- `OperationDaysService.create(vendorUserId, menuPlanId, operationDate, key)` returns `{ id, status: 'planned', allowedNext: ['CP1'] }`.
- `OperationDaysService.consumeForCp1(queryRunner, operationDayId, actorUserId)` either appends all `consumption` entries or throws `UnprocessableEntityException` without changing any balance.

- [ ] **Step 1: Write failing stock-shortage and one-day tests**

```ts
const menu = await vendor
  .post("/menu-plans")
  .set("Idempotency-Key", "menu-001")
  .send({
    operationDate: "2026-07-25",
    targetPax: 100,
    items: [{ productId: fixture.productId, unit: "kg", quantityPerPax: 0.25 }],
  });
expect(menu.status).toBe(201);

await vendor
  .post("/operation-days")
  .set("Idempotency-Key", "day-001")
  .send({ menuPlanId: menu.body.id })
  .expect(422);
```

Then receive enough goods and assert a second create call succeeds with `planned`, while a same-date create from the same vendor returns `409`.

- [ ] **Step 2: Run tests to verify routes do not exist**

Run: `pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts`

Expected: FAIL with `404` for `/menu-plans`.

- [ ] **Step 3: Implement menu requirements and operation-day state**

`POST /menu-plans` validates each item has a positive finite quantity and no duplicate `(productId, unit)` pair. The service calculates `requiredQuantity = targetPax * quantityPerPax`, joins with inventory balance, and returns each line as:

```ts
{
  productId: string;
  unit: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
}
```

`POST /operation-days` uses the menu's operation date and rejects any shortage with `UnprocessableEntityException({ code: 'INSUFFICIENT_INVENTORY', shortages })`. It locks the vendor/date row so concurrent creates produce one `planned` day. `GET /operation-days/today` returns the day, all linked status ids, and one `allowedNext` command derived from state; no page infers this itself.

- [ ] **Step 4: Run tests and inspect balances**

Run: `pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts; pnpm --filter api typecheck`

Expected: shortage returns `422` with material lines, sufficient inventory creates one planned day, and duplicate same-date creation returns `409`.

- [ ] **Step 5: Commit planning aggregate**

```bash
git add apps/api/src/modules/menu-plans apps/api/src/modules/operation-days apps/api/src/app.module.ts apps/api/test/operation-day-workflow.e2e-spec.ts
git commit -m "feat(api): add menu operation day flow"
```

## Task 4: Bind checkpoint, delivery, and school confirmation to operation day

**Files:**

- Modify: `apps/api/src/modules/checkpoints/checkpoints.service.ts`
- Modify: `apps/api/src/modules/checkpoints/checkpoints.controller.ts`
- Modify: `apps/api/src/modules/checkpoints/entities/checkpoint-event.entity.ts`
- Modify: `apps/api/src/modules/checkpoints/checkpoints.module.ts`
- Modify: `apps/api/src/modules/delivery/delivery.service.ts`
- Modify: `apps/api/src/modules/delivery/delivery.controller.ts`
- Modify: `apps/api/src/modules/delivery/delivery.module.ts`
- Modify: `apps/api/src/modules/school-confirm/school-confirm.service.ts`
- Modify: `apps/api/src/modules/school-confirm/school-confirm.module.ts`
- Test: `apps/api/test/operation-day-workflow.e2e-spec.ts`

**Interfaces:**

- Consumes `OperationDaysService.consumeForCp1`, `getRequiredActiveDay`, `markDispatched`, and `markSchoolConfirmed`.
- Checkpoint, delivery, and school-confirmation response DTOs add `operationDayId: string` and `eventId: string`.
- `POST /checkpoints/:cpType/submit` and mutable delivery endpoints require `Idempotency-Key` and a JWT owner; public school confirmation remains token-scoped but uses the token as its owner scope for idempotency.

- [ ] **Step 1: Write failing sequence and security tests**

Add these cases:

```ts
await vendor
  .post("/checkpoints/CP2/submit")
  .set(auth)
  .set("Idempotency-Key", "cp2-first")
  .attach("photo", fixture.photo)
  .expect(409);
await vendor
  .post("/checkpoints/CP1/submit")
  .set(auth)
  .set("Idempotency-Key", "cp1-ok")
  .attach("photo", fixture.photo)
  .expect(201);
await otherVendor
  .post("/delivery/" + fixture.token + "/arrived")
  .set(otherAuth)
  .send({})
  .expect(404);
await anonymous.post("/delivery/" + fixture.token + "/complete").expect(401);
```

After CP1, assert one negative `consumption` entry exists for each planned menu item and operation day is `in_progress`.

- [ ] **Step 2: Run tests to verify the legacy path is insufficient**

Run: `pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts`

Expected: CP2 currently returns legacy `400`, no consumption ledger is written, and delivery mutations allow anonymous access.

- [ ] **Step 3: Amend services inside shared transactions**

In `CheckpointsService.submitCheckpoint`, resolve the active operation day before the existing CP-order check. For CP1, call `consumeForCp1` in the same query runner transaction as checkpoint upsert; map an illegal sequence to `ConflictException` and shortage to `UnprocessableEntityException`. Store `operation_day_id` on the checkpoint. CP3 generates delivery tokens with `operation_day_id`; CP4 must resolve a completed delivery token for that day before writing evidence.

In `DeliveryController`, add `JwtAuthGuard` to `arrived`, `photo`, and `complete`; resolve vendor from `req.user.sub` and verify token ownership in service SQL (`WHERE token = $1 AND vendor_id = $2`). Require idempotency around arrived, photo, and complete.

In `SchoolConfirmService.confirm`, use one transaction that locks the token, verifies `completed_at`, writes confirmation, marks token used, and invokes `OperationDaysService.markSchoolConfirmed(queryRunner, operationDayId)`. A bad quantity or `kondisi: 'ada_masalah'` creates an incident and remains school-confirmed only if the confirmed quantity is non-negative; the exact mismatch remains visible in the incident.

- [ ] **Step 4: Run flow tests and legacy module tests**

Run: `pnpm --filter api test -- checkpoints.service.spec.ts; pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts; pnpm --filter api typecheck`

Expected: CP order is enforced with `409`; CP1 stock consumption is atomic; delivery mutations require owner JWT; valid confirmation transitions the same day to `school_confirmed` once.

- [ ] **Step 5: Commit workflow binding**

```bash
git add apps/api/src/modules/checkpoints apps/api/src/modules/delivery apps/api/src/modules/school-confirm apps/api/test/operation-day-workflow.e2e-spec.ts
git commit -m "feat(api): bind field flow to operation day"
```

## Task 5: Close the day and materialize projections

**Files:**

- Create: `apps/api/src/modules/workflow-projections/workflow-projections.module.ts`
- Create: `apps/api/src/modules/workflow-projections/workflow-projections.service.ts`
- Modify: `apps/api/src/modules/operation-days/operation-days.service.ts`
- Modify: `apps/api/src/modules/operation-days/operation-days.controller.ts`
- Modify: `apps/api/src/modules/scoring/scoring.service.ts`
- Modify: `apps/api/src/modules/funds/funds.service.ts`
- Modify: `apps/api/src/modules/funds/funds.controller.ts`
- Modify: `apps/api/src/app.module.ts`
- Test: `apps/api/test/operation-day-workflow.e2e-spec.ts`

**Interfaces:**

- `POST /operation-days/:id/close` returns `{ id, status: 'closed', scoreFinal: number, fundProjectionId: string, eventId: string }`.
- `WorkflowProjectionsService.materializeClose(queryRunner, operationDayId, correlationId): Promise<CloseProjection>` is idempotent by unique `fund_projections.operation_day_id`.
- `GET /funds/transactions` continues its existing response shape and additionally includes persisted `projected` records with `status: 'projected'`; no record is reported as paid.

- [ ] **Step 1: Write failing close/projection tests**

```ts
await vendor
  .post(`/operation-days/${dayId}/close`)
  .set(auth)
  .set("Idempotency-Key", "close-before-school")
  .expect(409);

const closed = await vendor
  .post(`/operation-days/${dayId}/close`)
  .set(auth)
  .set("Idempotency-Key", "close-001")
  .expect(200);
expect(closed.body.status).toBe("closed");
expect(closed.body.fundProjectionId).toEqual(expect.any(String));

const [projection] = await dataSource.query(
  "SELECT status FROM fund_projections WHERE operation_day_id = $1",
  [dayId],
);
expect(projection.status).toBe("projected");
```

- [ ] **Step 2: Run tests to verify close route is missing**

Run: `pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts`

Expected: FAIL with `404` for `POST /operation-days/:id/close`.

- [ ] **Step 3: Implement idempotent close effects**

`OperationDaysService.close` locks the day, checks `status = 'school_confirmed'`, sets `closed_at`, calls `ScoringService.finalizeScore`, calculates the existing `getDisbursementEstimate`, inserts `fund_projections(operation_day_id, vendor_id, amount, status='projected') ON CONFLICT DO NOTHING`, and writes audit/outbox event `operation.closed` in one transaction.

`WorkflowProjectionsService` reads committed outbox events and broadcasts `operation:closed`, creates a vendor notification, and writes one command-center alert when score is below 60. Amend `FundsService` so its transaction listing unions `payments` with `fund_projections` and labels projections without changing `totalTersalurkan`, which remains paid-only.

- [ ] **Step 4: Run projection tests and regression suite**

Run: `pnpm --filter api test -- scoring.service.spec.ts; pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts; pnpm --filter api typecheck`

Expected: close is rejected before school confirmation, valid close finalizes score and creates one projected—not paid—fund row, and replay creates no duplicates.

- [ ] **Step 5: Commit closing projection**

```bash
git add apps/api/src/modules/workflow-projections apps/api/src/modules/operation-days apps/api/src/modules/scoring apps/api/src/modules/funds apps/api/src/app.module.ts apps/api/test/operation-day-workflow.e2e-spec.ts
git commit -m "feat(api): project score and funds on close"
```

## Task 6: Publish the integration contract and final workflow proof

**Files:**

- Create: `apps/api/src/database/seeds/operation-day.seed.ts`
- Modify: `apps/api/src/database/seed-runner.ts`
- Modify: `apps/api/SEEDERS.md`
- Modify: `docs/rencana-orang-1-platform-api.md`
- Test: `apps/api/test/operation-day-workflow.e2e-spec.ts`

**Interfaces:**

- Seed produces fixed role accounts, one vendor, one supplier, one product, one school, and a documented completed operation day without duplicate records on repeated invocation.
- API contract lists method, route, role, request JSON, success JSON, and error codes for every Task 2–5 command.

- [ ] **Step 1: Write failing idempotent-seed assertion**

Add a test/script assertion that runs the seed twice and verifies one fixture PO, one `goods_receipt` ledger row, one operation day, and one fund projection for their fixed external ids.

- [ ] **Step 2: Run test to verify seed has not been registered**

Run: `pnpm --filter api db:seed; pnpm --filter api db:seed`

Expected: fixture is absent before registration or the second run creates duplicates.

- [ ] **Step 3: Implement seed and contract examples**

Register `operation-day.seed.ts` after supplier/demo seeds. Make every insert use stable unique values and `ON CONFLICT`/lookup behavior. Add compact request/response examples to `SEEDERS.md` and the Orang 1 plan for:

```json
{
  "menuPlanId": "11111111-1111-1111-1111-111111111111"
}
```

and close response:

```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "status": "closed",
  "scoreFinal": 92,
  "fundProjectionId": "33333333-3333-3333-3333-333333333333",
  "eventId": "44444444-4444-4444-4444-444444444444"
}
```

- [ ] **Step 4: Run the final API verification**

Run: `pnpm db:migrate; pnpm --filter api db:seed; pnpm --filter api db:seed; pnpm --filter api test:e2e -- operation-day-workflow.e2e-spec.ts; pnpm --filter api test; pnpm --filter api lint; pnpm --filter api typecheck`

Expected: migration succeeds on a clean database, repeated seed remains idempotent, all API tests/lint/typecheck pass, and the e2e scenario proves PO through fund projection/audit without any duplicate side effects.

- [ ] **Step 5: Commit handoff and verification evidence**

```bash
git add apps/api/src/database/seeds/operation-day.seed.ts apps/api/src/database/seed-runner.ts apps/api/SEEDERS.md docs/rencana-orang-1-platform-api.md apps/api/test/operation-day-workflow.e2e-spec.ts
git commit -m "docs(api): publish operation workflow contract"
```

## Plan Self-Review

- Spec coverage: Tasks 1–2 cover durable PO, receipt, inventory, idempotency, audit/outbox; Task 3 covers menus and operation day; Task 4 binds CP/delivery/school; Task 5 covers score/funds/realtime/notifications; Task 6 covers seed, contract, and full evidence.
- Scope: real payment/webhook/AI-provider changes remain explicitly absent; fund rows are projections only.
- Type consistency: all task references use `operationDayId`, `Idempotency-Key`, `OperationDaysService.consumeForCp1`, and `WorkflowProjectionsService.materializeClose` with the signatures defined above.
- Placeholder scan: no deferred implementation markers; every task contains concrete target files, tests, commands, and state/error behavior.
