# Contract issue: Purchase Order (PO) endpoints

**Requested by:** Orang 2 (web/PWA) — needed for Sprint 1 marketplace checkout
**Owner:** Orang 1 (apps/api)
**Status:** open — blocking real PO submission in `apps/web` marketplace and `apps/pwa` orders

## Why

`apps/web/app/portal/(vendor)/marketplace/[supplierId]/page.tsx` lets a vendor build a
cart from real supplier products, but the "Buat Purchase Order" button is disabled —
there is no backend endpoint to submit it to. A `purchase_orders` table already exists
(migration `1710400000001-SupplierSchema.ts`, seeded with PO-001/PO-002 in
`marketplace-supplier.seed.ts`), but no controller exposes it.

`apps/pwa/app/orders/page.tsx` currently reads checkpoint data instead of PO data
because there is nothing else to read (see doc P0 finding "Jalur pembelian salah
semantik").

## Requested endpoints

### `POST /purchase-orders` (vendor role)
Create a PO from a cart.

Request body:
```json
{
  "supplierId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 25 }
  ],
  "notes": "optional string"
}
```

Response (201):
```json
{
  "id": "uuid",
  "poNumber": "PO-2026-0001",
  "supplierId": "uuid",
  "status": "pending_confirmation",
  "items": [
    { "productId": "uuid", "name": "...", "quantity": 25, "unit": "kg", "pricePerUnit": 12500, "subtotal": 312500 }
  ],
  "totalAmount": 312500,
  "createdAt": "ISO8601"
}
```

Validation the frontend needs surfaced as 4xx (not silently accepted):
- product out of stock / quantity below `min_order_qty`
- product belongs to a different supplier than `supplierId`
- price mismatch (client-cached price vs current price) — return current price so UI can show "price changed, please review"

### `GET /purchase-orders` (vendor: own POs, supplier: POs addressed to them)
List with `status`, `page`, `limit` query params. Same envelope shape as `GET /suppliers`
(`{ data, total, page, limit }`) for consistency.

### `GET /purchase-orders/:id`
Full detail incl. items, status history/timeline, supplier + vendor summary.

### `PATCH /purchase-orders/:id/status` (supplier: confirm/reject/ship; vendor: cancel while `pending_confirmation`)
Body: `{ "status": "confirmed" | "rejected" | "shipped" | "delivered" | "cancelled", "reason"?: string }`
Should enforce a state machine server-side (reject invalid transitions with 409) — the
frontend will disable actions based on current status but must not be the only guard.

## Acceptance test

1. Vendor adds 2 products from one supplier to cart, submits PO → `201`, PO appears in
   `GET /purchase-orders` for that vendor and in the supplier's queue.
2. Vendor submits PO with a quantity below a product's `min_order_qty` → `400` with a
   message the UI can show inline (not a generic 500).
3. Supplier calls `PATCH /purchase-orders/:id/status` with `confirmed` → vendor's
   `GET /purchase-orders/:id` reflects the new status without a page reload once the
   frontend polls/refetches.
4. Vendor attempts to cancel a PO that's already `shipped` → `409`, not silently ignored.

## What the frontend already does while waiting

- `apps/web` marketplace detail page keeps a local cart and shows a disabled
  "Buat Purchase Order (Segera Hadir)" button with an explanatory note instead of
  faking a success toast.
- `apps/pwa/app/orders/page.tsx` is unchanged pending this contract (see task in
  main tracking); it will keep reading checkpoint data with an honest label until
  real PO data exists.
