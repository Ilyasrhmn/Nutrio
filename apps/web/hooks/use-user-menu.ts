'use client';

import { useState, useEffect } from 'react';
import { menusService } from '@/lib/services/menus.service';
import { MenuTree } from '@workspace/common';
import { useAuth } from './use-auth';

export function useUserMenu() {
  const [menus, setMenus] = useState<MenuTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMenu() {
      if (!user) {
        setMenus([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use getMyMenu() which calls /menus/user/me endpoint
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
    }

    fetchMenu();
  }, [user]);

  return { menus, loading, error, refresh: loadData };

  async function loadData() {
    try {
      setLoading(true);
      // Use getMyMenu() which calls /menus/user/me endpoint
      const data = await menusService.getMyMenu();
      setMenus(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to refresh user menu:', err);
      setError(err);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }
}
