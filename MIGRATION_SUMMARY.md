# User Role Migration Summary

## Problem
The application was experiencing a **type mismatch error** when querying user menus:

```
QueryFailedError: invalid input syntax for type uuid: "admin_bgn"
```

### Root Cause
- **User.role** was defined as an `enum` (string values like "admin_bgn", "vendor", etc.)
- **RoleMenu.roleId** expected a `UUID` (foreign key to roles table)
- When `findUserMenu(user.role)` was called, it passed the enum string to a query expecting UUID

## Solution
Migrated from enum-based role system to proper relational database design using foreign keys.

### Changes Made

#### 1. Database Schema Changes
- Added `role_id` column (UUID, NOT NULL) to `users` table
- Renamed old `role` enum column to `role_legacy` for backward compatibility
- Added foreign key constraint: `users.role_id` → `roles.id`
- Migration file: `1710600000000-MigrateUserRoleToRelation.ts`

#### 2. Entity Updates

**User Entity** (`apps/api/src/modules/users/entities/user.entity.ts`):
```typescript
@Column({ name: 'role_id', type: 'uuid' })
roleId!: string;

@ManyToOne(() => Role, { eager: false })
@JoinColumn({ name: 'role_id' })
role!: Role;

// Legacy field for backward compatibility
@Column({
  type: 'enum',
  enum: UserRole,
  nullable: true,
  name: 'role_legacy'
})
roleLegacy?: UserRole;
```

#### 3. Service Updates

**AuthService** (`apps/api/src/modules/auth/auth.service.ts`):
- Updated `register()` to lookup role by name and use `roleId`
- Updated `generateTokens()` to get role name from `roleId` instead of enum
- JWT payload now includes both `role` (enum) and `roleId` (UUID)

**UsersService** (`apps/api/src/modules/users/users.service.ts`):
- Added `relations: ['role']` to load role data
- Fixed `update()` method to handle relation objects properly

#### 4. Seeder Updates

**UserSeed** (`apps/api/src/database/seeds/user.seed.ts`):
- Now looks up `role_id` from `roles` table before creating users
- Sets both `roleId` (new) and `roleLegacy` (for compatibility)

#### 5. Controller Updates

**MenusController** - already correctly uses `roleId` from JWT:
```typescript
@Get('user/me')
async findMyMenu(@CurrentUser() user: any) {
  const roleId = user.roleId || user.role;
  return this.menusService.findUserMenu(roleId);
}
```

## Migration Process

### Step 1: Run Migration
```bash
cd apps/api
pnpm typeorm migration:run -- -d src/config/data-source.ts
```

The migration will:
1. ✅ Add `role_id` column (nullable)
2. ✅ Populate `role_id` from existing enum values by looking up roles table
3. ✅ Rename `role` to `role_legacy`
4. ✅ Make `role_id` NOT NULL
5. ✅ Add foreign key constraint

### Step 2: Verify Data
```sql
-- Check that all users have valid role_id
SELECT id, email, role_id, role_legacy FROM users;

-- Verify foreign key works
SELECT u.email, r.name 
FROM users u 
JOIN roles r ON u.role_id = r.id;
```

### Step 3: Test Application
```bash
pnpm dev
```

## Testing Results

### ✅ Login Test
```bash
POST /auth/login
{
  "email": "admin@bgn.go.id",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "dbae8c09-04fd-42ce-b742-3c2705e5d13c",
    "email": "admin@bgn.go.id",
    "roleId": "70c2f6f9-42db-4f3b-98b5-c4a6adb5f54c",
    "role": "ADMIN_BGN"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### ✅ Menu Test
```bash
GET /menus/user/me
Authorization: Bearer <token>
```

**Response:** Returns full menu tree for admin role (11 menus including admin section)

### ✅ No More UUID Error
The original error is now **resolved**:
- `RoleMenu.roleId` receives proper UUID from `user.roleId`
- Query executes successfully: `WHERE role_id = '70c2f6f9-42db-4f3b-98b5-c4a6adb5f54c'`

## Backward Compatibility

The migration maintains backward compatibility:
- `role_legacy` column preserves original enum values
- JWT still includes `role` field with enum value
- Guards and permissions still work with enum values
- Can gradually remove `role_legacy` column in future if needed

## Benefits

1. **Proper Database Design**: Uses foreign keys instead of enum strings
2. **Data Integrity**: Database enforces referential integrity
3. **Flexibility**: Easy to add/modify roles without schema changes
4. **Performance**: Can join with roles table for additional role metadata
5. **Type Safety**: UUID type prevents invalid role values

## Next Steps (Optional)

1. Update all code to use `user.roleId` instead of JWT `role` field
2. Remove `roleLegacy` column after confirming everything works
3. Consider adding role metadata (description, display name, etc.)
4. Add role hierarchy or role-based permissions

## Rollback

If needed, the migration can be rolled back:

```bash
pnpm typeorm migration:revert -- -d src/config/data-source.ts
```

This will:
1. Drop foreign key constraint
2. Rename `role_legacy` back to `role`
3. Drop `role_id` column
