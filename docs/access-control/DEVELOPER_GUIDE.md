# Access Control - Developer Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- Redis 6+ (for caching)
- Git

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd bi-hackathon
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create `.env` file in `apps/api`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=vendortrack

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# Access Control Feature Flag
USE_DB_PERMISSIONS=true
```

### 4. Database Setup

```bash
cd apps/api

# Run migrations
pnpm typeorm migration:run

# Seed initial data
pnpm seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Start API
cd apps/api
pnpm dev

# Terminal 2: Start Web
cd apps/web
pnpm dev
```

## Project Structure

```
apps/
├── api/                          # NestJS backend
│   └── src/
│       └── modules/
│           ├── access-control/   # Access control modules
│           │   ├── roles/
│           │   ├── permissions/
│           │   ├── menus/
│           │   └── common/       # Guards, decorators
│           └── auth/
│               ├── casl-ability.factory.ts
│               └── guards/
└── web/                          # Next.js frontend
    ├── app/
    │   └── portal/
    │       └── admin/            # Admin pages
    │           ├── roles/
    │           ├── permissions/
    │           └── menus/
    └── lib/
        ├── services/             # API services
        └── hooks/                # React hooks

packages/
├── common/                       # Shared types
│   └── src/
│       ├── types/
│       └── enums/
└── ui/                          # Shared UI components
```

## Database Migrations

### Create Migration

```bash
cd apps/api
pnpm typeorm migration:create -n CreateAccessControlTables
```

### Run Migrations

```bash
pnpm typeorm migration:run
```

### Revert Migration

```bash
pnpm typeorm migration:revert
```

## Seeding Data

### Create Seed File

```bash
pnpm seed:generate MySeedName
```

### Run Seeds

```bash
pnpm seed
```

### Seed Files

Located in `apps/api/src/database/seeds/`:
- `1710000000000-roles.seed.ts` - Initial roles
- `1710000000001-permissions.seed.ts` - Base permissions
- `1710000000002-menus.seed.ts` - Menu structure
- `1710000000003-role-permissions.seed.ts` - Role-permission mapping

## Testing

### Unit Tests

```bash
# Backend
cd apps/api
pnpm test

# Frontend
cd apps/web
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

### Test Coverage

```bash
pnpm test:coverage
```

## Code Quality

### Linting

```bash
# Lint all packages
pnpm lint

# Auto-fix
pnpm lint:fix
```

### Type Checking

```bash
pnpm typecheck
```

### Formatting

```bash
pnpm format
```

## Development Workflow

### 1. Feature Branch

```bash
git checkout -b feature/access-control-improvements
```

### 2. Make Changes

Edit code in:
- Backend: `apps/api/src/modules/access-control/`
- Frontend: `apps/web/app/portal/admin/`
- Types: `packages/common/src/types/`

### 3. Test Changes

```bash
# Run tests
pnpm test

# Manual testing
pnpm dev
```

### 4. Commit

```bash
git add .
git commit -m "feat: add role hierarchy support"
```

### 5. Push and PR

```bash
git push origin feature/access-control-improvements
```

## Debugging

### Backend Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["dev"],
  "cwd": "${workspaceFolder}/apps/api",
  "console": "integratedTerminal"
}
```

### Frontend Debugging

Use Next.js debug mode:

```bash
NODE_OPTIONS='--inspect' pnpm dev
```

Then attach Chrome DevTools to `chrome://inspect`

### Database Debugging

View queries in console:

```typescript
// apps/api/src/app.module.ts
TypeOrmModule.forRoot({
  logging: true, // Enable query logging
  // ...
})
```

## Common Tasks

### Add New Permission

1. No code needed! Use admin UI:
   - Go to `/portal/admin/permissions`
   - Click "New Permission"
   - Action: `read`, Subject: `NewResource`

2. Or seed it:

```typescript
// apps/api/src/database/seeds/permissions.seed.ts
await permissionRepository.save({
  action: 'read',
  subject: 'NewResource',
  description: 'View new resource'
});
```

### Add New Role

Admin UI or seed:

```typescript
await roleRepository.save({
  name: 'NEW_ROLE',
  description: 'New custom role'
});
```

### Add New Menu

Admin UI or seed:

```typescript
await menuRepository.save({
  name: 'New Page',
  path: '/new-page',
  icon: 'FileText',
  order: 10,
  requiredPermission: 'read:NewResource'
});
```

### Update CASL Rules

If using hardcoded mode:

```typescript
// apps/api/src/modules/auth/casl-ability.factory.ts
case UserRole.NEW_ROLE:
  ability.can('read', 'NewResource');
  break;
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
```

### Database Connection Failed

- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check firewall/network settings

### Redis Connection Failed

- Check Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### TypeORM Sync Issues

```bash
# Drop and recreate database (CAUTION: Data loss)
pnpm typeorm schema:drop
pnpm typeorm migration:run
pnpm seed
```

## Performance Optimization

### Enable Caching

```typescript
// Already enabled in CaslAbilityFactory
// Permissions cached for 5 minutes
```

### Database Indexing

Migrations already include indexes on:
- `role.name`
- `permission.action + permission.subject`
- `menu.path`

### Query Optimization

Use eager loading for relations:

```typescript
await roleRepository.find({
  relations: ['permissions']
});
```

## Production Considerations

### Environment Variables

Required for production:
- `NODE_ENV=production`
- `USE_DB_PERMISSIONS=true`
- Strong `JWT_SECRET`
- Database connection pooling

### Caching

- Redis required in production
- Consider Redis Cluster for HA
- Monitor cache hit rates

### Monitoring

- Log all permission checks
- Track API response times
- Monitor database query performance

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [CASL Documentation](https://casl.js.org)
- [TypeORM Documentation](https://typeorm.io)

## Getting Help

- Check existing issues on GitHub
- Review test files for examples
- Contact: dev-team@example.com
