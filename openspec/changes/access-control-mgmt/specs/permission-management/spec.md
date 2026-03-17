## ADDED Requirements

### Requirement: Permission Definition Management
The system SHALL provide CRUD operations for defining granular permissions.

#### Scenario: Create new permission
- **WHEN** an admin defines a new permission with action-subject pair
- **THEN** the system SHALL create the permission with unique identifier

#### Scenario: List all permissions
- **WHEN** a user requests the permissions list
- **THEN** the system SHALL return all permissions grouped by subject

#### Scenario: Get permission details
- **WHEN** a user requests a specific permission by ID
- **THEN** the system SHALL return the permission with action, subject, and description

#### Scenario: Update permission description
- **WHEN** an admin updates a permission's description
- **THEN** the system SHALL update the description without affecting role assignments

#### Scenario: Prevent delete assigned permission
- **WHEN** an admin attempts to delete a permission assigned to any role
- **THEN** the system SHALL reject the deletion with a list of roles using it

### Requirement: Action and Subject Management
The system SHALL maintain a controlled vocabulary of actions and subjects.

#### Scenario: Define available actions
- **WHEN** the system initializes
- **THEN** it SHALL provide the standard actions: create, read, update, delete, view, manage

#### Scenario: Add custom action
- **WHEN** an admin defines a new action type
- **THEN** the system SHALL validate it doesn't conflict with existing actions

#### Scenario: Define available subjects
- **WHEN** the system initializes
- **THEN** it SHALL provide subjects matching application modules: Dashboard, Map, Funds, Menu, LiveExecution, Logistics, Checkpoints, Audit, Reports, Marketplace, Settings, User, Role, Permission

#### Scenario: Add custom subject
- **WHEN** an admin defines a new subject
- **THEN** the system SHALL validate it follows naming conventions (PascalCase, no spaces)

### Requirement: Permission Validation
The system SHALL validate permission definitions to prevent invalid configurations.

#### Scenario: Validate action-subject pair uniqueness
- **WHEN** creating a permission with an existing action-subject combination
- **THEN** the system SHALL reject the duplicate

#### Scenario: Validate action format
- **WHEN** creating a permission with invalid action
- **THEN** the system SHALL reject actions not in the allowed list

#### Scenario: Validate subject format
- **WHEN** creating a permission with invalid subject format
- **THEN** the system SHALL reject subjects that don't match PascalCase pattern

### Requirement: Permission Description and Documentation
The system SHALL provide human-readable descriptions for all permissions.

#### Scenario: Add permission description
- **WHEN** creating or updating a permission
- **THEN** the system SHALL require a description explaining what the permission grants

#### Scenario: View permission usage
- **WHEN** an admin views a permission
- **THEN** the system SHALL display which roles have this permission assigned
