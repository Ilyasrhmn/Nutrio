# Access Control Management System

## Overview

Comprehensive database-driven access control system with role-based permissions and dynamic menu configuration.

## Features

✅ **Role Management** - Create, update, and manage user roles
✅ **Permission System** - Fine-grained CASL-based permissions (action:subject pairs)
✅ **Dynamic Menus** - Hierarchical menu structure with role-based visibility
✅ **Admin UI** - React-based management interface for non-technical users
✅ **Caching** - Redis-backed permission caching (5-minute TTL)
✅ **Feature Flags** - Gradual rollout support with database/hardcoded fallback
✅ **Full Test Coverage** - Unit, integration, and E2E tests
✅ **Responsive Design** - Mobile-first admin interface

## Quick Start

### 1. Setup Database

```bash
cd apps/api

# Run migrations
pnpm typeorm migration:run

# Seed initial data
pnpm seed
```

### 2. Start Services

```bash
# Terminal 1: API
cd apps/api
pnpm dev

# Terminal 2: Web
cd apps/web
pnpm dev
```

### 3. Access Admin Panel

1. Login as admin: `admin@test.com`
2. Navigate to: `http://localhost:3000/portal/admin`
3. Manage roles, permissions, and menus

## Architecture

```
┌─────────────────────────────────────┐
│         Frontend (Next.js)          │
│  - Admin UI (Roles/Perms/Menus)    │
│  - Dynamic Sidebar                  │
│  - Permission Hooks                 │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│         Backend (NestJS)            │
│  - Controllers (CRUD)               │
│  - Guards (Admin/Roles/Permissions) │
│  - CASL Ability Factory             │
└──────────────┬──────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼──────┐  ┌──────▼──────┐
│ PostgreSQL │  │    Redis    │
│   (Data)   │  │   (Cache)   │
└────────────┘  └─────────────┘
```

## Database Schema

### Core Tables

- **roles** - User role definitions
- **permissions** - Action-subject permission pairs
- **menus** - Hierarchical menu structure
- **role_permissions** - Many-to-many junction
- **role_menus** - Many-to-many junction

### Indexes

- `roles.name` (unique)
- `permissions(action, subject)` (unique composite)
- `menus.path` (unique)

## API Endpoints

### Roles

- `GET /api/v1/roles` - List roles (paginated, searchable)
- `POST /api/v1/roles` - Create role (admin only)
- `PUT /api/v1/roles/:id` - Update role (admin only)
- `DELETE /api/v1/roles/:id` - Delete role (admin only)
- `POST /api/v1/roles/:id/permissions` - Assign permissions
- `DELETE /api/v1/roles/:id/permissions` - Remove permissions

### Permissions

- `GET /api/v1/permissions` - List permissions (grouped by subject)
- `POST /api/v1/permissions` - Create permission (admin only)
- `PUT /api/v1/permissions/:id` - Update description (admin only)
- `DELETE /api/v1/permissions/:id` - Delete permission (admin only)

### Menus

- `GET /api/v1/menus/tree` - Get menu tree (public)
- `GET /api/v1/menus/user/:roleId` - Get filtered menu by role
- `POST /api/v1/menus` - Create menu (admin only)
- `PUT /api/v1/menus/:id` - Update menu (admin only)
- `DELETE /api/v1/menus/:id` - Delete menu (admin only)
- `POST /api/v1/menus/:id/roles` - Assign roles to menu

## Authorization Layers

### 1. AdminGuard (Simplest)

```typescript
@UseGuards(AdminGuard)
@Get('sensitive-data')
```

Restricts to `ADMIN_BGN` role only.

### 2. RolesGuard (Multi-role)

```typescript
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN_BGN, UserRole.COORDINATOR_SPPG)
@Get('reports')
```

Allows multiple specified roles.

### 3. PermissionsGuard (Fine-grained)

```typescript
@UseGuards(PermissionsGuard)
@Permissions('read:Reports', 'update:Reports')
@Get('reports')
```

CASL-based action:subject permissions.

## Frontend Usage

### Permission Hook

```typescript
import { usePermission } from '@/lib/hooks/use-permission';

function MyComponent() {
  const canEdit = usePermission('update', 'User');
  
  return canEdit ? <EditButton /> : null;
}
```

### Permission Component

```typescript
import { Can } from '@/lib/hooks/use-permission';

<Can action="delete" subject="User">
  <DeleteButton />
</Can>
```

### Dynamic Menu

```typescript
import { useUserMenu } from '@/lib/hooks/use-user-menu';

function Sidebar() {
  const { menu, loading } = useUserMenu();
  
  return <DynamicSidebar items={menu} />;
}
```

## Configuration

### Environment Variables

```env
# Feature Flag
USE_DB_PERMISSIONS=true   # Use database permissions
USE_DB_PERMISSIONS=false  # Use hardcoded fallback

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=vendortrack

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=<your-secret>
JWT_EXPIRATION=7d
```

## Testing

### Unit Tests

```bash
# Frontend
cd apps/web
pnpm test

# Backend
cd apps/api
pnpm test
```

### Integration Tests

```bash
cd apps/api
pnpm test:e2e
```

### E2E Tests

```bash
cd apps/web
pnpm test:e2e
```

### Coverage

```bash
pnpm test:coverage
```

## Documentation

Comprehensive docs in `/docs/access-control/`:

- **API.md** - REST API reference
- **USER_GUIDE.md** - Admin user guide
- **DEVELOPER_GUIDE.md** - Setup and development
- **FEATURE_FLAGS.md** - Feature flag strategy
- **DEPLOYMENT.md** - Production deployment guide

## Performance

- **Permission caching**: 5-minute Redis TTL
- **Cache hit rate**: Target >80%
- **API response time**: <200ms p95
- **Database indexes**: All foreign keys and unique constraints

## Security

- ✅ JWT authentication required
- ✅ Role-based access control (RBAC)
- ✅ Fine-grained permissions (CASL)
- ✅ SQL injection prevention (TypeORM)
- ✅ XSS protection
- ✅ CORS configured
- ✅ Rate limiting ready

## Deployment

### Pre-requisites

- PostgreSQL 14+
- Redis 6+
- Node.js 18+

### Steps

```bash
# 1. Run migrations
pnpm typeorm migration:run

# 2. Seed data
pnpm seed

# 3. Build and start
pnpm build
pm2 start ecosystem.config.js
```

See `docs/access-control/DEPLOYMENT.md` for full guide.

## Monitoring

### Key Metrics

- Permission check errors
- Cache hit rate
- Database query performance
- API response times
- 403 Forbidden rate

### Health Check

```bash
curl http://localhost:3001/health
```

## Rollback

If issues occur:

```bash
# Disable feature flag immediately
export USE_DB_PERMISSIONS=false
pm2 restart api

# Revert database migration
pnpm typeorm migration:revert
```

## Roadmap

Future enhancements:

- [ ] Permission inheritance hierarchies
- [ ] Multi-tenant support
- [ ] Audit log UI
- [ ] Permission templates
- [ ] Bulk role assignment
- [ ] Advanced filtering and search
- [ ] Permission analytics dashboard

## Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Run linter: `pnpm lint:fix`
5. Submit PR

## Support

- **Issues**: GitHub Issues
- **Docs**: `/docs/access-control/`
- **Email**: dev-team@example.com

## License

Proprietary - Internal use only

---

**Built with:** NestJS, Next.js, PostgreSQL, Redis, CASL, TypeORM, Tailwind CSS
