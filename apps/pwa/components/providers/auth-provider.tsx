"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole } from "@workspace/common/types";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, TokenStorage } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface LoginResponse {
  user: { id: string; email: string; fullName: string; role: string };
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "pwa_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    const token = TokenStorage.getAccessToken();
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const isPublicRoute = pathname === "/login" || pathname.startsWith("/publik");
    if (!isLoading && !user && !isPublicRoute) {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<LoginResponse>("/auth/login", { email, password });
    TokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);

    const userData: User = {
      id: res.data.user.id,
      email: res.data.user.email,
      name: res.data.user.fullName,
      role: res.data.user.role as UserRole,
    };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    TokenStorage.clearTokens();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
