## 1. Sidebar & Foundation (Monitoring-Sidebar & RBAC)

- [x] 1.1 Add 'Monitoring' to `AppSubject` in `packages/common/src/types/casl.ts`.
- [x] 1.2 Update `apps/web/lib/casl.ts` to grant 'read' access to 'Monitoring' for relevant roles.
- [x] 1.3 Refactor `apps/web/app/portal/layout.tsx` to include the "Monitoring & Kepatuhan AI" dropdown with its 4 sub-menus.
- [x] 1.4 Implement the visual status dots (Green/Yellow/Red) in the sidebar logic.

## 2. Skor & Performa (Operational-Health-Scoring)

- [x] 2.1 Update `apps/web/app/portal/checkpoints/page.tsx` with the new Health Bar UI and 100-point display.
- [x] 2.2 Implement the daily reset simulation logic and penalty calculation UI.
- [x] 2.3 Add the "Gold Vendor" streak counter and badge visualization.
- [x] 2.4 Implement the "Manual Review" lock logic for scores below 75.

## 3. Eksekusi Checkpoint (Live-Checkpoint-Execution)

- [x] 3.1 Revamp `apps/web/app/portal/live/page.tsx` to use context-aware task cards (only current CP is active).
- [x] 3.2 Implement the 4-hour "Golden Rule" countdown timer triggered after CP2.
- [x] 3.3 Add the high-urgency visual warnings (Flash Red) for expiring safety windows.

## 4. Pusat Kendali Insiden (Fraud-Proof-Incidents)

- [x] 4.1 Create the new page `apps/web/app/portal/incidents/page.tsx`.
- [x] 4.2 Implement the "Lapor Kendala" interface with mandatory live camera access (no gallery).
- [x] 4.3 Add the AI validation simulation and GPS/Timestamp metadata display.
- [x] 4.4 Implement the -50 point "Fraud Penalty" warning UI.

## 5. Pusat Panduan & Audit (Integrated-SOP-Manual)

- [x] 5.1 Create the new page `apps/web/app/portal/sop/page.tsx` with Tab-based documentation.
- [x] 5.2 Implement the "Arsip Validasi AI" page at `apps/web/app/portal/audit/page.tsx`.
- [x] 5.3 Add contextual help icons (Tooltips) to the Scoring and Checkpoint pages for rule explanations.
