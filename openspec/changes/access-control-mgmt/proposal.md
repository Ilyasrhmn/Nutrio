## Why

The current CASL-based access control system has role-permission mappings hardcoded in `CaslAbilityFactory`, making it difficult to manage permissions dynamically without code changes. There's no admin interface for managing roles, permissions, or menu configurations, requiring developer intervention for any access control modifications. This change introduces a comprehensive, database-driven access control management system with dynamic sidebar menu generation.

## What Changes

- **New**: Database-driven role and permission management with CRUD operations
- **New**: Dynamic sidebar menu system with role-based visibility configuration
- **New**: Admin UI for managing roles, permissions, and menu items
- **New**: Permission-based menu filtering on both API and frontend
- **Modification**: Existing `CaslAbilityFactory` to use database permissions instead of hardcoded rules
- **New**: Audit logging for access control changes
- **New**: Menu configuration API with caching for performance

## Capabilities

### New Capabilities

- `role-management`: CRUD operations for roles with permission assignment
- `permission-management`: Fine-grained permission definitions and management
- `menu-management`: Dynamic sidebar menu configuration with role-based visibility
- `access-control-api`: REST API endpoints for role, permission, and menu management
- `admin-ui`: React-based admin interface for access control management

### Modified Capabilities

- `auth`: Integration with new permission system, JWT payload updates to include permissions

## Impact

- **Backend**: New entities (Role, Permission, Menu), new modules, JWT payload changes
- **Frontend**: New admin pages, dynamic menu component, permission hooks
- **Database**: New tables with migrations required
- **API**: New endpoints under `/api/v1/access-control/`, breaking changes to auth response
- **Shared**: Updated types in `@workspace/common` for roles, permissions, and menu structures
