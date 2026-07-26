const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export const TokenStorage = {
  getAccessToken: () => (typeof window === 'undefined' ? null : localStorage.getItem('pwa_accessToken')),
  getRefreshToken: () => (typeof window === 'undefined' ? null : localStorage.getItem('pwa_refreshToken')),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('pwa_accessToken', accessToken);
    localStorage.setItem('pwa_refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('pwa_accessToken');
    localStorage.removeItem('pwa_refreshToken');
  },
};

type RequestConfig = {
  headers?: Record<string, string>;
};

const AUTH_EXEMPT_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const refreshToken = TokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Refresh failed');

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  TokenStorage.setTokens(data.accessToken, data.refreshToken);
}

async function request<T>(
  method: string,
  path: string,
  body?: BodyInit | null,
  config?: RequestConfig,
  retried = false,
): Promise<{ data: T }> {
  const headers: Record<string, string> = { ...config?.headers };
  if (body && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const isExempt = AUTH_EXEMPT_PATHS.some((p) => path.startsWith(p));
  if (!isExempt) {
    const token = TokenStorage.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ?? undefined,
  });

  if (res.status === 401 && !retried && !isExempt) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
        });
      }
      await refreshPromise;
      return request<T>(method, path, body, config, true);
    } catch {
      TokenStorage.clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Unauthenticated');
    }
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const json = (await res.json()) as { message?: string };
      message = json.message ?? message;
    } catch {
      // ignore parse errors
    }
    const err = Object.assign(new Error(message), {
      response: { data: { message }, status: res.status },
    });
    throw err;
  }

  const data = res.status === 204 ? null : ((await res.json()) as T);
  return { data: data as T };
}

export const apiClient = {
  get: <T = unknown>(path: string, config?: RequestConfig) =>
    request<T>('GET', path, null, config),

  post: <T = unknown>(path: string, body?: unknown, config?: RequestConfig) => {
    const bodyInit =
      body instanceof FormData
        ? body
        : body !== undefined
        ? JSON.stringify(body)
        : null;
    return request<T>('POST', path, bodyInit, config);
  },

  put: <T = unknown>(path: string, body?: unknown, config?: RequestConfig) => {
    const bodyInit = body !== undefined ? JSON.stringify(body) : null;
    return request<T>('PUT', path, bodyInit, config);
  },

  patch: <T = unknown>(path: string, body?: unknown, config?: RequestConfig) => {
    const bodyInit = body !== undefined ? JSON.stringify(body) : null;
    return request<T>('PATCH', path, bodyInit, config);
  },

  delete: <T = unknown>(path: string, config?: RequestConfig) =>
    request<T>('DELETE', path, null, config),
};
