import { permissionsService, CreatePermissionData } from '../permissions.service';
import { api } from '../../api-client';
import { DatabasePermission } from '@workspace/common';

jest.mock('../../api-client');

describe('permissionsService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all permissions grouped by subject', async () => {
      const mockPermissions: Record<string, DatabasePermission[]> = {
        Dashboard: [
          {
            id: '1',
            action: 'read',
            subject: 'Dashboard',
            description: 'Read dashboard',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        User: [
          {
            id: '2',
            action: 'manage',
            subject: 'User',
            description: 'Manage users',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      mockApi.get.mockResolvedValue(mockPermissions);

      const result = await permissionsService.getAll();

      expect(mockApi.get).toHaveBeenCalledWith('/permissions');
      expect(result).toEqual(mockPermissions);
    });

    it('should handle empty permissions', async () => {
      mockApi.get.mockResolvedValue({});

      const result = await permissionsService.getAll();

      expect(result).toEqual({});
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(permissionsService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch permission by ID with role count', async () => {
      const mockPermission = {
        id: '1',
        action: 'read',
        subject: 'Dashboard',
        description: 'Read dashboard',
        roleCount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.get.mockResolvedValue(mockPermission);

      const result = await permissionsService.getById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/permissions/1');
      expect(result).toEqual(mockPermission);
      expect(result.roleCount).toBe(3);
    });

    it('should handle permission not found', async () => {
      mockApi.get.mockRejectedValue({
        status: 404,
        message: 'Permission not found',
      });

      await expect(permissionsService.getById('999')).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      const createData: CreatePermissionData = {
        action: 'create',
        subject: 'Dashboard',
        description: 'Create dashboard',
      };
      const mockPermission: DatabasePermission = {
        id: '3',
        action: 'create',
        subject: 'Dashboard',
        description: 'Create dashboard',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.post.mockResolvedValue(mockPermission);

      const result = await permissionsService.create(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/permissions', createData);
      expect(result).toEqual(mockPermission);
    });

    it('should create permission without description', async () => {
      const createData: CreatePermissionData = {
        action: 'delete',
        subject: 'User',
      };
      mockApi.post.mockResolvedValue({} as DatabasePermission);

      await permissionsService.create(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/permissions', createData);
    });

    it('should handle duplicate permission error', async () => {
      const createData: CreatePermissionData = {
        action: 'read',
        subject: 'Dashboard',
      };
      mockApi.post.mockRejectedValue({
        status: 409,
        message: 'Permission already exists',
      });

      await expect(permissionsService.create(createData)).rejects.toMatchObject({
        status: 409,
      });
    });

    it('should handle validation errors', async () => {
      const createData: CreatePermissionData = {
        action: 'invalid_action',
        subject: 'Dashboard',
      };
      mockApi.post.mockRejectedValue({
        status: 400,
        message: 'Invalid action',
      });

      await expect(permissionsService.create(createData)).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe('update', () => {
    it('should update permission description', async () => {
      const mockPermission: DatabasePermission = {
        id: '1',
        action: 'read',
        subject: 'Dashboard',
        description: 'Updated description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.put.mockResolvedValue(mockPermission);

      const result = await permissionsService.update('1', 'Updated description');

      expect(mockApi.put).toHaveBeenCalledWith('/permissions/1', {
        description: 'Updated description',
      });
      expect(result).toEqual(mockPermission);
    });

    it('should handle empty description', async () => {
      mockApi.put.mockResolvedValue({} as DatabasePermission);

      await permissionsService.update('1', '');

      expect(mockApi.put).toHaveBeenCalledWith('/permissions/1', {
        description: '',
      });
    });
  });

  describe('delete', () => {
    it('should delete permission', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await permissionsService.delete('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/permissions/1');
    });

    it('should handle permission with assigned roles error', async () => {
      mockApi.delete.mockRejectedValue({
        status: 400,
        message: 'Cannot delete permission assigned to roles',
      });

      await expect(permissionsService.delete('1')).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe('getRolesUsingPermission', () => {
    it('should fetch roles using a permission', async () => {
      const mockRoles = [
        { id: '1', name: 'Admin' },
        { id: '2', name: 'Editor' },
      ];
      mockApi.get.mockResolvedValue(mockRoles);

      const result = await permissionsService.getRolesUsingPermission('p1');

      expect(mockApi.get).toHaveBeenCalledWith('/permissions/p1/roles');
      expect(result).toEqual(mockRoles);
    });

    it('should return empty array when no roles use permission', async () => {
      mockApi.get.mockResolvedValue([]);

      const result = await permissionsService.getRolesUsingPermission('p1');

      expect(result).toEqual([]);
    });
  });
});
