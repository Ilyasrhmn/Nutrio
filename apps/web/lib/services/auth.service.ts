import { api } from '../api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
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

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', data);
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return api.post<RegisterResponse>('/auth/register', data);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return api.post('/auth/refresh', { refreshToken });
  }
}

export const authService = new AuthService();
