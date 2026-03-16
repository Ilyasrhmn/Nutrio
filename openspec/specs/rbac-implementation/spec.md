# Capability: rbac-implementation

## Purpose

This capability defines the standardized Role-Based Access Control (RBAC) implementation using CASL across the VendorTrack application. It ensures consistent permission evaluation between backend and frontend, with database-backed role evaluation and no hardcoded dummy data.

## Requirements

### Requirement: Database-backed Role Evaluation
The system MUST evaluate user permissions dynamically based on the role assigned to the user in the database or authentication token, without relying on hardcoded dummy data.

#### Scenario: User login
- **WHEN** a user successfully logs in
- **THEN** their role is fetched and included in the authentication payload or session.

#### Scenario: API request
- **WHEN** an authenticated user makes a request to a protected API endpoint
- **THEN** the system MUST evaluate their permissions using a CASL Ability Factory based on their actual role.

### Requirement: Shared Permissions Definitions
The system MUST share permission definitions (Actions and Subjects) between the backend and frontend to ensure consistency.

#### Scenario: Shared actions and subjects
- **WHEN** defining permissions
- **THEN** both the frontend and backend MUST reference the exact same types defined in the `packages/common` workspace.

### Requirement: Removal of Dummy Data
The system MUST NOT use any dummy or hardcoded permission data arrays in the application codebase for evaluating access control.

#### Scenario: Code execution
- **WHEN** the application starts or evaluates permissions
- **THEN** it MUST exclusively use dynamic roles and permissions, with all dummy implementations completely removed from both backend and frontend code.
