## ADDED Requirements

### Requirement: Admin Layout and Navigation
The system SHALL provide a dedicated admin layout for access control management pages.

#### Scenario: Access admin section
- **WHEN** admin user navigates to /portal/admin
- **THEN** the system SHALL display admin dashboard with navigation sidebar

#### Scenario: Admin navigation menu
- **WHEN** admin views the navigation
- **THEN** it SHALL show links to: Roles, Permissions, Menus, with appropriate icons

#### Scenario: Admin-only route protection
- **WHEN** non-admin user attempts to access /portal/admin/*
- **THEN** the system SHALL redirect to /portal with "Access Denied" notification

### Requirement: Role Management Page
The system SHALL provide a UI for managing roles.

#### Scenario: View roles list
- **WHEN** admin navigates to /portal/admin/roles
- **THEN** the system SHALL display all roles in a table with name, description, permission count, actions

#### Scenario: Create new role
- **WHEN** admin clicks "New Role" and fills the form
- **THEN** the system SHALL create the role and show success notification

#### Scenario: Edit existing role
- **WHEN** admin clicks "Edit" on a role
- **THEN** the system SHALL open the role in edit mode with current data pre-filled

#### Scenario: Delete role
- **WHEN** admin clicks "Delete" on a role without users
- **THEN** the system SHALL show confirmation dialog and delete on confirm

#### Scenario: Prevent delete role with users
- **WHEN** admin attempts to delete a role with assigned users
- **THEN** the system SHALL show error with user count and disable delete button

#### Scenario: Assign permissions to role
- **WHEN** admin edits a role and selects permissions
- **THEN** the system SHALL provide multi-select checkbox list grouped by subject

#### Scenario: Search and filter roles
- **WHEN** admin types in search box
- **THEN** the system SHALL filter roles by name or description in real-time

### Requirement: Permission Management Page
The system SHALL provide a UI for managing permissions.

#### Scenario: View permissions list
- **WHEN** admin navigates to /portal/admin/permissions
- **THEN** the system SHALL display permissions grouped by subject in expandable sections

#### Scenario: Create new permission
- **WHEN** admin clicks "New Permission" and fills action-subject pair
- **THEN** the system SHALL create the permission with validation

#### Scenario: Edit permission description
- **WHEN** admin edits a permission's description
- **THEN** the system SHALL update without affecting role assignments

#### Scenario: View permission usage
- **WHEN** admin views a permission
- **THEN** the system SHALL show which roles have this permission assigned

#### Scenario: Delete permission
- **WHEN** admin attempts to delete a permission assigned to roles
- **THEN** the system SHALL show warning with role list and block deletion

### Requirement: Menu Management Page
The system SHALL provide a UI for managing sidebar menu items.

#### Scenario: View menu tree
- **WHEN** admin navigates to /portal/admin/menus
- **THEN** the system SHALL display menu items in a tree structure with drag-and-drop reordering

#### Scenario: Create new menu item
- **WHEN** admin clicks "Add Menu Item" and fills name, path, icon, parent
- **THEN** the system SHALL create the menu item and show in tree

#### Scenario: Edit menu item
- **WHEN** admin clicks "Edit" on a menu item
- **THEN** the system SHALL open form with current values including parent selection

#### Scenario: Reorder menu items
- **WHEN** admin drags and drops menu item to new position
- **THEN** the system SHALL update order and show save confirmation

#### Scenario: Assign roles to menu
- **WHEN** admin edits a menu item and selects roles
- **THEN** the system SHALL provide multi-select for role assignment

#### Scenario: Preview menu visibility
- **WHEN** admin views menu configuration
- **THEN** the system SHALL show which roles can see this menu item

#### Scenario: Icon picker
- **WHEN** admin selects an icon for menu item
- **THEN** the system SHALL provide searchable icon picker from Lucide React library

### Requirement: Dynamic Sidebar Menu Component
The system SHALL provide a sidebar menu component that filters based on user permissions.

#### Scenario: Load user menu
- **WHEN** authenticated user logs in
- **THEN** the system SHALL fetch and display menu items for user's role

#### Scenario: Render nested menus
- **WHEN** user has parent and child menu items
- **THEN** the system SHALL render expandable/collapsible nested menu

#### Scenario: Active menu highlighting
- **WHEN** user navigates to a page
- **THEN** the system SHALL highlight the corresponding menu item as active

#### Scenario: Empty menu state
- **WHEN** user's role has no menu items assigned
- **THEN** the system SHALL show "No menu items available" message

### Requirement: Permission Hooks and Components
The system SHALL provide React hooks and components for permission checks.

#### Scenario: UsePermission hook
- **WHEN** component uses usePermission('read', 'Funds')
- **THEN** the hook SHALL return boolean indicating if user has permission

#### Scenario: Can component
- **WHEN** component wraps content with <Can I="update" a="Menu">
- **THEN** the component SHALL render children only if user has permission

#### Scenario: Cannot component
- **WHEN** component wraps content with <Cannot I="delete" a="Role">
- **THEN** the component SHALL render children only if user lacks permission

#### Scenario: Permission-based UI elements
- **WHEN** user lacks permission for an action
- **THEN** the system SHALL hide or disable the corresponding UI elements

### Requirement: Admin UI Validation and Feedback
The system SHALL provide user-friendly validation and feedback in admin UI.

#### Scenario: Form validation
- **WHEN** admin submits invalid form data
- **THEN** the system SHALL show inline validation errors with clear messages

#### Scenario: Success notifications
- **WHEN** admin successfully creates/updates/deletes resource
- **THEN** the system SHALL show toast notification with success message

#### Scenario: Error notifications
- **WHEN** operation fails due to server error
- **THEN** the system SHALL show error notification with actionable message

#### Scenario: Loading states
- **WHEN** data is being fetched or submitted
- **THEN** the system SHALL show loading spinners and disable form controls

#### Scenario: Confirmation dialogs
- **WHEN** admin performs destructive action (delete)
- **THEN** the system SHALL show confirmation dialog with resource name

### Requirement: Responsive Design
The system SHALL provide responsive UI that works on different screen sizes.

#### Scenario: Desktop view
- **WHEN** admin accesses from desktop (1920x1080)
- **THEN** the system SHALL display full layout with sidebar and content area

#### Scenario: Tablet view
- **WHEN** admin accesses from tablet (768x1024)
- **THEN** the system SHALL collapse sidebar to icons-only mode

#### Scenario: Mobile view
- **WHEN** admin accesses from mobile (375x667)
- **THEN** the system SHALL show hamburger menu and stack content vertically
