## Context

The current implementation uses hardcoded role-permission mappings in `CaslAbilityFactory` with switch statements for each role (ADMIN_BGN, VENDOR, INSPECTOR, COORDINATOR_SPPG, DINKES, PUBLIC). The system already uses CASL for ability-based authorization but lacks:

1. Dynamic permission management without code deployment
2. Admin interface for role/permission configuration
3. Database-backed menu visibility rules
4. Audit trail for access control changes
5. Granular permission assignment per role

**Stakeholders**: Admin users (manage roles), all application users (affected by permissions), developers (maintainability)

**Constraints**:
- Must maintain backward compatibility with existing CASL implementation
- PostgreSQL database with TypeORM
- NestJS backend, Next.js frontend
- Monorepo with shared `@workspace/common` package
- Existing role enum must be preserved

## Goals / Non-Goals

**Goals:**
- Database-driven role and permission management with admin UI
- Dynamic sidebar menu generation based on user permissions
- Maintain CASL as the authorization layer
- Support all existing roles without breaking changes
- Add audit logging for access control modifications
- Provide performant permission caching
- Enable non-developers to manage access control

**Non-Goals:**
- Replacing CASL with a different authorization library
- Adding OAuth/SAML identity providers
- Multi-tenant organization support (future enhancement)
- Permission inheritance hierarchies (complex, defer to v2)
- Real-time permission updates across active sessions

## Decisions

### 1. Database Schema Design

**Decision**: Use many-to-many relationships with junction tables

```
Role ←→ RolePermission ←→ Permission
Role ←→ RoleMenu ←→ Menu
```

**Rationale**: 
- Flexible permission assignment without schema changes
- Supports future permission granularity
- Standard relational pattern, easy to query
- TypeORM handles relationships cleanly

**Alternatives Considered**:
- JSONB column for permissions: Rejected - harder to query, validate, and maintain referential integrity
- Separate permission table per role: Rejected - schema changes needed for new roles

### 2. Permission Granularity

**Decision**: Use action-subject pairs (CASL native format)

```typescript
interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'view' | 'manage';
  subject: string; // e.g., 'Dashboard', 'Funds', 'User'
}
```

**Rationale**:
- Native CASL support, no translation layer needed
- Fine-grained control over capabilities
- Matches existing `AppAction` and `AppSubject` types

### 3. Menu Structure Storage

**Decision**: Store menu items in database with parent-child self-relation

```typescript
interface Menu {
  id: string;
  name: string;
  path: string;
  icon: string;
  order: number;
  parentId: string | null;
  requiredPermission: string; // action:subject format
}
```

**Rationale**:
- Supports nested menus out of the box
- Admin can reorder/restructure without code changes
- Permission-based visibility at individual menu level
- Icon and path configurable per environment

**Alternatives Considered**:
- Static menu config with role filter: Rejected - requires deployment for changes
- Hybrid (static structure, dynamic visibility): Rejected - less flexible than full DB approach

### 4. Permission Caching Strategy

**Decision**: Cache user permissions in JWT payload + Redis for invalidation

- **JWT**: Include permissions array and role on login
- **Redis**: Cache full permission set for quick lookup (5min TTL)
- **Invalidation**: Clear Redis cache on permission/role changes

**Rationale**:
- JWT: No DB query per request, works with existing auth flow
- Redis: Fast invalidation, reduces JWT size pressure
- 5min TTL: Balance between consistency and performance

**Alternatives Considered**:
- DB query per request: Rejected - performance impact
- JWT only: Rejected - can't invalidate before token expiry
- Redis only: Rejected - adds latency vs JWT claims

### 5. Admin UI Location

**Decision**: Add admin pages under `/portal/admin/` route in web app

- `/portal/admin/roles` - Role management
- `/portal/admin/permissions` - Permission definitions
- `/portal/admin/menus` - Menu configuration

**Rationale**:
- Consistent with existing `/portal` structure
- Protected by existing auth guards
- Separate from user-facing features

### 6. Migration Strategy

**Decision**: Phased migration with feature flag

1. Create new tables (roles, permissions, menus)
2. Seed existing hardcoded permissions to DB
3. Add feature flag `USE_DB_PERMISSIONS`
4. When flag enabled: load from DB, else: use hardcoded
5. After validation: remove hardcoded logic

**Rationale**:
- Zero-downtime deployment
- Rollback by flipping flag
- Gradual validation before full cutover

**Alternatives Considered**:
- Big-bang replacement: Rejected - risky, no rollback path
- Parallel systems: Rejected - complexity, maintenance burden

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Performance degradation** from DB queries | Cache in JWT + Redis, benchmark before rollout |
| **Stale permissions** after changes | Redis cache invalidation, document 5min propagation delay |
| **Admin UI access control** (who manages admins?) | Bootstrap ADMIN_BGN role with full access, require existing admin to grant access |
| **Database migration failures** | Test migrations on staging, backup before deploy, rollback scripts |
| **JWT token size** with many permissions | Store role + permission hashes, full permissions in Redis |
| **Menu config complexity** for non-tech admins | Provide sensible defaults, validation, preview mode |
| **Breaking existing integrations** | Maintain backward-compatible API responses, version new endpoints |

## Migration Plan

### Phase 1: Database Setup (Week 1)
1. Create TypeORM entities: `Role`, `Permission`, `Menu`, `RolePermission`, `RoleMenu`
2. Generate and run migrations
3. Seed existing hardcoded permissions to database
4. Create seed scripts for future environments

### Phase 2: Backend API (Week 2)
1. Create modules: `roles`, `permissions`, `menus`
2. Implement CRUD services and controllers
3. Add guards/decorators for admin-only endpoints
4. Update `CaslAbilityFactory` to load from DB (behind feature flag)
5. Add Redis caching layer
6. Update JWT strategy to include permissions

### Phase 3: Admin UI (Week 3)
1. Create admin layout and navigation
2. Build role management page (list, create, edit, delete)
3. Build permission assignment UI
4. Build menu configuration page
5. Add permission hooks and components
6. Implement dynamic sidebar menu component

### Phase 4: Testing & Rollout (Week 4)
1. Integration tests for all API endpoints
2. E2E tests for admin workflows
3. Load testing for permission caching
4. Deploy to staging, validate with sample data
5. Production deployment with feature flag OFF
6. Enable flag for internal users first
7. Gradual rollout to all users
8. Remove hardcoded logic after 2 weeks stable

### Rollback Strategy
- **Before Phase 4**: Revert code, drop new tables (no user data)
- **After Phase 4**: Set `USE_DB_PERMISSIONS=false`, redeploy previous version
- **Data rollback**: Migration scripts to export/import if needed

## Open Questions

1. **Should we support permission groups** (e.g., "all fund operations") for easier assignment?
   - Defer to v2, start with flat permissions

2. **How to handle menu icons** - icon library selection in admin UI or predefined list?
   - Predefined list from Lucide React (already in use)

3. **Should permission changes log out active sessions**?
   - No, rely on cache TTL + Redis invalidation, force refresh on next request

4. **Multi-language support for menu names**?
   - Store JSON with i18n keys: `{"en": "Dashboard", "id": "Dasbor"}`
