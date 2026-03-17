## ADDED Requirements

### Requirement: Menu Item CRUD Operations
The system SHALL provide complete CRUD operations for managing sidebar menu items.

#### Scenario: Create new menu item
- **WHEN** an admin creates a menu item with name, path, icon, and order
- **THEN** the system SHALL create the menu item and make it available for role assignment

#### Scenario: Create nested menu item
- **WHEN** an admin creates a menu item with a parent ID
- **THEN** the system SHALL create it as a child menu with proper hierarchy

#### Scenario: List all menu items
- **WHEN** a user requests the menu structure
- **THEN** the system SHALL return menu items in hierarchical order sorted by order field

#### Scenario: Get menu item details
- **WHEN** a user requests a specific menu item by ID
- **THEN** the system SHALL return the item with its parent, children, and assigned roles

#### Scenario: Update menu item
- **WHEN** an admin updates a menu item's properties
- **THEN** the system SHALL update the item and reflect changes in all user menus

#### Scenario: Delete menu item
- **WHEN** an admin deletes a menu item with no children
- **THEN** the system SHALL delete the item and its role associations

#### Scenario: Prevent delete menu with children
- **WHEN** an admin attempts to delete a parent menu item
- **THEN** the system SHALL reject the deletion and suggest reassigning child items first

### Requirement: Menu Hierarchy Management
The system SHALL support nested menu structures with unlimited depth.

#### Scenario: Set menu parent
- **WHEN** an admin assigns a parent to a menu item
- **THEN** the system SHALL validate no circular references are created

#### Scenario: Reorder menu items
- **WHEN** an admin changes the order of menu items
- **THEN** the system SHALL update order values and maintain sibling ordering

#### Scenario: Move menu to different parent
- **WHEN** an admin moves a menu item to a different parent
- **THEN** the system SHALL update the hierarchy and preserve child items

### Requirement: Menu-Role Association
The system SHALL link menu items to roles for visibility control.

#### Scenario: Assign menu to role
- **WHEN** an admin assigns a menu item to a role
- **THEN** the system SHALL create the association and show menu to all users with that role

#### Scenario: Remove menu from role
- **WHEN** an admin removes a menu item from a role
- **THEN** the system SHALL delete the association and hide menu from affected users

#### Scenario: Bulk assign menus to role
- **WHEN** an admin assigns multiple menu items to a role
- **THEN** the system SHALL create all associations in a single transaction

### Requirement: Menu Visibility Filtering
The system SHALL filter menu items based on user's role permissions.

#### Scenario: Get user menu
- **WHEN** a user requests their menu
- **THEN** the system SHALL return only menu items associated with the user's role

#### Scenario: Menu with multiple roles
- **WHEN** a user has multiple roles (future feature)
- **THEN** the system SHALL show the union of all menu items from all roles

#### Scenario: Empty menu handling
- **WHEN** a user's role has no assigned menu items
- **THEN** the system SHALL return an empty menu array, not an error

### Requirement: Menu Icon and Metadata
The system SHALL support icon configuration and metadata for menu items.

#### Scenario: Set menu icon
- **WHEN** an admin assigns an icon to a menu item
- **THEN** the system SHALL validate the icon name exists in the Lucide React library

#### Scenario: Set menu external link
- **WHEN** an admin marks a menu item as external link
- **THEN** the system SHALL store the external URL and flag for frontend handling

#### Scenario: Set menu translation key
- **WHEN** an admin provides i18n keys for menu name
- **THEN** the system SHALL store JSON with translations: {"en": "Dashboard", "id": "Dasbor"}

### Requirement: Menu Validation
The system SHALL validate menu data to maintain consistency.

#### Scenario: Prevent duplicate menu paths
- **WHEN** creating a menu item with a path that already exists
- **THEN** the system SHALL reject the operation with a uniqueness error

#### Scenario: Validate menu path format
- **WHEN** creating a menu item with invalid path
- **THEN** the system SHALL require paths to start with / and contain only valid URL characters

#### Scenario: Prevent circular hierarchy
- **WHEN** setting a menu item's parent to itself or its descendant
- **THEN** the system SHALL reject the operation with a circular reference error
