## 1. Sidebar Refactoring

- [x] 1.1 Update `apps/web/app/portal/layout.tsx` to expand the Monitoring cluster into 5 distinct sub-menus.
- [x] 1.2 Implement smart status indicators (alert icons) for pending incidents in the sidebar items.

## 2. Integrated Incident Hub

- [x] 2.1 Refactor `apps/web/app/portal/incidents/page.tsx` using Shadcn Tabs (Operasional vs Teknis).
- [x] 2.2 Migrate operational incident flow (Live Camera + AI) into the first tab.
- [x] 2.3 Implement the Technical Bug Reporting interface with form fields and simulated screenshot capture.

## 3. Technical Self-Diagnostic

- [x] 3.1 Build the Health Check component to simulate scanning of GPS, Camera, and Network status.
- [x] 3.2 Implement the automated diagnostic sequence triggered on Technical tab activation.
- [x] 3.3 Integrate diagnostic results into the final report payload.

## 4. Documentation & UX Polish

- [x] 4.1 Clean up `apps/web/app/portal/sop/page.tsx` to focus purely on static documentation.
- [x] 4.2 Perform a final pass on all Monitoring pages to ensure UI consistency and professional standard layouts.
