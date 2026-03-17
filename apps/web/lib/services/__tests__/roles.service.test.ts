import { rolesService, CreateRoleData, UpdateRoleData } from '../roles.service';
import { api } from '../../api-client';
import { RoleWithPermissions, DatabasePermission } from '@workspace/common';

jest.mock('../../api-client');

describe('rolesService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all roles with default pagination', async () => {
      const mockResult = {
        items: [{ id: '1', name: 'Admin', permissions: [] }],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockApi.get.mockResolvedValue(mockResult);

      const result = await rolesService.getAll();

      expect(mockApi.get).toHaveBeenCalledWith('/roles?page=1&limit=20');
      expect(result).toEqual(mockResult);
    });

    it('should fetch roles with custom pagination', async () => {
      const mockResult = {
        items: [],
        total: 0,
        page: 2,
        limit: 10,
      };
      mockApi.get.mockResolvedValue(mockResult);

      await rolesService.getAll(2, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/roles?page=2&limit=10');
    });

    it('should fetch roles with search parameter', async () => {
      const mockResult = {
        items: [{ id: '1', name: 'Admin', permissions: [] }],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockApi.get.mockResolvedValue(mockResult);

      await rolesService.getAll(1, 20, 'admin');

      expect(mockApi.get).toHaveBeenCalledWith('/roles?page=1&limit=20&search=admin');
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      mockApi.get.mockRejectedValue(mockError);

      await expect(rolesService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch role by ID', async () => {
      const mockRole: RoleWithPermissions = {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.get.mockResolvedValue(mockRole);

      const result = await rolesService.getById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/roles/1');
      expect(result).toEqual(mockRole);
    });

    it('should handle role not found', async () => {
      mockApi.get.mockRejectedValue({ status: 404, message: 'Role not found' });

      await expect(rolesService.getById('999')).rejects.toMatchObject({
        status: 404,
        message: 'Role not found',
      });
    });
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createData: CreateRoleData = {
        name: 'New Role',
        description: 'Test role',
      };
      const mockRole: RoleWithPermissions = {
        id: '2',
        name: 'New Role',
        description: 'Test role',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.post.mockResolvedValue(mockRole);

      const result = await rolesService.create(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/roles', createData);
      expect(result).toEqual(mockRole);
    });

    it('should handle validation errors', async () => {
      const createData: CreateRoleData = { name: '' };
      mockApi.post.mockRejectedValue({
        status: 400,
        message: 'Name is required',
      });

      await expect(rolesService.create(createData)).rejects.toMatchObject({
        status: 400,
        message: 'Name is required',
      });
    });

    it('should handle duplicate role name', async () => {
      const createData: CreateRoleData = { name: 'Admin' };
      mockApi.post.mockRejectedValue({
        status: 409,
        message: 'Role with this name already exists',
      });

      await expect(rolesService.create(createData)).rejects.toMatchObject({
        status: 409,
      });
    });
  });

  describe('update', () => {
    it('should update role', async () => {
      const updateData: UpdateRoleData = {
        name: 'Updated Role',
        description: 'Updated description',
      };
      const mockRole: RoleWithPermissions = {
        id: '1',
        name: 'Updated Role',
        description: 'Updated description',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.put.mockResolvedValue(mockRole);

      const result = await rolesService.update('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/roles/1', updateData);
      expect(result).toEqual(mockRole);
    });

    it('should handle partial updates', async () => {
      const updateData: UpdateRoleData = { description: 'New description' };
      mockApi.put.mockResolvedValue({} as RoleWithPermissions);

      await rolesService.update('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/roles/1', updateData);
    });
  });

  describe('delete', () => {
    it('should delete role', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await rolesService.delete('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/roles/1');
    });

    it('should handle role with assigned users error', async () => {
      mockApi.delete.mockRejectedValue({
        status: 400,
        message: 'Cannot delete role with assigned users',
      });

      await expect(rolesService.delete('1')).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe('getPermissions', () => {
    it('should fetch role permissions', async () => {
      const mockPermissions: DatabasePermission[] = [
        {
          id: '1',
          action: 'read',
          subject: 'Dashboard',
          description: 'Read dashboard',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockApi.get.mockResolvedValue(mockPermissions);

      const result = await rolesService.getPermissions('1');

      expect(mockApi.get).toHaveBeenCalledWith('/roles/1/permissions');
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('addPermissions', () => {
    it('should add permissions to role', async () => {
      const permissionIds = ['p1', 'p2'];
      const mockRole: RoleWithPermissions = {
        id: '1',
        name: 'Admin',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.post.mockResolvedValue(mockRole);

      const result = await rolesService.addPermissions('1', permissionIds);

      expect(mockApi.post).toHaveBeenCalledWith('/roles/1/permissions', {
        permissionIds,
      });
      expect(result).toEqual(mockRole);
    });

    it('should handle empty permission list', async () => {
      mockApi.post.mockResolvedValue({} as RoleWithPermissions);

      await rolesService.addPermissions('1', []);

      expect(mockApi.post).toHaveBeenCalledWith('/roles/1/permissions', {
        permissionIds: [],
      });
    });
  });

  describe('removePermissions', () => {
    it('should remove permissions from role', async () => {
      const permissionIds = ['p1', 'p2'];
      const mockRole: RoleWithPermissions = {
        id: '1',
        name: 'Admin',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.delete.mockResolvedValue(mockRole);

      const result = await rolesService.removePermissions('1', permissionIds);

      expect(mockApi.delete).toHaveBeenCalledWith('/roles/1/permissions', {
        data: { permissionIds },
      });
      expect(result).toEqual(mockRole);
    });
  });
});
