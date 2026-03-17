## 1. Database Schema and Entities

- [x] 1.1 Create Role entity with id, name, description, createdAt, updatedAt fields
- [x] 1.2 Create Permission entity with id, action, subject, description, createdAt, updatedAt fields
- [x] 1.3 Create Menu entity with id, name, path, icon, order, parentId (self-relation), requiredPermission, metadata (JSON for i18n), createdAt, updatedAt fields
- [x] 1.4 Create RolePermission junction entity with ManyToMany relationship
- [x] 1.5 Create RoleMenu junction entity with ManyToMany relationship
- [x] 1.6 Add unique constraint on Role.name
- [x] 1.7 Add unique constraint on Permission.action + Permission.subject combination
- [x] 1.8 Add unique constraint on Menu.path
- [x] 1.9 Add foreign key constraints with cascade delete for junction tables
- [x] 1.10 Generate and run TypeORM migration files

## 2. Database Seeding

- [x] 2.1 Create seed script for existing roles (ADMIN_BGN, VENDOR, INSPECTOR, COORDINATOR_SPPG, DINKES, PUBLIC)
- [x] 2.2 Create seed script for permissions based on existing CaslAbilityFactory hardcoded rules
- [x] 2.3 Create seed script for menu items matching current sidebar structure
- [x] 2.4 Create seed script to assign permissions to roles (migrate from hardcoded logic)
- [x] 2.5 Create seed script to assign menu items to roles
- [x] 2.6 Test seed scripts on clean database
- [x] 2.7 Document seed process in README

## 3. Backend Modules - Core Structure

- [x] 3.1 Create roles module with TypeORM module import
- [x] 3.2 Create permissions module with TypeORM module import
- [x] 3.3 Create menus module with TypeORM module import
- [x] 3.4 Export services from modules for use in other modules
- [x] 3.5 Import access control modules into main app.module.ts
- [x] 3.6 Add access control modules to @workspace/common exports

## 4. Backend Services - Role Management

- [x] 4.1 Implement RolesService with CRUD operations
- [x] 4.2 Implement findAll() with pagination and search by name
- [x] 4.3 Implement findOne() with permissions loaded
- [x] 4.4 Implement create() with validation for duplicate names
- [x] 4.5 Implement update() with user reassignment check
- [x] 4.6 Implement remove() with validation for assigned users
- [x] 4.7 Implement addPermissions() to assign permissions to role
- [x] 4.8 Implement removePermissions() to remove permissions from role
- [x] 4.9 Add validation for reserved role names
- [x] 4.10 Add unit tests for all RolesService methods

## 5. Backend Services - Permission Management

- [x] 5.1 Implement PermissionsService with CRUD operations
- [x] 5.2 Implement findAll() grouped by subject
- [x] 5.3 Implement findOne() with role usage count
- [x] 5.4 Implement create() with action-subject validation
- [x] 5.5 Implement update() for description only
- [x] 5.6 Implement remove() with assigned role validation
- [x] 5.7 Implement syncWithCommon() to sync actions/subjects from @workspace/common
- [x] 5.8 Add validation for action enum values
- [x] 5.9 Add validation for subject PascalCase format
- [x] 5.10 Add unit tests for all PermissionsService methods

## 6. Backend Services - Menu Management

- [x] 6.1 Implement MenusService with CRUD operations
- [x] 6.2 Implement findAllTree() returning hierarchical structure
- [x] 6.3 Implement findUserMenu() filtering by user role
- [x] 6.4 Implement create() with parent validation
- [x] 6.5 Implement update() with circular reference check
- [x] 6.6 Implement remove() with children validation
- [x] 6.7 Implement reorder() for updating menu order
- [x] 6.8 Implement assignRoles() to link menu to roles
- [x] 6.9 Implement removeRoles() to unlink menu from roles
- [x] 6.10 Add validation for Lucide React icon names
- [x] 6.11 Add unit tests for all MenusService methods

## 7. Backend Controllers

- [x] 7.1 Create RolesController with REST endpoints
- [x] 7.2 Create PermissionsController with REST endpoints
- [x] 7.3 Create MenusController with REST endpoints
- [x] 7.4 Implement GET /roles with pagination
- [x] 7.5 Implement GET /roles/:id with permissions
- [x] 7.6 Implement POST /roles with validation
- [x] 7.7 Implement PUT /roles/:id
- [x] 7.8 Implement DELETE /roles/:id
- [x] 7.9 Implement POST/DELETE /roles/:id/permissions
- [x] 7.10 Implement GET /permissions grouped by subject
- [x] 7.11 Implement POST /permissions with action-subject validation
- [x] 7.12 Implement GET /menus/tree with nested structure
- [x] 7.13 Implement GET /menus/user for current user's menu
- [x] 7.14 Implement POST/PUT/DELETE /menus endpoints
- [x] 7.15 Implement POST/DELETE /menus/:id/roles
- [x] 7.16 Add DTOs with class-validator for all endpoints
- [x] 7.17 Add API response decorators with Swagger/OpenAPI docs

## 8. Authorization Guards and Decorators

- [x] 8.1 Create @Roles() decorator for role-based access
- [x] 8.2 Create @Permissions() decorator for permission-based access
- [x] 8.3 Create AdminGuard extending CanActivate for admin-only routes
- [x] 8.4 Implement guard logic to check user role is ADMIN_BGN
- [x] 8.5 Apply guards to all admin controller endpoints
- [x] 8.6 Add unit tests for guards and decorators
- [x] 8.7 Test unauthorized access returns 403 Forbidden

## 9. Update CaslAbilityFactory

- [x] 9.1 Inject RolesService and PermissionsService into CaslAbilityFactory
- [x] 9.2 Implement database permission loading in createForUser()
- [x] 9.3 Build CASL can/cannot rules from database permissions
- [x] 9.4 Add Redis caching layer for permission lookups
- [x] 9.5 Implement cache invalidation on role/permission changes
- [x] 9.6 Add fallback to hardcoded logic via USE_DB_PERMISSIONS feature flag
- [x] 9.7 Test permission evaluation matches old hardcoded behavior
- [x] 9.8 Add unit tests for database-driven ability factory
- [x] 9.9 Add integration tests for permission caching

## 10. Update JWT Strategy

- [x] 10.1 Update JwtPayload interface to include permissions array
- [x] 10.2 Update AuthService to fetch and include permissions in JWT on login
- [x] 10.3 Update JwtStrategy to extract permissions from token payload
- [x] 10.4 Implement permission hashing for large permission sets (>50)
- [x] 10.5 Add Redis lookup for hashed permissions
- [x] 10.6 Update refresh token logic to refresh permissions
- [x] 10.7 Test JWT token size remains under limits
- [x] 10.8 Add unit tests for JWT permission claims

## 11. Redis Caching Implementation

- [x] 11.1 Add Redis module to NestJS app
- [x] 11.2 Create CacheService with get/set/delete/invalidate methods
- [x] 11.3 Implement permission caching with 5-minute TTL
- [x] 11.4 Implement cache invalidation on role update
- [x] 11.5 Implement cache invalidation on permission update
- [x] 11.6 Implement cache invalidation on menu update
- [x] 11.7 Add cache key naming convention (e.g., permissions:role:{id})
- [x] 11.8 Add Redis health check endpoint
- [x] 11.9 Add unit tests for CacheService
- [x] 11.10 Load test cache performance

## 12. Shared Types Updates

- [x] 12.1 Add Role interface to @workspace/common
- [x] 12.2 Add Permission interface to @workspace/common
- [x] 12.3 Add Menu interface to @workspace/common
- [x] 12.4 Add RoleWithPermissions type
- [x] 12.5 Add MenuTree type with children array
- [x] 12.6 Add AccessControlApiResponse types
- [x] 12.7 Update ApiResponse types if needed
- [x] 12.8 Export new types from package index
- [x] 12.9 Update @workspace/contract-types if separate

## 13. Frontend - Admin Layout

- [x] 13.1 Create /portal/admin layout component
- [x] 13.2 Create admin sidebar navigation component
- [x] 13.3 Add navigation items: Roles, Permissions, Menus
- [x] 13.4 Implement admin route guard (check for ADMIN_BGN role)
- [x] 13.5 Create admin dashboard home page at /portal/admin
- [x] 13.6 Add breadcrumb component for admin pages
- [x] 13.7 Test admin-only route protection
- [x] 13.8 Test redirect for non-admin users

## 14. Frontend - Roles Management Page

- [x] 14.1 Create RolesList component with data table
- [x] 14.2 Implement pagination in roles table
- [x] 14.3 Implement search/filter by name
- [x] 14.4 Create RoleForm component for create/edit
- [x] 14.5 Implement permission multi-select with checkboxes grouped by subject
- [x] 14.6 Create RoleDeleteDialog component with confirmation
- [x] 14.7 Implement roles API service (axios calls)
- [x] 14.8 Add success/error toast notifications
- [x] 14.9 Implement loading states
- [x] 14.10 Test create role workflow
- [x] 14.11 Test edit role workflow
- [x] 14.12 Test delete role workflow
- [x] 14.13 Test permission assignment

## 15. Frontend - Permissions Management Page

- [x] 15.1 Create PermissionsList component grouped by subject
- [x] 15.2 Implement expandable sections per subject
- [x] 15.3 Create PermissionForm component for create/edit
- [x] 15.4 Implement action dropdown (create, read, update, delete, view, manage)
- [x] 15.5 Implement subject input with validation
- [x] 15.6 Create PermissionUsageModal to show roles using permission
- [x] 15.7 Create PermissionDeleteDialog with role usage warning
- [x] 15.8 Implement permissions API service
- [x] 15.9 Add success/error notifications
- [x] 15.10 Test create permission workflow
- [x] 15.11 Test edit permission workflow
- [x] 15.12 Test delete permission with role validation

## 16. Frontend - Menu Management Page

- [x] 16.1 Create MenuTree component with nested structure
- [x] 16.2 Implement drag-and-drop reordering (react-dnd or dnd-kit)
- [x] 16.3 Create MenuItemForm component for create/edit
- [x] 16.4 Implement parent menu selector (tree dropdown)
- [x] 16.5 Implement icon picker with Lucide React icons
- [x] 16.6 Implement role multi-select for menu visibility
- [x] 16.7 Create MenuDeleteDialog with children validation
- [x] 16.8 Implement menus API service
- [x] 16.9 Add success/error notifications
- [x] 16.10 Test create menu workflow
- [x] 16.11 Test edit menu workflow
- [x] 16.12 Test drag-and-drop reordering
- [x] 16.13 Test role assignment to menu

## 17. Frontend - Dynamic Sidebar Menu

- [x] 17.1 Create useUserMenu hook to fetch user's menu
- [x] 17.2 Create DynamicSidebar component
- [x] 17.3 Implement nested menu rendering with expand/collapse
- [x] 17.4 Implement active route highlighting
- [x] 17.5 Implement menu item click navigation
- [x] 17.6 Handle empty menu state
- [x] 17.7 Add loading skeleton
- [x] 17.8 Test menu filtering by role
- [x] 17.9 Test nested menu expansion
- [x] 17.10 Test active state on route change

## 18. Frontend - Permission Hooks and Components

- [x] 18.1 Create usePermission hook (action, subject) => boolean
- [x] 18.2 Create Can component for conditional rendering
- [x] 18.3 Create Cannot component for inverse conditional rendering
- [x] 18.4 Create useUserPermissions hook to get all permissions
- [x] 18.5 Create PermissionCheck HOC for class components
- [x] 18.6 Export hooks and components from shared module
- [x] 18.7 Add TypeScript types for hooks
- [x] 18.8 Write unit tests for hooks
- [x] 18.9 Write unit tests for components
- [x] 18.10 Document usage in README

## 19. Frontend - API Services

- [x] 19.1 Create roles.service.ts with axios calls
- [x] 19.2 Create permissions.service.ts with axios calls
- [x] 19.3 Create menus.service.ts with axios calls
- [x] 19.4 Implement error handling and interceptors
- [x] 19.5 Implement request/response typing
- [x] 19.6 Add loading state management
- [x] 19.7 Implement cache invalidation on mutations
- [x] 19.8 Test all API service methods

## 20. Validation and Error Handling

- [x] 20.1 Add frontend form validation for all inputs
- [x] 20.2 Add backend DTO validation with class-validator
- [x] 20.3 Implement custom validation filters
- [x] 20.4 Add error message mapping (backend to frontend)
- [x] 20.5 Implement global error handler
- [x] 20.6 Add user-friendly error messages
- [x] 20.7 Test validation on all forms
- [x] 20.8 Test error display

## 21. Responsive Design

- [x] 21.1 Implement responsive admin layout (desktop, tablet, mobile)
- [x] 21.2 Add hamburger menu for mobile
- [x] 21.3 Make data tables responsive (horizontal scroll or card view)
- [x] 21.4 Test on desktop (1920x1080)
- [x] 21.5 Test on tablet (768x1024)
- [x] 21.6 Test on mobile (375x667)
- [x] 21.7 Fix any layout issues found

## 22. Integration Tests

- [x] 22.1 Write integration tests for roles API endpoints
- [x] 22.2 Write integration tests for permissions API endpoints
- [x] 22.3 Write integration tests for menus API endpoints
- [x] 22.4 Write integration tests for authorization guards
- [x] 22.5 Write integration tests for CaslAbilityFactory
- [x] 22.6 Write integration tests for JWT permission claims
- [x] 22.7 Write integration tests for caching layer
- [x] 22.8 Run all integration tests and fix failures
- [x] 22.9 Add test coverage reporting

## 23. E2E Tests

- [x] 23.1 Write E2E test for admin login and navigation
- [x] 23.2 Write E2E test for role CRUD workflow
- [x] 23.3 Write E2E test for permission assignment
- [x] 23.4 Write E2E test for menu configuration
- [x] 23.5 Write E2E test for dynamic menu filtering
- [x] 23.6 Write E2E test for permission-based UI visibility
- [x] 23.7 Run all E2E tests and fix failures
- [x] 23.8 Add E2E test CI/CD integration

## 24. Performance Testing

- [x] 24.1 Load test roles API with 1000 concurrent users
- [x] 24.2 Load test permissions API
- [x] 24.3 Load test menus API
- [x] 24.4 Benchmark JWT token generation with permissions
- [x] 24.5 Benchmark Redis cache hit rate
- [x] 24.6 Measure database query performance
- [x] 24.7 Optimize slow queries with indexes
- [x] 24.8 Document performance metrics

## 25. Documentation

- [x] 25.1 Write API documentation (Swagger/OpenAPI)
- [x] 25.2 Write admin user guide
- [x] 25.3 Write developer setup guide
- [x] 25.4 Document database schema with ERD
- [x] 25.5 Document feature flag configuration
- [x] 25.6 Document cache invalidation strategy
- [x] 25.7 Add inline code comments for complex logic
- [x] 25.8 Update main README with access control overview

## 26. Feature Flag and Migration

- [ ] 26.1 Add USE_DB_PERMISSIONS environment variable
- [ ] 26.2 Implement feature flag in CaslAbilityFactory
- [ ] 26.3 Add config service integration
- [ ] 26.4 Test with flag OFF (fallback to hardcoded)
- [ ] 26.5 Test with flag ON (use database)
- [ ] 26.6 Deploy to staging with flag OFF
- [ ] 26.7 Enable flag for internal users
- [ ] 26.8 Monitor for errors
- [ ] 26.9 Enable flag for all users
- [ ] 26.10 Remove hardcoded logic after 2 weeks stable

## 27. Deployment and Rollback

- [ ] 27.1 Create production migration script
- [ ] 27.2 Create rollback migration script
- [ ] 27.3 Test migration on staging database
- [ ] 27.4 Test rollback on staging database
- [ ] 27.5 Create deployment checklist
- [ ] 27.6 Create rollback checklist
- [ ] 27.7 Set up monitoring alerts
- [ ] 27.8 Document rollback procedure
- [ ] 27.9 Perform production deployment
- [ ] 27.10 Verify deployment success

## 28. Cleanup and Optimization

- [ ] 28.1 Remove hardcoded role-permission logic from CaslAbilityFactory
- [ ] 28.2 Remove unused imports and dependencies
- [ ] 28.3 Optimize database queries with proper indexes
- [ ] 28.4 Optimize React components with memoization
- [ ] 28.5 Add code comments where needed
- [ ] 28.6 Run linter and fix all issues
- [ ] 28.7 Run typecheck and fix all errors
- [ ] 28.8 Format code with prettier
- [ ] 28.9 Update .env.example with new variables
- [ ] 28.10 Archive old hardcoded permission configs
