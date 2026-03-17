import { api } from '../api-client';
import { MenuItem, MenuTree } from '@workspace/common';

export interface CreateMenuData {
  name: string;
  path: string;
  icon: string;
  order: number;
  parentId?: string | null;
  requiredPermission?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Menus API Service
 */
export const menusService = {
  /**
   * Get full menu tree
   */
  async getTree(): Promise<MenuTree[]> {
    return api.get<MenuTree[]>('/menus/tree');
  },

  /**
   * Get current user's menu (uses JWT auth)
   */
  async getMyMenu(): Promise<MenuTree[]> {
    return api.get<MenuTree[]>('/menus/user/me');
  },

  /**
   * Get user menu based on role ID (admin use)
   */
  async getUserMenu(roleId: string): Promise<MenuTree[]> {
    return api.get<MenuTree[]>(`/menus/user/${roleId}`);
  },

  /**
   * Get menu by ID
   */
  async getById(id: string): Promise<MenuItem & { assignedRoles?: Array<{ id: string; name: string }> }> {
    return api.get<MenuItem & { assignedRoles?: Array<{ id: string; name: string }> }>(`/menus/${id}`);
  },

  /**
   * Create new menu item
   */
  async create(data: CreateMenuData): Promise<MenuItem> {
    return api.post<MenuItem>('/menus', data);
  },

  /**
   * Update menu item
   */
  async update(id: string, data: Partial<CreateMenuData>): Promise<MenuItem> {
    return api.put<MenuItem>(`/menus/${id}`, data);
  },

  /**
   * Delete menu item
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/menus/${id}`);
  },

  /**
   * Assign roles to menu
   */
  async assignRoles(menuId: string, roleIds: string[]): Promise<void> {
    return api.post<void>(`/menus/${menuId}/roles`, { roleIds });
  },

  /**
   * Remove role from menu
   */
  async removeRole(menuId: string, roleId: string): Promise<void> {
    return api.delete<void>(`/menus/${menuId}/roles/${roleId}`);
  },
};
