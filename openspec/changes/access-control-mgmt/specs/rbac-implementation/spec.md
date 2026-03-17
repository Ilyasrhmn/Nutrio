## MODIFIED Requirements

### Requirement: Database-backed Role Evaluation
The system MUST evaluate user permissions dynamically from the database using the new Role, Permission, and RolePermission entities, with caching in JWT payload and Redis.

**Previous behavior:** Permissions evaluated from hardcoded switch statements in CaslAbilityFactory.

**New behavior:** Permissions loaded from database associations with caching layer.

#### Scenario: User login with permissions
- **WHEN** a user successfully logs in
- **THEN** their role and permissions are fetched from database and included in JWT payload

#### Scenario: Permission caching
- **WHEN** user makes subsequent requests
- **THEN** permissions are read from JWT claims without database queries

#### Scenario: Cache invalidation on role change
- **WHEN** admin modifies a role's permissions
- **THEN** Redis cache is invalidated and affected users receive updated permissions on next request

#### Scenario: Fallback to database
- **WHEN** JWT token doesn't contain full permissions (legacy token)
- **THEN** the system SHALL fetch permissions from database and update JWT

### Requirement: Shared Permissions Definitions
The system MUST share permission definitions (Actions and Subjects) between the backend and frontend through the @workspace/common package, with database-backed permission registry.

#### Scenario: Database permission registry
- **WHEN** the application starts
- **THEN** it SHALL sync available actions and subjects from @workspace/common to the permissions table

#### Scenario: Permission synchronization
- **WHEN** new actions or subjects are added to @workspace/common
- **THEN** migration scripts SHALL update the permissions table accordingly

### Requirement: Removal of Dummy Data
The system MUST NOT use any hardcoded permission arrays or switch statements for role definitions. All permissions MUST be database-driven with feature flag migration path.

#### Scenario: Feature flag migration
- **WHEN** USE_DB_PERMISSIONS flag is enabled
- **THEN** the system SHALL load permissions from database only

#### Scenario: Hardcoded logic removal
- **WHEN** migration is complete and validated
- **THEN** all hardcoded role-permission switch statements SHALL be removed from CaslAbilityFactory

#### Scenario: Backward compatibility
- **WHEN** USE_DB_PERMISSIONS flag is disabled
- **THEN** the system SHALL fall back to hardcoded CaslAbilityFactory behavior for rollback

## ADDED Requirements

### Requirement: CASL Ability Factory Database Integration
The system SHALL update CaslAbilityFactory to load permissions from database instead of hardcoded definitions.

#### Scenario: Load role permissions from database
- **WHEN** createForUser() is called with a role
- **THEN** the factory SHALL fetch permissions from RolePermission join table

#### Scenario: Build CASL ability from database permissions
- **WHEN** permissions are loaded from database
- **THEN** the factory SHALL construct CASL can/cannot rules dynamically

#### Scenario: Handle missing role in database
- **WHEN** a role exists in code but not in database
- **THEN** the system SHALL log warning and return empty permissions

### Requirement: Permission Caching Layer
The system SHALL implement Redis caching for permission lookups to reduce database load.

#### Scenario: Cache permissions on login
- **WHEN** user logs in successfully
- **THEN** permissions SHALL be cached in Redis with 5-minute TTL

#### Scenario: Cache lookup
- **WHEN** permissions are requested for a role
- **THEN** the system SHALL check Redis cache before querying database

#### Scenario: Cache invalidation
- **WHEN** role permissions are modified
- **THEN** all cached permissions for that role SHALL be invalidated

### Requirement: JWT Permission Claims
The system SHALL include user permissions in JWT payload to enable stateless permission checks.

#### Scenario: Include permissions in JWT
- **WHEN** generating JWT token on login
- **THEN** the system SHALL include role and permission array in token payload

#### Scenario: Validate JWT permissions
- **WHEN** processing authenticated request
- **THEN** the system SHALL extract permissions from JWT and construct CASL ability

#### Scenario: JWT size management
- **WHEN** user has many permissions (>50)
- **THEN** the system SHALL store permission hashes in JWT and full permissions in Redis
