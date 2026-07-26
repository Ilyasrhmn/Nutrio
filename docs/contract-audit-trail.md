# Contract issue: cross-vendor audit trail endpoint

**Requested by:** Orang 2 (web) — needed for Sprint 3 `portal/audit`
**Owner:** Orang 1 (apps/api)
**Status:** open

## Why

`apps/web/app/portal/(admin)/audit/page.tsx` is currently an explicit "not available yet"
state. `audit_events` already exists (migration `1711300000000-OperationDayWorkflow.ts`) and
is written to by `AuditService.record()` for every order/inventory/menu-plan/operation-day
mutation — but nothing reads it back. There's also no `incidents` read endpoint despite the
`incidents` table existing, which blocks the command-center drill-down
(`apps/web/app/portal/(admin)/command-center/page.tsx`) from showing incident history per
vendor.

## Requested endpoints

### `GET /audit/events` (admin/inspector role)
Query params: `vendorId?`, `aggregateType?` (`purchase_order` | `inventory` | `menu_plan` |
`operation_day` | `checkpoint`), `dateFrom?`, `dateTo?`, `page?`, `limit?`.

Response, same envelope as other list endpoints in this repo:
```json
{
  "data": [
    {
      "id": "uuid",
      "actorUserId": "uuid",
      "actorName": "string",
      "aggregateType": "purchase_order",
      "aggregateId": "uuid",
      "action": "order.submitted",
      "afterPayload": {},
      "correlationId": "uuid",
      "createdAt": "ISO8601"
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 20
}
```
`actorName` needs a join to `users` — the raw table only has `actor_user_id`.

### `GET /incidents` (admin/inspector role)
Query params: `vendorId?`, `status?` (`open` | `acknowledged` | `resolved`), `page?`, `limit?`.
Returns the existing `incidents` table rows (vendor_id, operation_day_id, severity, reason,
status, timestamps) — no new columns needed, just a read path.

### `PATCH /incidents/:id` (admin/inspector role)
Body: `{ "status": "acknowledged" | "resolved" }`. Needed so admin can action the drill-down
instead of just viewing it.

## Acceptance test

1. Admin opens `/portal/audit`, sees real events ordered newest-first, can filter by vendor.
2. Admin opens command-center vendor detail, incident list for that vendor shows and can be
   acknowledged/resolved without a page reload.
