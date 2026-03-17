import { api } from '../api-client';
import { DatabasePermission } from '@workspace/common';

export interface CreatePermissionData {
  action: string;
  subject: string;
  description?: string;
}

/**
 * Permissions API Service
 */
export const permissionsService = {
  /**
   * Get all permissions grouped by subject
   */
  async getAll(): Promise<Record<string, DatabasePermission[]>> {
    return api.get<Record<string, DatabasePermission[]>>('/permissions');
  },

  /**
   * Get permission by ID
   */
  async getById(id: string): Promise<DatabasePermission & { roleCount: number }> {
    return api.get<DatabasePermission & { roleCount: number }>(`/permissions/${id}`);
  },

  /**
   * Create new permission
   */
  async create(data: CreatePermissionData): Promise<DatabasePermission> {
    return api.post<DatabasePermission>('/permissions', data);
  },

  /**
   * Update permission
   */
  async update(id: string, description: string): Promise<DatabasePermission> {
    return api.put<DatabasePermission>(`/permissions/${id}`, { description });
  },

  /**
   * Delete permission
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/permissions/${id}`);
  },

  /**
   * Get roles using a permission
   */
  async getRolesUsingPermission(id: string): Promise<Array<{ id: string; name: string }>> {
    return api.get<Array<{ id: string; name: string }>>(`/permissions/${id}/roles`);
  },
};
