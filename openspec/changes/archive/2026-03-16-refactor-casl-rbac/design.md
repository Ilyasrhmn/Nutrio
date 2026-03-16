## Context

Currently, the RBAC implementation in the Next.js frontend (`apps/web/lib/casl.ts`) and NestJS backend uses hardcoded or dummy data for evaluating user permissions. This creates a security risk and inconsistency, as real permissions should be determined by the user's role and database-backed rules rather than static dummy arrays. The goal is to enforce real roles and permissions uniformly using CASL.

## Goals / Non-Goals

**Goals:**
- Replace dummy data in the NestJS backend with dynamic, database-backed (or token-provided) permissions.
- Implement a global or module-specific CASL factory in the backend to construct abilities per user.
- Update the Next.js frontend to construct abilities based on data provided by the backend (e.g., through `/api/auth/me` or similar endpoints).
- Ensure a consistent set of actions and subjects across both platforms.

**Non-Goals:**
- Implementing a full UI for managing roles and permissions (this is just the enforcement mechanism).
- Refactoring the entire authentication strategy (assuming standard JWT or session auth is already in place).

## Decisions

- **Shared Types**: Use the `packages/common` workspace to define the standard Actions (e.g., `manage`, `create`, `read`, `update`, `delete`) and Subjects (e.g., `User`, `Report`, `all`) so both frontend and backend share the exact same definitions.
- **Backend CASL Factory**: Implement a `CaslAbilityFactory` provider in NestJS that takes a User object and returns a `MongoAbility` or `PureAbility`. It will define `can` and `cannot` rules based on the user's assigned role (e.g., `ADMIN`, `USER`).
- **Guards / Decorators**: Create custom decorators (e.g., `@CheckPolicies()`) and a `PoliciesGuard` in NestJS to automatically check abilities on protected routes.
- **Frontend Sync**: The frontend will receive a serialized list of abilities or simply the user's role upon login, and the frontend CASL setup will mirror the backend's logic or directly consume the serialized rules to build the `Ability` object.

## Risks / Trade-offs

- **Risk:** Slight performance overhead in evaluating policies on every request.
  - **Mitigation:** Keep policy evaluation logic simple and avoid excessive database lookups during evaluation (load roles into the JWT or session instead).
- **Risk:** Duplication of ability definitions if not careful.
  - **Mitigation:** Share action and subject types in the `packages/common` package and possibly a shared function to construct rules if feasible.
