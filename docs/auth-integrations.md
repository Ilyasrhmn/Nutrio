# Dokumentasi Integrasi API Autentikasi - VendorTrack

Dokumentasi ini menjelaskan cara mengintegrasikan sistem autentikasi (Registrasi, Login, Refresh Token) dari backend NestJS ke aplikasi Frontend (Next.js).

**Base URL:** `http://localhost:3001`

---

## 1. Registrasi User
Mendaftarkan user baru ke sistem (Vendor atau Admin).

- **Endpoint:** `POST /auth/register`
- **Body (JSON):**
```json
{
  "email": "vendor@example.com",
  "password": "Password123!",
  "fullName": "Budi Santoso",
  "role": "vendor" 
}
```
> **Catatan Role:** Nilai yang valid adalah `vendor`, `inspector`, `admin_bgn`, `coordinator_sppg`, `dinkes`, `public`.

- **Responses:**
  - `201 Created`: Registrasi berhasil.
  - `400 Bad Request`: Validasi gagal (misal: password < 8 karakter).
  - `409 Conflict`: Email sudah terdaftar.

---

## 2. Login
Mendapatkan Access Token dan Refresh Token.

- **Endpoint:** `POST /auth/login`
- **Body (JSON):**
```json
{
  "email": "vendor@example.com",
  "password": "Password123!"
}
```

- **Response (Success 200 OK):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "vendor@example.com",
    "fullName": "Budi Santoso",
    "role": "vendor",
    "isActive": true
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

- **Penyimpanan Token (Rekomendasi):**
  - `accessToken`: Simpan di memory (state) atau cookie short-lived.
  - `refreshToken`: Simpan di `localStorage` atau `HttpOnly Cookie`.

---

## 3. Refresh Token
Memperbarui Access Token yang sudah expired (15 menit).

- **Endpoint:** `POST /auth/refresh`
- **Body (JSON):**
```json
{
  "refreshToken": "token-dari-login-atau-localstorage"
}
```

- **Response (Success 201 Created):**
```json
{
  "accessToken": "new-access-token-string",
  "refreshToken": "new-refresh-token-string"
}
```
> **PENTING:** Setiap kali refresh dilakukan, Refresh Token yang lama akan di-revoke dan diganti dengan yang baru (Token Rotation). Pastikan untuk selalu mengupdate `refreshToken` di storage Anda.

---

## 4. Mengakses Route Terproteksi
Untuk mengakses API yang memerlukan login, tambahkan header Authorization.

- **Header:** `Authorization: Bearer <accessToken>`
- **Contoh Error:**
  - `401 Unauthorized`: Token tidak valid atau expired.
  - `403 Forbidden`: Role user tidak memiliki izin untuk akses (RBAC).

---

## 5. Implementasi Axios Interceptor (Frontend)
Untuk mempermudah integrasi, kami telah menyediakan `apiClient` tersentralisasi di `apps/web/lib/api-client.ts`. Interceptor ini sudah menangani berbagai case kompleks secara otomatis.

### Fitur Utama `api-client.ts`:
1. **Auto-Inject Token:** Header `Authorization: Bearer <token>` otomatis ditambahkan ke setiap request (kecuali endpoint `/auth/*`).
2. **Auto-Refresh Token:** Jika API mengembalikan `401 Unauthorized`, interceptor akan menunda request, men-trigger refresh token di background, dan mereturn ulang request awal tanpa gagal.
3. **Queueing System:** Mencegah race condition ketika banyak request API bersamaan mengalami `401`. Semua request akan di-queue (antre) hingga proses refresh token pertama selesai.
4. **Standardisasi Error:** Semua API Error dibungkus menjadi class `ApiException` sehingga lebih mudah ditangkap di komponen.

### Cara Penggunaan di Komponen/Hook:

Gunakan object `api` yang diexport dari `api-client.ts`. Object ini membungkus response Axios sehingga Anda bisa langsung mendapatkan isi dari property `.data`.

```typescript
import { api, ApiException } from '@/lib/api-client';

// 1. Fetching Data
async function fetchDashboard() {
  try {
    // Tidak perlu `res.data`, karena `api.get` sudah mengembalikan `.data`
    const dashboardData = await api.get('/dashboard'); 
    console.log(dashboardData);
  } catch (error) {
    if (error instanceof ApiException) {
      console.error(`Error ${error.statusCode}: ${error.message}`);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

// 2. Post Data
async function submitForm(payload) {
  try {
    const result = await api.post('/users', payload);
    alert('Success!');
  } catch (error) {
    // Error handling yang bersih
    alert(error.message);
  }
}
```

### Mengelola Sesi Login Secara Manual:
Jika Anda perlu mengeset token saat login atau menghapusnya saat logout, gunakan `TokenStorage` helper yang juga diexport dari file tersebut.

```typescript
import { TokenStorage } from '@/lib/api-client';

// Saat sukses login:
TokenStorage.setTokens(response.accessToken, response.refreshToken);

// Saat logout:
TokenStorage.clearTokens();
```

---

## 6. Role-Based Access Control (RBAC)
Beberapa API hanya bisa diakses oleh role tertentu. Role user dapat dilihat pada payload JWT atau response login (`user.role`).

| Role | Deskripsi |
| :--- | :--- |
| `vendor` | Pelaku usaha dapur/catering |
| `inspector` | Petugas lapangan BGN |
| `admin_bgn` | Administrator pusat |
| `public` | Masyarakat umum (scan QR) |
