# Contract issue: vendor coordinates for distribution map

**Requested by:** Orang 2 (web) — needed for Sprint 3 `portal/map`
**Owner:** Orang 1 (apps/api)
**Status:** open

## Why

`apps/web/app/portal/(admin)/map/page.tsx` lists vendors from `GET /command-center/vendors`
(real data — name, score, checkpoints done) but cannot plot them on the map because that
endpoint has no coordinates, and no other endpoint exposes vendor/kitchen lat/lng. The
`suppliers` table has a `coordinates` PostGIS column (see
`suppliers.service.ts#updateMyProfile`) but the equivalent doesn't exist for `vendors` /
`sppg_locations`, or isn't exposed if it does.

## Requested change

Either:
- **Add `lat`/`lng` to `GET /command-center/vendors`** if `sppg_locations` (or `vendors`)
  already stores coordinates, pulled the same way `suppliers.service.ts` does with
  `ST_Y(coordinates::geometry)` / `ST_X(...)`, or
- **Add a `coordinates` column to `sppg_locations`** (migration) if it doesn't exist yet,
  populated at onboarding, then expose it the same way.

Response shape addition to the existing `GET /command-center/vendors` array items:
```json
{
  "vendorId": "uuid",
  "vendorName": "string",
  "score": 0,
  "cpDone": 0,
  "hasData": true,
  "lat": -6.2,
  "lng": 106.8
}
```
`lat`/`lng` should be `null` (not omitted) when a vendor hasn't set a location yet, so the
frontend can distinguish "no location" from "field doesn't exist" and keep showing those
vendors in the list without a pin.

## Acceptance test

1. `GET /command-center/vendors` returns `lat`/`lng` for at least one seeded vendor.
2. Map page plots that vendor's pin at the real coordinate instead of showing the
   "location data not available" empty state.
