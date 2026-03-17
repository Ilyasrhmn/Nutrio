# Feature Flag Configuration

## Overview

The access control system uses a feature flag (`USE_DB_PERMISSIONS`) to enable gradual rollout of database-driven permissions.

## Environment Variable

```env
# .env
USE_DB_PERMISSIONS=true   # Use database permissions
USE_DB_PERMISSIONS=false  # Use hardcoded permissions (fallback)
```

## Implementation

### Backend (CaslAbilityFactory)

```typescript
// apps/api/src/modules/auth/casl-ability.factory.ts

async createForUser(role: UserRole): Promise<AppAbility> {
  const useDbPermissions = this.configService.get<string>('USE_DB_PERMISSIONS') === 'true';

  if (useDbPermissions) {
    // Database mode
    return this.createAbilityFromDatabase(role);
  } else {
    // Hardcoded fallback mode
    return this.createAbilityFromHardcodedRules(role);
  }
}
```

### Configuration Service Integration

```typescript
// apps/api/src/config/configuration.ts

export default () => ({
  database: {
    // ... database config
  },
  features: {
    useDbPermissions: process.env.USE_DB_PERMISSIONS === 'true',
  },
});
```

## Deployment Strategy

### Phase 1: Deploy with Flag OFF (Week 1)

```env
USE_DB_PERMISSIONS=false
```

**Actions:**
1. Deploy code to production
2. Run database migrations
3. Seed initial permissions
4. System uses hardcoded rules (no behavior change)
5. Monitor for errors

**Validation:**
- ✅ All existing functionality works
- ✅ No permission errors
- ✅ Database tables created

### Phase 2: Enable for Internal Users (Week 2)

```env
USE_DB_PERMISSIONS=true
```

**Actions:**
1. Enable flag on staging environment
2. Test thoroughly with QA team
3. Enable flag for admin users only in production
4. Monitor logs for permission checks

**Validation:**
- ✅ Admins can manage permissions via UI
- ✅ Permission changes take effect
- ✅ Cache invalidation works

### Phase 3: Gradual Rollout (Week 3-4)

**Option A: Role-based rollout**

```typescript
// apps/api/src/modules/auth/casl-ability.factory.ts

async createForUser(role: UserRole): Promise<AppAbility> {
  const useDbPermissions = this.shouldUseDbPermissions(role);
  
  if (useDbPermissions) {
    return this.createAbilityFromDatabase(role);
  } else {
    return this.createAbilityFromHardcodedRules(role);
  }
}

private shouldUseDbPermissions(role: UserRole): boolean {
  const flagEnabled = this.configService.get<string>('USE_DB_PERMISSIONS') === 'true';
  
  if (!flagEnabled) return false;
  
  // Gradually enable by role
  const enabledRoles = [
    UserRole.ADMIN_BGN,
    UserRole.COORDINATOR_SPPG,
    // Add more roles gradually
  ];
  
  return enabledRoles.includes(role);
}
```

**Option B: Percentage rollout**

```typescript
private shouldUseDbPermissions(userId: string): boolean {
  const flagEnabled = this.configService.get<string>('USE_DB_PERMISSIONS') === 'true';
  if (!flagEnabled) return false;
  
  const rolloutPercentage = this.configService.get<number>('DB_PERMISSIONS_ROLLOUT_PERCENTAGE') || 0;
  
  // Hash user ID to deterministic 0-100 value
  const hash = this.hashUserId(userId);
  return hash < rolloutPercentage;
}
```

### Phase 4: Full Rollout (Week 5)

```env
USE_DB_PERMISSIONS=true
```

**Actions:**
1. Enable for 100% of users
2. Monitor performance and errors
3. Validate cache hit rates
4. Check database query performance

### Phase 5: Cleanup (Week 7-8)

After 2 weeks of stable operation:

1. Remove hardcoded permission logic
2. Remove feature flag code
3. Simplify CaslAbilityFactory
4. Update documentation

```typescript
// Simplified after cleanup
async createForUser(role: UserRole): Promise<AppAbility> {
  return this.createAbilityFromDatabase(role);
}
```

## Monitoring

### Metrics to Track

1. **Permission Check Errors**
   ```typescript
   logger.error('Permission check failed', {
     role,
     permission,
     mode: useDbPermissions ? 'database' : 'hardcoded'
   });
   ```

2. **Cache Hit Rate**
   ```typescript
   const cacheHits = await cacheManager.get('cache_hits') || 0;
   const cacheMisses = await cacheManager.get('cache_misses') || 0;
   const hitRate = cacheHits / (cacheHits + cacheMisses);
   ```

3. **Database Query Time**
   ```typescript
   const startTime = Date.now();
   await this.loadPermissionsFromDatabase(role);
   const duration = Date.now() - startTime;
   logger.info('Permission load time', { duration, role });
   ```

4. **Mode Distribution**
   ```typescript
   metrics.increment('permissions.mode.database');
   metrics.increment('permissions.mode.hardcoded');
   ```

## Rollback Plan

If issues occur:

### Quick Rollback

```env
USE_DB_PERMISSIONS=false
```

Restart application. System reverts to hardcoded permissions immediately.

### Data Preservation

Database permissions are preserved even when flag is OFF. Can toggle back ON anytime.

### Monitoring Alerts

Set up alerts for:
- Permission error rate > 0.1%
- Cache miss rate > 20%
- Permission load time > 100ms
- 403 Forbidden responses spike

## Testing Feature Flag

### Local Testing

```bash
# Test with flag ON
USE_DB_PERMISSIONS=true pnpm dev

# Test with flag OFF
USE_DB_PERMISSIONS=false pnpm dev
```

### Integration Tests

```typescript
describe('Feature Flag', () => {
  it('should use database permissions when flag ON', async () => {
    process.env.USE_DB_PERMISSIONS = 'true';
    const ability = await factory.createForUser(UserRole.VENDOR);
    expect(mockPermissionRepository.createQueryBuilder).toHaveBeenCalled();
  });

  it('should use hardcoded permissions when flag OFF', async () => {
    process.env.USE_DB_PERMISSIONS = 'false';
    const ability = await factory.createForUser(UserRole.VENDOR);
    expect(mockPermissionRepository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
```

## Configuration Management

### Development

```env
USE_DB_PERMISSIONS=true  # Always use DB in dev
```

### Staging

```env
USE_DB_PERMISSIONS=true  # Match production
```

### Production

```env
USE_DB_PERMISSIONS=true  # After successful rollout
```

## Cleanup Checklist

After stable operation (2+ weeks):

- [ ] Remove `USE_DB_PERMISSIONS` env var
- [ ] Delete hardcoded permission logic in `CaslAbilityFactory`
- [ ] Remove feature flag checks
- [ ] Update documentation
- [ ] Remove unused imports
- [ ] Run tests
- [ ] Deploy cleanup

## Alternative: External Feature Flag Service

For more advanced control, consider:

- **LaunchDarkly** - Enterprise feature flag platform
- **Unleash** - Open-source feature flag system
- **ConfigCat** - Feature flag service
- **Split.io** - Feature flag + experimentation

Benefits:
- Toggle without deployment
- Percentage rollouts
- User targeting
- Analytics
- A/B testing
