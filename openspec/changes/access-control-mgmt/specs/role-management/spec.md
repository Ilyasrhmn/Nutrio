## ADDED Requirements

### Requirement: Role CRUD Operations
The system SHALL provide complete CRUD operations for managing roles in the database.

#### Scenario: Create new role
- **WHEN** an admin creates a new role with a unique name and description
- **THEN** the system SHALL create the role and return the role object with generated ID

#### Scenario: List all roles
- **WHEN** a user requests the roles list
- **THEN** the system SHALL return all roles with their associated permission counts

#### Scenario: Get role details
- **WHEN** a user requests a specific role by ID
- **THEN** the system SHALL return the role with all assigned permissions

#### Scenario: Update role
- **WHEN** an admin updates a role's name or description
- **THEN** the system SHALL update the role and propagate changes to affected users

#### Scenario: Delete role
- **WHEN** an admin deletes a role that has no assigned users
- **THEN** the system SHALL delete the role and its permission associations

#### Scenario: Prevent delete role with users
- **WHEN** an admin attempts to delete a role that has assigned users
- **THEN** the system SHALL reject the deletion with an error message indicating users must be reassigned first

### Requirement: Role-Permission Assignment
The system SHALL allow assigning and removing permissions to/from roles.

#### Scenario: Assign permission to role
- **WHEN** an admin assigns a permission to a role
- **THEN** the system SHALL create the association and update all users with that role immediately

#### Scenario: Remove permission from role
- **WHEN** an admin removes a permission from a role
- **THEN** the system SHALL delete the association and update all users with that role

#### Scenario: Bulk assign permissions
- **WHEN** an admin assigns multiple permissions to a role at once
- **THEN** the system SHALL create all associations in a single transaction

### Requirement: Role Validation
The system SHALL validate role data to maintain integrity.

#### Scenario: Prevent duplicate role names
- **WHEN** creating or updating a role with a name that already exists
- **THEN** the system SHALL reject the operation with a uniqueness error

#### Scenario: Prevent reserved name usage
- **WHEN** attempting to create a role with a reserved name (e.g., 'admin', 'superuser')
- **THEN** the system SHALL reject the operation with a validation error

#### Scenario: Validate role name format
- **WHEN** creating a role with invalid characters in the name
- **THEN** the system SHALL reject names that don't match the pattern: lowercase letters, numbers, underscores only
