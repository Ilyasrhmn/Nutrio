# Quick Reference - Login Fix

## 🔧 Apa yang Diperbaiki?

1. ✅ **Login sekarang memanggil backend API** (tidak lagi dummy)
2. ✅ **Token disimpan dengan benar** di cookies (accessToken + refreshToken)
3. ✅ **JWT payload memiliki roleId** untuk menu endpoint
4. ✅ **Token auto-refresh** jika expired (sudah ada di api-client.ts)

---

## 🚀 Testing Login

### 1. Pastikan Database Sudah Di-Seed

Jalankan seed SQL untuk create roles records:

```bash
cd apps/api
psql -d vendortrack -f src/database/seeds/01-seed-users-roles.sql
```

**PENTING:** Role.name harus match dengan UserRole enum!

### 2. Restart Backend

```bash
cd apps/api
# Stop server (Ctrl+C) jika running
pnpm dev
```

### 3. Clear Browser Data

- Open DevTools → Application
- Clear cookies: `accessToken`, `refreshToken`
- Clear localStorage: `vendorTrack_user`

### 4. Test Login

1. Open: `http://localhost:3000/login`
2. Login dengan user yang ada di database (check dengan SQL query)
3. Password: Sesuai dengan hash di database

### 5. Verify Token

**Check Network Tab:**
- POST `/auth/login` → Response should have `accessToken` + `refreshToken`

**Check Application Tab:**
- Cookies → Should have `accessToken` + `refreshToken`

**Check API Calls:**
- GET `/menus/user/me` → Request headers should have `Authorization: Bearer <token>`

---

## 📝 Files Changed

### Frontend:
- ✅ `apps/web/lib/services/auth.service.ts` (NEW)
- ✅ `apps/web/hooks/use-auth.tsx` (Updated)
- ✅ `apps/web/app/login/page.tsx` (Updated)

### Backend:
- ✅ `apps/api/src/modules/auth/auth.service.ts` (Updated - added roleId to JWT)
- ✅ `apps/api/src/modules/access-control/roles/roles.service.ts` (Updated - added findByName)

### Docs:
- ✅ `docs/access-control/LOGIN_FIX.md` (Detailed documentation)
- ✅ `docs/access-control/BUGFIXES.md` (Bug fix summary)

---

## 🔑 JWT Payload Structure

```typescript
{
  sub: "user-uuid",           // User ID
  email: "user@example.com",  // User email
  role: "ADMIN_BGN",          // User role enum
  roleId: "role-uuid",        // Role ID from roles table (NEW!)
  permissions: [              // Permissions array
    "read:users",
    "create:roles",
    ...
  ],
  iat: 1234567890,           // Issued at
  exp: 1234567890            // Expires at
}
```

**Kenapa roleId penting?**
- Menu endpoint butuh `roleId` (UUID) untuk query menus dari role_menus table
- Sebelumnya: `user.role` (enum) tidak bisa digunakan untuk JOIN
- Sekarang: `user.roleId` (UUID) bisa langsung digunakan untuk query

---

## 🐛 Common Issues

### Issue: "Invalid credentials"
**Solution:** Check password hash di database. Pastikan bcrypt hash benar.

### Issue: "roleId is null in JWT"
**Solution:** Roles table belum di-seed atau Role.name tidak match dengan UserRole enum.

```sql
-- Check mapping
SELECT u.email, u.role, r.id as role_id, r.name as role_name
FROM users u
LEFT JOIN roles r ON r.name = u.role;

-- If role_id is NULL, insert missing role:
INSERT INTO roles (id, name, description)
VALUES (gen_random_uuid(), 'ADMIN_BGN', 'Administrator')
ON CONFLICT (name) DO NOTHING;
```

### Issue: "Cannot read properties of undefined (reading 'roleId')"
**Solution:** Old tokens masih di-cache. Clear cookies dan login ulang.

### Issue: Menu endpoint returns empty array
**Solution:** 
1. Check if role_menus table has data for this roleId
2. Check if menus table has data
3. Check if menu items have correct parent_id relationships

---

## ✅ Checklist

Before testing:
- [ ] Database seeded dengan roles records
- [ ] Backend restarted
- [ ] Browser cookies cleared
- [ ] Frontend refreshed

After login:
- [ ] POST /auth/login returns tokens
- [ ] Cookies contain accessToken + refreshToken
- [ ] GET /menus/user/me has Authorization header
- [ ] Menu sidebar loads correctly
- [ ] No console errors

---

## 📚 Full Documentation

Lihat `docs/access-control/LOGIN_FIX.md` untuk dokumentasi lengkap dengan:
- Detailed code changes
- Token flow diagram
- Database setup guide
- Troubleshooting guide
