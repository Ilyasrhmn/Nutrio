## 1. Setup Shared Types

- [x] 1.1 Create or update CASL actions and subjects in `packages/common`
- [x] 1.2 Export these types so both frontend and backend can consume them

## 2. Backend Implementation (NestJS)

- [x] 2.1 Remove dummy data arrays from existing backend RBAC logic
- [x] 2.2 Implement `CaslAbilityFactory` that builds `MongoAbility` using the shared actions and subjects
- [x] 2.3 Create `@CheckPolicies()` decorator and `PoliciesGuard` to enforce CASL abilities on routes
- [x] 2.4 Update all relevant controllers and services to use the new CASL implementation
- [x] 2.5 Ensure the authentication process provides the correct role for ability building

## 3. Frontend Implementation (Next.js)

- [x] 3.1 Update `apps/web/lib/casl.ts` to use shared actions and subjects
- [x] 3.2 Remove dummy data arrays from the frontend CASL logic
- [x] 3.3 Modify the frontend CASL setup to build abilities based on user role/permissions retrieved from the backend (e.g., via session or `/api/auth/me`)
- [x] 3.4 Verify UI components are correctly hidden/shown based on the new dynamic abilities

## 4. Verification

- [x] 4.1 Run tests to ensure backend APIs properly block unauthorized access
- [x] 4.2 Manually verify frontend pages and components behave correctly based on dynamic roles
- [x] 4.3 Verify no remaining dummy data exists across the codebase
