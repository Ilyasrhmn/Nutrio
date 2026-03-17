# Access Control Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] E2E tests passing (`pnpm test:e2e`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Code reviewed and approved

### Database
- [ ] Migrations created for all schema changes
- [ ] Migrations tested on staging
- [ ] Seed data prepared
- [ ] Rollback migrations tested
- [ ] Database backup plan ready

### Configuration
- [ ] Environment variables documented
- [ ] Production `.env` prepared
- [ ] Secrets stored securely (not in repo)
- [ ] Feature flags configured
- [ ] Redis connection tested

### Monitoring
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Logging configured
- [ ] Performance monitoring ready
- [ ] Alerts configured

## Deployment Steps

### 1. Database Migration (15 minutes)

```bash
# Create database backup
pg_dump vendortrack > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
cd apps/api
NODE_ENV=production pnpm typeorm migration:run

# Verify schema
pnpm typeorm schema:log
```

**Rollback if needed:**
```bash
pnpm typeorm migration:revert
```

### 2. Deploy Backend API (10 minutes)

```bash
# Build
cd apps/api
pnpm build

# PM2 deployment
pm2 start ecosystem.config.js --only api

# Or Docker
docker build -t vendortrack-api:latest .
docker run -d -p 3001:3001 --env-file .env vendortrack-api:latest
```

**Verify deployment:**
```bash
curl http://localhost:3001/health
```

### 3. Seed Initial Data (5 minutes)

```bash
cd apps/api
NODE_ENV=production pnpm seed
```

This creates:
- Default roles (ADMIN_BGN, VENDOR, etc.)
- Base permissions
- Initial menu structure
- Role-permission mappings

### 4. Deploy Frontend (10 minutes)

```bash
# Build
cd apps/web
pnpm build

# Start
pm2 start ecosystem.config.js --only web

# Or Docker
docker build -t vendortrack-web:latest .
docker run -d -p 3000:3000 vendortrack-web:latest
```

### 5. Smoke Tests (5 minutes)

```bash
# Test API
curl http://localhost:3001/api/v1/roles

# Test UI
open http://localhost:3000/portal/admin
```

Manual checks:
- [ ] Admin can login
- [ ] Roles page loads
- [ ] Permissions page loads
- [ ] Menus page loads
- [ ] Can create/edit/delete entities
- [ ] Permissions correctly enforced

### 6. Enable Feature Flag (Gradual)

**Week 1:** Deploy with flag OFF
```env
USE_DB_PERMISSIONS=false
```

**Week 2:** Enable for admins
```env
USE_DB_PERMISSIONS=true
```

**Week 3-4:** Monitor and validate

**Week 5:** Full rollout confirmed

### 7. Monitor (Ongoing)

Watch for:
- Error rates
- Response times
- Cache hit rates
- Database query performance
- 403 Forbidden errors

## Environment Variables

### Required

```env
# Database
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USER=vendortrack_user
DATABASE_PASSWORD=<strong-password>
DATABASE_NAME=vendortrack
DATABASE_SSL=true

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# JWT
JWT_SECRET=<random-256-bit-secret>
JWT_EXPIRATION=7d

# Feature Flags
USE_DB_PERMISSIONS=false  # Start with false

# Application
NODE_ENV=production
PORT=3001
```

### Optional

```env
# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/vendortrack/api.log

# Monitoring
SENTRY_DSN=https://...
NEW_RELIC_LICENSE_KEY=...

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

## Production Architecture

```
┌─────────────┐
│   Nginx     │ (Load Balancer)
│   :80/443   │
└──────┬──────┘
       │
       ├──────────┬──────────┐
       │          │          │
   ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
   │ API 1 │  │ API 2 │  │ API 3 │
   │ :3001 │  │ :3001 │  │ :3001 │
   └───┬───┘  └───┬───┘  └───┬───┘
       │          │          │
       └──────────┼──────────┘
                  │
       ┌──────────▼──────────┐
       │   PostgreSQL DB     │
       │   (with replicas)   │
       └─────────────────────┘
                  │
       ┌──────────▼──────────┐
       │   Redis Cache       │
       │   (with sentinel)   │
       └─────────────────────┘
```

## PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'vendortrack-api',
    script: 'dist/main.js',
    cwd: './apps/api',
    instances: 4,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }, {
    name: 'vendortrack-web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './apps/web',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: vendortrack
      POSTGRES_USER: vendortrack_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"

  api:
    build: ./apps/api
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_HOST: postgres
      REDIS_HOST: redis
    ports:
      - "3001:3001"

  web:
    build: ./apps/web
    depends_on:
      - api
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

## Rollback Procedure

### If API Deployment Fails

```bash
# Revert to previous version
pm2 stop api
pm2 start api@previous

# Or Docker
docker run vendortrack-api:previous-tag
```

### If Migration Fails

```bash
# Restore database from backup
psql vendortrack < backup_YYYYMMDD_HHMMSS.sql

# Revert migration
pnpm typeorm migration:revert
```

### If Feature Flag Causes Issues

```bash
# Immediately disable flag
export USE_DB_PERMISSIONS=false
pm2 restart api

# Or update .env and restart
```

## Performance Tuning

### Database

```sql
-- Add indexes (already in migrations)
CREATE INDEX idx_role_name ON roles(name);
CREATE INDEX idx_permission_action_subject ON permissions(action, subject);
CREATE INDEX idx_menu_path ON menus(path);

-- Connection pooling
-- In TypeORM config:
extra: {
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000
}
```

### Redis

```bash
# Configure memory limit
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable persistence
appendonly yes
```

### Nginx

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

server {
  location /api/v1/roles {
    proxy_pass http://backend;
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
  }
}
```

## Monitoring Setup

### Application Logs

```typescript
// apps/api/src/main.ts
const logger = new Logger('AccessControl');

logger.log(`Permission check: ${role} - ${action}:${subject}`);
logger.error(`Permission denied: ${userId}`, error.stack);
```

### Prometheus Metrics

```typescript
import { Counter, Histogram } from 'prom-client';

const permissionChecks = new Counter({
  name: 'access_control_permission_checks_total',
  help: 'Total permission checks',
  labelNames: ['role', 'result']
});

const cacheHitRate = new Histogram({
  name: 'access_control_cache_hit_rate',
  help: 'Cache hit rate for permissions'
});
```

### Health Checks

```typescript
@Get('health')
async health() {
  const dbHealthy = await this.checkDatabase();
  const redisHealthy = await this.checkRedis();
  
  return {
    status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy,
    cache: redisHealthy,
    timestamp: new Date()
  };
}
```

## Security Checklist

- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] Redis requires authentication
- [ ] HTTPS enabled (TLS certificate)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection prevented (TypeORM parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF tokens for mutations
- [ ] Security headers set (Helmet.js)

## Post-Deployment

### Week 1: Monitor Closely

- Check error logs daily
- Review performance metrics
- Validate all features work
- Collect user feedback

### Week 2-4: Gradual Rollout

- Enable feature flag progressively
- Monitor cache hit rates
- Optimize slow queries
- Document any issues

### Week 5+: Stabilization

- Full rollout complete
- Begin planning cleanup
- Update documentation
- Schedule cleanup deployment

## Support

### Troubleshooting

**Permission errors:**
- Check role assignments
- Verify permissions in database
- Check cache expiry
- Review logs

**Performance issues:**
- Check database query times
- Monitor cache hit rate
- Review Redis memory usage
- Check API response times

### Emergency Contacts

- DevOps Lead: ops@example.com
- Backend Lead: backend@example.com
- Database Admin: dba@example.com

## Success Criteria

Deployment is successful when:
- ✅ All services running without errors
- ✅ Admin can manage roles/permissions/menus
- ✅ Permissions correctly enforced
- ✅ Cache hit rate > 80%
- ✅ API response time < 200ms p95
- ✅ No 500 errors
- ✅ Database migrations applied
- ✅ Zero downtime achieved
