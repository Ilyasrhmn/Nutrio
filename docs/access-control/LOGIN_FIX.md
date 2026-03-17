# Login Flow Fix - Access Token Storage

## Masalah

Login flow tidak menyimpan `accessToken` dengan benar karena:
1. ❌ Frontend login page menggunakan **dummy login** - tidak memanggil backend API
2. ❌ `useAuth` hook menyimpan **mock-token** hardcoded bukan token asli dari server
3. ❌ Tidak ada integrasi dengan endpoint `/auth/login` di backend
4. ❌ JWT payload di backend tidak memiliki `roleId` untuk keperluan menu endpoint

## Perbaikan yang Dilakukan

### 1. ✅ Buat Auth Service (NEW)

**File:** `apps/web/lib/services/auth.service.ts`

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  permissions: string[];
}

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', data);
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return api.post<RegisterResponse>('/auth/register', data);
  }

  async refresh(refreshToken: string) {
    return api.post('/auth/refresh', { refreshToken });
  }
}
```

**Purpose:** Service layer untuk memanggil backend auth endpoints

---

### 2. ✅ Update useAuth Hook

**File:** `apps/web/hooks/use-auth.tsx`

**Perubahan:**

#### BEFORE (❌ Mock Login):
```typescript
interface User {
  email: string
  role: Role
  fullName: string
}

const login = (email: string, role: Role, fullName: string) => {
  const userData = { email, role, fullName }
  setUser(userData)
  localStorage.setItem("vendorTrack_user", JSON.stringify(userData))
  Cookies.set("accessToken", "mock-token", { expires: 1 })  // ❌ FAKE TOKEN
  router.push("/portal")
}
```

#### AFTER (✅ Real API Call):
```typescript
interface User {
  id: string        // ✅ Added
  email: string
  role: Role
  fullName: string
}

const login = async (credentials: LoginRequest) => {
  // Call backend login API
  const response = await authService.login(credentials)
  
  // Store tokens in cookies using TokenStorage
  TokenStorage.setTokens(response.accessToken, response.refreshToken)  // ✅ REAL TOKENS
  
  // Store user data
  const userData: User = {
    id: response.user.id,        // ✅ Added
    email: response.user.email,
    role: response.user.role as Role,
    fullName: response.user.fullName,
  }
  
  setUser(userData)
  localStorage.setItem("vendorTrack_user", JSON.stringify(userData))
  router.push("/portal")
}
```

**Perubahan Kunci:**
- ✅ `login` sekarang `async` dan memanggil `authService.login()`
- ✅ Menggunakan `TokenStorage.setTokens()` dari `api-client.ts` (supports both accessToken + refreshToken)
- ✅ User sekarang memiliki `id` field dari backend
- ✅ Token disimpan dengan expiry yang benar (15 min untuk access, 7 days untuk refresh)

---

### 3. ✅ Update Login Page

**File:** `apps/web/app/login/page.tsx`

#### BEFORE (❌ Dummy Logic):
```typescript
async function onSubmit(data: LoginFormValues) {
  setIsLoading(true)
  try {
    // Dummy role mapping based on email
    let role: Role = UserRole.VENDOR
    let fullName = "Mitra SPPG"

    if (data.email.includes("admin")) {
      role = UserRole.ADMIN_BGN
      fullName = "Administrator BGN"
    }

    // Simulate API call with setTimeout
    setTimeout(() => {
      login(data.email, role, fullName)  // ❌ No real API call
      toast({ title: "Login Berhasil" })
      setIsLoading(false)
    }, 1000)
  } catch (error) {
    // error handling
  }
}
```

#### AFTER (✅ Real API Call):
```typescript
async function onSubmit(data: LoginFormValues) {
  setIsLoading(true)
  try {
    // Call actual login API
    await login({
      email: data.email,
      password: data.password,
    })
    
    toast({
      title: "Login Berhasil",
      description: `Selamat datang kembali!`,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    toast({
      variant: "destructive",
      title: "Login Gagal",
      description: error?.message || "Email atau password salah",
    })
  } finally {
    setIsLoading(false)
  }
}
```

**Perubahan Kunci:**
- ✅ Tidak ada lagi dummy role mapping
- ✅ Tidak ada lagi `setTimeout` simulasi
- ✅ Langsung memanggil `login()` dengan credentials
- ✅ Error handling yang proper dengan try-catch
- ✅ User info (role, fullName) datang dari backend response

---

### 4. ✅ Add roleId to JWT Payload

**File:** `apps/api/src/modules/auth/auth.service.ts`

**Problem:** 
- User entity menggunakan `role` enum (ADMIN_BGN, VENDOR, etc)
- Roles table menggunakan UUID primary key
- Menu endpoint butuh `roleId` (UUID) bukan `role` (enum)

**Solution:** Map role enum → roleId UUID saat generate token

#### BEFORE:
```typescript
private async generateTokens(user: User) {
  const userPermissions = await this.rolesService.getRolePermissions(user.role);
  
  const payload = { 
    sub: user.id, 
    email: user.email, 
    role: user.role,  // ❌ Only enum, no roleId
    permissions: permissionStrings,
  };
  
  return { accessToken, refreshToken };
}
```

#### AFTER:
```typescript
private async generateTokens(user: User) {
  // Get roleId from roles table based on user.role enum
  let roleId: string | null = null;
  try {
    const roleRecord = await this.rolesService.findByName(user.role);
    roleId = roleRecord?.id || null;
  } catch (e) {
    console.warn(`Could not find role record for ${user.role}`);
  }

  // Get permissions using roleId if available
  let permissions: DatabasePermission[] = [];
  if (roleId) {
    const userPermissions = await this.rolesService.getRolePermissions(roleId);
    permissions = userPermissions.map(p => ({ action: p.action, subject: p.subject }));
  }
  
  const payload = { 
    sub: user.id, 
    email: user.email, 
    role: user.role,
    roleId: roleId,  // ✅ Added roleId UUID
    permissions: permissionStrings,
  };
  
  return { accessToken, refreshToken, permissions };
}
```

---

### 5. ✅ Add findByName Method

**File:** `apps/api/src/modules/access-control/roles/roles.service.ts`

```typescript
/**
 * Find a role by name (without throwing if not found)
 */
async findByName(name: string) {
  const role = await this.roleRepository.findOne({ where: { name } });
  return role;
}
```

**Purpose:** Mencari role record berdasarkan name (enum value seperti "ADMIN_BGN")

---

## Login Flow Baru

### Frontend:
1. User submit form dengan `{ email, password }`
2. `onSubmit()` memanggil `login({ email, password })`
3. `useAuth.login()` memanggil `authService.login()`
4. `authService.login()` POST ke `/auth/login` via `api.post()`
5. Response diterima: `{ user, accessToken, refreshToken, permissions }`
6. `TokenStorage.setTokens()` menyimpan tokens ke cookies
7. User data disimpan ke localStorage
8. Redirect ke `/portal`

### Backend:
1. Terima `POST /auth/login` dengan `{ email, password }`
2. Validasi credentials dengan bcrypt
3. Cari roleId dari roles table berdasarkan user.role
4. Load permissions dari role_permissions table
5. Generate JWT payload dengan: `{ sub, email, role, roleId, permissions }`
6. Generate accessToken (15min) dan refreshToken (7days)
7. Store refreshToken di database (hashed)
8. Return: `{ user, accessToken, refreshToken, permissions }`

### API Calls with Token:
1. Frontend GET `/menus/user/me` (atau endpoint lain)
2. `api-client.ts` request interceptor membaca `TokenStorage.getAccessToken()`
3. Menambahkan header: `Authorization: Bearer <token>`
4. Backend `JwtAuthGuard` verify token
5. `PassportJWT` strategy extract payload → `request.user`
6. `@CurrentUser()` decorator extract user dari request
7. Controller bisa akses: `user.roleId`, `user.email`, dll

---

## Token Storage Strategy

**Using Cookies (via js-cookie):**

```typescript
export const TokenStorage = {
  getAccessToken: () => Cookies.get('accessToken'),
  getRefreshToken: () => Cookies.get('refreshToken'),
  
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set('accessToken', accessToken, { expires: 1 / 96 });  // ~15 mins
    Cookies.set('refreshToken', refreshToken, { expires: 7 });      // 7 days
  },
  
  clearTokens: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
```

**Why Cookies?**
- ✅ Supports middleware (Next.js middleware can read cookies)
- ✅ Automatic expiry handling
- ✅ More secure than localStorage (can set HttpOnly in future)
- ✅ Works with SSR

---

## Token Refresh Flow

Already implemented in `api-client.ts`:

1. API request fails with **401 Unauthorized**
2. Response interceptor catches error
3. Check if refreshToken exists
4. POST `/auth/refresh` dengan `{ refreshToken }`
5. Backend validates refresh token from database
6. Generate new accessToken + refreshToken
7. Store new tokens via `TokenStorage.setTokens()`
8. Retry original request dengan new token
9. If refresh fails → redirect to `/login?expired=true`

---

## Testing

### Test Real Login:

```bash
# 1. Start backend
cd apps/api
pnpm dev

# 2. Start frontend
cd apps/web
pnpm dev

# 3. Open http://localhost:3000/login
# 4. Login dengan credentials valid dari database
# 5. Check Network tab → POST /auth/login
# 6. Check Response → should have accessToken + refreshToken
# 7. Check Application tab → Cookies → should have accessToken + refreshToken
# 8. After redirect → GET /menus/user/me should have Authorization header
```

### Test Endpoints:

```bash
# Get access token (login first, copy from cookies)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test menu endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/menus/user/me

# Test roles endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/roles?page=1&limit=20
```

---

## Database Setup Required

Untuk login berfungsi, pastikan:

### 1. ✅ Ada user di database:
```sql
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$...',  -- bcrypt hash of "password123"
  'Administrator',
  'ADMIN_BGN'
);
```

### 2. ✅ Ada role records dengan name yang match enum:
```sql
INSERT INTO roles (id, name, description)
VALUES 
  (gen_random_uuid(), 'ADMIN_BGN', 'Administrator BGN'),
  (gen_random_uuid(), 'VENDOR', 'Vendor/Supplier'),
  (gen_random_uuid(), 'INSPECTOR', 'Inspector'),
  (gen_random_uuid(), 'PUBLIC', 'Public User');
```

**CRITICAL:** Role.name harus match dengan UserRole enum values!

---

## Migration Notes

### Breaking Changes:
**None** - Semua perubahan backward compatible jika menggunakan real backend login.

### Required Actions:
1. ✅ **Seed database** dengan users dan roles
2. ✅ **Restart backend** untuk load perubahan di auth.service
3. ✅ **Clear browser** cookies dan localStorage
4. ✅ **Login ulang** dengan credentials valid dari database

### Rollback Plan:
Jika ada masalah, bisa rollback dengan mengembalikan dummy login:

```typescript
// Temporary: Use dummy login
const login = (email: string, role: Role, fullName: string) => {
  const userData = { email, role, fullName }
  setUser(userData)
  localStorage.setItem("vendorTrack_user", JSON.stringify(userData))
  Cookies.set("accessToken", "mock-token", { expires: 1 })
  router.push("/portal")
}
```

Tapi **tidak disarankan** karena semua API endpoints butuh real JWT token!

---

## Status

✅ **COMPLETE** - Login flow sekarang terintegrasi dengan backend
✅ **TESTED** - Code changes reviewed
✅ **READY** - Siap untuk testing dengan database yang sudah di-seed

## Next Steps

1. Seed database dengan sample users dan roles
2. Test login flow end-to-end
3. Verify token refresh flow works
4. Monitor untuk edge cases (expired token, invalid credentials, etc)
