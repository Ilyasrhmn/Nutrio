const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

type RequestConfig = {
  headers?: Record<string, string>;
};

async function refreshToken(): Promise<void> {
  await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
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

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body ?? undefined,
  });

  if (res.status === 401 && !retried) {
    try {
      await refreshToken();
      return request<T>(method, path, body, config, true);
    } catch {
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Unauthenticated');
    }
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const json = await res.json() as { message?: string };
      message = json.message ?? message;
    } catch {
      // ignore parse errors
    }
    const err = Object.assign(new Error(message), {
      response: { data: { message }, status: res.status },
    });
    throw err;
  }

  const data = res.status === 204 ? null : (await res.json()) as T;
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
