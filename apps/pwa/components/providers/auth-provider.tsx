"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole } from "@workspace/common/types";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const mockUsers: Record<UserRole, User> = {
  [UserRole.VENDOR]: {
    id: "v1",
    name: "Dapur Sehat Bu Sari",
    role: UserRole.VENDOR,
    avatar: "BS",
    organization: "Vendor Pontianak",
  },
  [UserRole.SUPPLIER]: {
    id: "s1",
    name: "PT Berkah Jaya Abadi",
    role: UserRole.SUPPLIER,
    avatar: "BJ",
    organization: "Supplier Utama",
  },
  [UserRole.COORDINATOR_SPPG]: {
    id: "sc1",
    name: "Andi Saputra",
    role: UserRole.COORDINATOR_SPPG,
    avatar: "AS",
    organization: "SDN 01 Pontianak",
  },
  [UserRole.PUBLIC]: {
    id: "p1",
    name: "Warga Peduli",
    role: UserRole.PUBLIC,
    avatar: "WP",
  },
  // Add fallback roles if needed by the app
  [UserRole.INSPECTOR]: { id: "i1", name: "Auditor BGN", role: UserRole.INSPECTOR },
  [UserRole.ADMIN_BGN]: { id: "a1", name: "Admin BGN", role: UserRole.ADMIN_BGN },
  [UserRole.DINKES]: { id: "d1", name: "Petugas Dinkes", role: UserRole.DINKES },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem("pwa_user");
    if (savedUser) {
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

  const login = (role: UserRole) => {
    const userData = mockUsers[role];
    setUser(userData);
    localStorage.setItem("pwa_user", JSON.stringify(userData));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pwa_user");
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
