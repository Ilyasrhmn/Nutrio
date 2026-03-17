import { api } from '../api-client';
import { RoleWithPermissions, PaginatedResult, DatabasePermission } from '@workspace/common';

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

/**
 * Roles API Service
 */
export const rolesService = {
  /**
   * Get all roles with pagination
   */
  async getAll(page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResult<RoleWithPermissions>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    
    return api.get<PaginatedResult<RoleWithPermissions>>(`/roles?${params.toString()}`);
  },

  /**
   * Get role by ID with permissions
   */
  async getById(id: string): Promise<RoleWithPermissions> {
    return api.get<RoleWithPermissions>(`/roles/${id}`);
  },

  /**
   * Create new role
   */
  async create(data: CreateRoleData): Promise<RoleWithPermissions> {
    return api.post<RoleWithPermissions>('/roles', data);
  },

  /**
   * Update role
   */
  async update(id: string, data: UpdateRoleData): Promise<RoleWithPermissions> {
    return api.put<RoleWithPermissions>(`/roles/${id}`, data);
  },

  /**
   * Delete role
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/roles/${id}`);
  },

  /**
   * Get role permissions
   */
  async getPermissions(roleId: string): Promise<DatabasePermission[]> {
    return api.get<DatabasePermission[]>(`/roles/${roleId}/permissions`);
  },

  /**
   * Add permissions to role
   */
  async addPermissions(roleId: string, permissionIds: string[]): Promise<RoleWithPermissions> {
    return api.post<RoleWithPermissions>(`/roles/${roleId}/permissions`, { permissionIds });
  },

  /**
   * Remove permissions from role
   */
  async removePermissions(roleId: string, permissionIds: string[]): Promise<RoleWithPermissions> {
    return api.delete<RoleWithPermissions>(`/roles/${roleId}/permissions`, {
      data: { permissionIds },
    });
  },
};
