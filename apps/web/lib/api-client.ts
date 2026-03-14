import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// --- Tipe Data ---
interface ApiErrorResponse {
  message: string;
  statusCode: number;
  details?: any;
}

export class ApiException extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// --- Konfigurasi Environment ---
// Sesuaikan base URL dengan env atau default ke lokal
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// --- Instance Axios ---
export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Timeout 15 detik
});

// --- Variabel State untuk Refresh Token ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Helper untuk memproses antrean request yang tertahan saat refresh token
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Helper Storage ---
export const TokenStorage = {
  getAccessToken: () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null),
  getRefreshToken: () => (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null),
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Abaikan penambahan token untuk endpoint auth (opsional, namun baik untuk optimasi)
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register') || config.url?.includes('/auth/refresh')) {
      return config;
    }

    const token = TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Jika error karena jaringan / network down
    if (!error.response) {
      return Promise.reject(
        new ApiException('Network Error: Please check your internet connection', 0)
      );
    }

    const status = error.response.status;
    const responseData = error.response.data as any;
    const errorMessage = responseData?.message || responseData?.error || 'An unexpected error occurred';

    // Handle 401 Unauthorized (Token Expired)
    if (status === 401 && !originalRequest._retry) {
      // Jika request gagal di endpoint login/refresh itu sendiri, jangan coba di-refresh lagi
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        TokenStorage.clearTokens();
        return Promise.reject(new ApiException(errorMessage, status, responseData));
      }

      if (isRefreshing) {
        // Jika sedang refresh, antrekan request ini
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        TokenStorage.clearTokens();
        // Redirect ke login (hanya jika di client-side)
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(new ApiException('Session expired. Please log in again.', 401));
      }

      try {
        // Panggil endpoint refresh token secara manual menggunakan axios dasar (bukan instance apiClient)
        // untuk menghindari interceptor loop
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        TokenStorage.setTokens(newAccessToken, newRefreshToken);
        
        // Update header di request yang gagal
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Lanjutkan antrean
        processQueue(null, newAccessToken);
        
        // Eksekusi ulang request awal
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenStorage.clearTokens();
        
        // Redirect ke login jika refresh token juga invalid
        if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
        
        return Promise.reject(new ApiException('Session expired. Please log in again.', 401));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle standard API Error Responses (selain 401 token refresh)
    return Promise.reject(new ApiException(errorMessage, status, responseData));
  }
);

// --- Export Helper API Methods (Opsional namun direkomendasikan) ---
export const api = {
  get: <T>(url: string, config?: any) => apiClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config).then((res) => res.data),
  patch: <T>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: any) => apiClient.delete<T>(url, config).then((res) => res.data),
};
