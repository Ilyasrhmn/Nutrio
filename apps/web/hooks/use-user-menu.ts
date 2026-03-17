'use client';

import { useMenuContext } from './use-menu-context';

export function useUserMenu() {
  const { menus, loading, error, refresh } = useMenuContext();

  return { menus, loading, error, refresh };
}
