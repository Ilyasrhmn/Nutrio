# Contract issue: vendor income/expense bookkeeping

**Requested by:** Orang 2 (web) — needed for Sprint 3 `portal/funds` (vendor view)
**Owner:** Orang 1 (apps/api)
**Status:** open

## Why

`apps/web/components/funds/vendor-funds.tsx` is a vendor's personal ledger of dana masuk
(APBN disbursement) vs pengeluaran operasional (bahan baku, gaji, dll). There is no backend
module for either side of this today, so it's currently a local-only draft persisted to
`localStorage` — nothing syncs across devices or is visible to anyone else (e.g. an
inspector auditing the vendor's spending).

Two separate gaps, worth splitting:

## Gap 1 — vendor-scoped income read

`GET /funds/transactions` already returns `payments` rows joined to `vendors.business_name`,
but it is **not scoped by role** — any authenticated user can see every vendor's payment
history (checked directly: `FundsController` has no vendor-id filter or ownership check).
That's both a missing feature (a vendor can't cleanly get "my income") and a data exposure
issue worth fixing regardless of this feature request.

### Requested: `GET /funds/my` (vendor role)
Returns the same shape as `FundTransaction` in `funds.service.ts`, filtered to
`WHERE v.user_id = req.user.id`.

## Gap 2 — vendor expense tracking (new)

No table exists for this. Requested minimal shape, mirroring the `inventory_ledger` /
`purchase_orders` conventions already in the codebase (idempotency key on writes, audit
event on mutation):

### `vendor_expenses` table
```
id, vendor_id, category (bahan_baku|gaji|operasional|pajak_retribusi|lainnya),
amount, description, expense_date, created_at
```

### `POST /vendor-expenses` (vendor role, idempotency-key required)
Body: `{ category, amount, description?, expenseDate }`

### `GET /vendor-expenses` (vendor role)
Own expenses only, `?dateFrom&dateTo` optional filters.

### `DELETE /vendor-expenses/:id` (vendor role, own records only)

## Acceptance test

1. Vendor A calls `GET /funds/my` and only sees their own payments, not vendor B's.
2. Vendor logs a Rp150.000 "bahan_baku" expense, `GET /vendor-expenses` reflects it, and it
   persists across a fresh login (not local-only).
