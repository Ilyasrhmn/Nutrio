# Access Control Integration Tests

This directory contains comprehensive integration tests for the access control management system.

## Test Files

### API Controller Tests
- **`roles.e2e-spec.ts`** - Tests for Roles API endpoints (CRUD, permission assignment)
- **`permissions.e2e-spec.ts`** - Tests for Permissions API endpoints (CRUD, role usage)
- **`menus.e2e-spec.ts`** - Tests for Menus API endpoints (hierarchy, role assignment)

### Authorization Tests
- **`guards.e2e-spec.ts`** - Tests for AdminGuard, RolesGuard, and PermissionsGuard
- **`casl-ability-factory.e2e-spec.ts`** - Tests for CASL ability creation and caching

## Running Tests

### Run All Integration Tests
```bash
cd apps/api
pnpm test:e2e
```

### Run Specific Test File
```bash
pnpm test:e2e -- roles.e2e-spec.ts
pnpm test:e2e -- permissions.e2e-spec.ts
pnpm test:e2e -- menus.e2e-spec.ts
pnpm test:e2e -- guards.e2e-spec.ts
pnpm test:e2e -- casl-ability-factory.e2e-spec.ts
```

### Run with Coverage
```bash
pnpm test:e2e -- --coverage
```

### Watch Mode
```bash
pnpm test:e2e -- --watch
```

## Test Coverage

The integration tests cover:

### 1. Roles API (`/roles`)
- ✅ GET /roles - Paginated listing with search
- ✅ GET /roles/:id - Fetch single role
- ✅ POST /roles - Create role with validation
- ✅ PUT /roles/:id - Update role
- ✅ DELETE /roles/:id - Delete role
- ✅ POST /roles/:id/permissions - Add permissions to role
- ✅ DELETE /roles/:id/permissions - Remove permissions from role
- ✅ Error handling (404, 400, duplicate names)

### 2. Permissions API (`/permissions`)
- ✅ GET /permissions - List all grouped by subject
- ✅ GET /permissions/:id - Fetch single permission with role count
- ✅ POST /permissions - Create permission
- ✅ PUT /permissions/:id - Update description only
- ✅ DELETE /permissions/:id - Delete with role validation
- ✅ GET /permissions/:id/roles - List roles using permission
- ✅ Validation (action enum, duplicate action-subject)

### 3. Menus API (`/menus`)
- ✅ GET /menus/tree - Hierarchical menu structure
- ✅ GET /menus/user/:roleId - Filtered menu by role
- ✅ GET /menus/:id - Fetch single menu
- ✅ POST /menus - Create menu with parent validation
- ✅ PUT /menus/:id - Update menu (circular reference check)
- ✅ DELETE /menus/:id - Delete (children validation)
- ✅ POST /menus/:id/roles - Assign roles to menu
- ✅ DELETE /menus/:id/roles/:roleId - Remove role from menu
- ✅ Path uniqueness validation

### 4. Authorization Guards
- ✅ **AdminGuard** - Admin-only access control
- ✅ **RolesGuard** - Multi-role authorization
- ✅ **PermissionsGuard** - Fine-grained CASL-based permissions
- ✅ Unauthenticated request handling
- ✅ Permission format validation

### 5. CASL Ability Factory
- ✅ Database mode permission loading
- ✅ Hardcoded mode fallback
- ✅ Cache hit/miss scenarios
- ✅ Cache invalidation
- ✅ TTL-based cache expiry
- ✅ Permission evaluation (read, update, manage)
- ✅ Role-specific abilities (ADMIN_BGN, VENDOR, INSPECTOR, etc.)

### 6. Caching Layer
- ✅ Permission caching with 5-minute TTL
- ✅ Cache lookup before database query
- ✅ Cache invalidation on mutations
- ✅ Cache key generation per role

### 7. JWT Permission Claims
- ✅ Guard integration with JWT user object
- ✅ Role extraction from JWT payload
- ✅ Permission verification from JWT

## Test Structure

Each test file follows this pattern:

```typescript
describe('Component (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Entity>;

  beforeAll(async () => {
    // Set up test module with mocked dependencies
    const module = await Test.createTestingModule({
      imports: [ComponentModule],
    })
      .overrideProvider(...)
      .overrideGuard(...)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Endpoint', () => {
    it('should handle success case', async () => {
      // Arrange: Mock repository responses
      // Act: Make HTTP request
      // Assert: Verify response and side effects
    });

    it('should handle error case', async () => {
      // Test error scenarios
    });
  });
});
```

## Mocking Strategy

### Repository Mocking
All database repositories are mocked to avoid database dependencies:
- `Repository<Role>` - Mocked with jest functions
- `Repository<Permission>` - Mocked with jest functions
- `Repository<Menu>` - Mocked with jest functions
- `Repository<RolePermission>` - Junction table mock
- `Repository<RoleMenu>` - Junction table mock

### Guard Mocking
Authentication guards are bypassed in tests:
- `JwtAuthGuard` - Always returns `true`
- `AdminGuard` - Overridden to allow all requests

### Cache Mocking
Cache manager is mocked for predictable behavior:
- `get()` - Returns null (cache miss) or predefined data
- `set()` - Spy to verify caching behavior
- `del()` - Spy to verify invalidation

## Best Practices

1. **Isolation**: Each test is isolated with `beforeEach` cleanup
2. **Mocking**: External dependencies are mocked, not integrated
3. **Coverage**: Both success and error paths are tested
4. **Validation**: Input validation is thoroughly tested
5. **Edge Cases**: Duplicate checks, circular references, missing data
6. **Assertions**: Verify both response body and repository interactions

## Future Enhancements

- [ ] Add tests for concurrent permission updates
- [ ] Add tests for race conditions in cache
- [ ] Add performance benchmarks
- [ ] Add tests for real database integration (optional)
- [ ] Add tests for WebSocket/SSE permission broadcasts
- [ ] Add tests for audit log generation

## Troubleshooting

### Tests Failing Due to Module Import Issues
Ensure `moduleNameMapper` in `jest-e2e.json` correctly maps `@workspace/common`:
```json
{
  "moduleNameMapper": {
    "^@workspace/common$": "<rootDir>/../../packages/common/src/index.ts"
  }
}
```

### Tests Timing Out
Increase Jest timeout in test file:
```typescript
jest.setTimeout(30000); // 30 seconds
```

### Mock Not Working
Verify mock is created before module compilation:
```typescript
const mockRepository = { ... };
// Then use in Test.createTestingModule()
```

## Test Metrics

**Total Test Suites**: 5  
**Total Tests**: ~150+  
**Coverage Target**: >80% for access control modules

## Related Documentation

- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [CASL Testing Guide](https://casl.js.org/v6/en/guide/testing)
