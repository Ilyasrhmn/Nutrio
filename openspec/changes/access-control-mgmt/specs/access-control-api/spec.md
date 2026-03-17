## ADDED Requirements

### Requirement: Role Management API Endpoints
The system SHALL provide RESTful API endpoints for role management.

#### Scenario: GET /api/v1/roles
- **WHEN** client sends GET request to /api/v1/roles
- **THEN** the system SHALL return paginated list of all roles with permission counts

#### Scenario: GET /api/v1/roles/:id
- **WHEN** client sends GET request to /api/v1/roles/:id with valid role ID
- **THEN** the system SHALL return the role with full permission details

#### Scenario: POST /api/v1/roles
- **WHEN** admin sends POST request to /api/v1/roles with valid role data
- **THEN** the system SHALL create the role and return 201 Created with role object

#### Scenario: PUT /api/v1/roles/:id
- **WHEN** admin sends PUT request to /api/v1/roles/:id with updated data
- **THEN** the system SHALL update the role and return the updated object

#### Scenario: DELETE /api/v1/roles/:id
- **WHEN** admin sends DELETE request to /api/v1/roles/:id for role without users
- **THEN** the system SHALL delete the role and return 204 No Content

#### Scenario: GET /api/v1/roles/:id/permissions
- **WHEN** client sends GET request to /api/v1/roles/:id/permissions
- **THEN** the system SHALL return all permissions assigned to the role

#### Scenario: POST /api/v1/roles/:id/permissions
- **WHEN** admin sends POST request to /api/v1/roles/:id/permissions with permission IDs
- **THEN** the system SHALL assign the permissions to the role

#### Scenario: DELETE /api/v1/roles/:id/permissions/:permissionId
- **WHEN** admin sends DELETE request to remove a permission from role
- **THEN** the system SHALL remove the permission assignment

### Requirement: Permission Management API Endpoints
The system SHALL provide RESTful API endpoints for permission management.

#### Scenario: GET /api/v1/permissions
- **WHEN** client sends GET request to /api/v1/permissions
- **THEN** the system SHALL return all permissions grouped by subject

#### Scenario: GET /api/v1/permissions/:id
- **WHEN** client sends GET request to /api/v1/permissions/:id
- **THEN** the system SHALL return the permission details

#### Scenario: POST /api/v1/permissions
- **WHEN** admin sends POST request to /api/v1/permissions with action-subject pair
- **THEN** the system SHALL create the permission and return 201 Created

#### Scenario: PUT /api/v1/permissions/:id
- **WHEN** admin sends PUT request to /api/v1/permissions/:id with updated description
- **THEN** the system SHALL update the permission description

#### Scenario: DELETE /api/v1/permissions/:id
- **WHEN** admin sends DELETE request to /api/v1/permissions/:id not assigned to any role
- **THEN** the system SHALL delete the permission and return 204 No Content

### Requirement: Menu Management API Endpoints
The system SHALL provide RESTful API endpoints for menu management.

#### Scenario: GET /api/v1/menus
- **WHEN** client sends GET request to /api/v1/menus
- **THEN** the system SHALL return hierarchical menu structure

#### Scenario: GET /api/v1/menus/tree
- **WHEN** client sends GET request to /api/v1/menus/tree
- **THEN** the system SHALL return nested menu tree with children arrays

#### Scenario: GET /api/v1/menus/user
- **WHEN** authenticated user sends GET request to /api/v1/menus/user
- **THEN** the system SHALL return menu items visible to the user's role

#### Scenario: POST /api/v1/menus
- **WHEN** admin sends POST request to /api/v1/menus with menu data
- **THEN** the system SHALL create the menu item and return 201 Created

#### Scenario: PUT /api/v1/menus/:id
- **WHEN** admin sends PUT request to /api/v1/menus/:id with updated data
- **THEN** the system SHALL update the menu item

#### Scenario: DELETE /api/v1/menus/:id
- **WHEN** admin sends DELETE request to /api/v1/menus/:id without children
- **THEN** the system SHALL delete the menu item and return 204 No Content

#### Scenario: POST /api/v1/menus/:id/roles
- **WHEN** admin sends POST request to assign roles to menu
- **THEN** the system SHALL create role-menu associations

#### Scenario: DELETE /api/v1/menus/:id/roles/:roleId
- **WHEN** admin sends DELETE request to remove role from menu
- **THEN** the system SHALL delete the role-menu association

### Requirement: Access Control Guards
The system SHALL protect API endpoints with appropriate authorization guards.

#### Scenario: Admin-only endpoint access
- **WHEN** non-admin user sends request to admin-only endpoint
- **THEN** the system SHALL return 403 Forbidden

#### Scenario: Authenticated endpoint access
- **WHEN** unauthenticated user sends request to protected endpoint
- **THEN** the system SHALL return 401 Unauthorized

#### Scenario: Valid admin access
- **WHEN** admin with ADMIN_BGN role sends request to admin endpoint
- **THEN** the system SHALL process the request normally

### Requirement: API Response Format
The system SHALL use consistent response formats for all access control endpoints.

#### Scenario: Successful list response
- **WHEN** client requests a list of resources
- **THEN** the system SHALL return paginated response with items, total, page, limit fields

#### Scenario: Successful create response
- **WHEN** client creates a resource
- **THEN** the system SHALL return 201 with created resource and Location header

#### Scenario: Validation error response
- **WHEN** client sends invalid data
- **THEN** the system SHALL return 400 with validation error details

#### Scenario: Not found response
- **WHEN** client requests non-existent resource
- **THEN** the system SHALL return 404 with error message

#### Scenario: Conflict response
- **WHEN** client creates duplicate resource
- **THEN** the system SHALL return 409 Conflict with error details

### Requirement: API Caching Headers
The system SHALL implement caching for menu and permission endpoints.

#### Scenario: Cache menu response
- **WHEN** client requests /api/v1/menus/user
- **THEN** the system SHALL include Cache-Control header with max-age=300 (5 minutes)

#### Scenario: Cache invalidation on update
- **WHEN** admin updates a menu item
- **THEN** the system SHALL invalidate cached menu responses

#### Scenario: ETag support
- **WHEN** client requests menu with If-None-Match header
- **THEN** the system SHALL return 304 Not Modified if data unchanged
