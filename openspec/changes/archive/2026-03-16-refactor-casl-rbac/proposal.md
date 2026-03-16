## Why

Currently, the implementation of CASL for Role-Based Access Control (RBAC) in this project uses dummy data and lacks consistency and clarity. To ensure a robust and secure system, it is necessary to implement a consistent RBAC mechanism across the application, particularly in the backend, and completely remove all instances of dummy data used for RBAC.

## What Changes

- Remove all dummy data related to CASL RBAC from the project.
- Implement a consistent, database-backed (or token-based/service-backed) RBAC system using CASL in the backend.
- Standardize the way permissions and abilities are defined and enforced across both the backend (NestJS APIs) and frontend (Next.js web client).

## Capabilities

### New Capabilities
- `rbac-implementation`: Defines the standardized behavior for defining and checking roles and permissions using CASL in the backend, ensuring no dummy data is used.

### Modified Capabilities

## Impact

- **Backend (NestJS)**: Guards, controllers, and services will be updated to fetch and enforce real permissions instead of relying on dummy data.
- **Frontend (Next.js)**: The `casl.ts` implementation will be updated to use real permissions provided by the backend, likely retrieved via the authentication token or a specific API endpoint.
- **Data Models**: Potential updates to the database schema or authentication flow to properly associate users with their actual roles and permissions.
