"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuTree } from '@workspace/common';
import { menusService } from '@/lib/services/menus.service';
import { useAuth } from './use-auth';

interface MenuContextType {
  menus: MenuTree[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = useState<MenuTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchMenu = useCallback(async () => {
    if (!user) {
      setMenus([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await menusService.getMyMenu();
      setMenus(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch user menu:', err);
      setError(err);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return (
    <MenuContext.Provider value={{ menus, loading, error, refresh: fetchMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
}
