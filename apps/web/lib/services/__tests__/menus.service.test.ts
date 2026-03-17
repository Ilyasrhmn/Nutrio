import { menusService, CreateMenuData } from '../menus.service';
import { api } from '../../api-client';
import { MenuItem, MenuTree } from '@workspace/common';

jest.mock('../../api-client');

describe('menusService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTree', () => {
    it('should fetch full menu tree', async () => {
      const mockTree: MenuTree[] = [
        {
          id: '1',
          name: 'Dashboard',
          path: '/dashboard',
          icon: 'Home',
          order: 1,
          parentId: null,
          requiredPermission: 'read:Dashboard',
          metadata: {},
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockApi.get.mockResolvedValue(mockTree);

      const result = await menusService.getTree();

      expect(mockApi.get).toHaveBeenCalledWith('/menus/tree');
      expect(result).toEqual(mockTree);
    });

    it('should handle nested menu tree', async () => {
      const mockTree: MenuTree[] = [
        {
          id: '1',
          name: 'Admin',
          path: '/admin',
          icon: 'Settings',
          order: 1,
          parentId: null,
          requiredPermission: null,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [
            {
              id: '2',
              name: 'Users',
              path: '/admin/users',
              icon: 'Users',
              order: 1,
              parentId: '1',
              requiredPermission: 'manage:User',
              metadata: {},
              children: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ];
      mockApi.get.mockResolvedValue(mockTree);

      const result = await menusService.getTree();

      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].name).toBe('Users');
    });

    it('should handle empty menu tree', async () => {
      mockApi.get.mockResolvedValue([]);

      const result = await menusService.getTree();

      expect(result).toEqual([]);
    });
  });

  describe('getUserMenu', () => {
    it('should fetch user menu filtered by role', async () => {
      const mockMenu: MenuTree[] = [
        {
          id: '1',
          name: 'Dashboard',
          path: '/dashboard',
          icon: 'Home',
          order: 1,
          parentId: null,
          requiredPermission: 'read:Dashboard',
          metadata: {},
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockApi.get.mockResolvedValue(mockMenu);

      const result = await menusService.getUserMenu('role-1');

      expect(mockApi.get).toHaveBeenCalledWith('/menus/user/role-1');
      expect(result).toEqual(mockMenu);
    });
  });

  describe('getById', () => {
    it('should fetch menu by ID', async () => {
      const mockMenu = {
        id: '1',
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'Home',
        order: 1,
        parentId: null,
        requiredPermission: 'read:Dashboard',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.get.mockResolvedValue(mockMenu);

      const result = await menusService.getById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/menus/1');
      expect(result).toEqual(mockMenu);
    });

    it('should fetch menu with assigned roles', async () => {
      const mockMenu = {
        id: '1',
        name: 'Admin',
        path: '/admin',
        icon: 'Settings',
        order: 1,
        parentId: null,
        requiredPermission: null,
        metadata: {},
        assignedRoles: [
          { id: 'r1', name: 'Admin' },
          { id: 'r2', name: 'Manager' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.get.mockResolvedValue(mockMenu);

      const result = await menusService.getById('1');

      expect(result.assignedRoles).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create a new menu item', async () => {
      const createData: CreateMenuData = {
        name: 'New Menu',
        path: '/new',
        icon: 'Plus',
        order: 1,
      };
      const mockMenu: MenuItem = {
        id: '2',
        name: 'New Menu',
        path: '/new',
        icon: 'Plus',
        order: 1,
        parentId: null,
        requiredPermission: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.post.mockResolvedValue(mockMenu);

      const result = await menusService.create(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/menus', createData);
      expect(result).toEqual(mockMenu);
    });

    it('should create menu with parent', async () => {
      const createData: CreateMenuData = {
        name: 'Submenu',
        path: '/admin/submenu',
        icon: 'Folder',
        order: 1,
        parentId: 'parent-1',
      };
      mockApi.post.mockResolvedValue({} as MenuItem);

      await menusService.create(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/menus', createData);
    });

    it('should handle validation errors', async () => {
      const createData: CreateMenuData = {
        name: '',
        path: '',
        icon: '',
        order: 0,
      };
      mockApi.post.mockRejectedValue({
        status: 400,
        message: 'Validation failed',
      });

      await expect(menusService.create(createData)).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe('update', () => {
    it('should update menu item', async () => {
      const updateData: Partial<CreateMenuData> = {
        name: 'Updated Menu',
        icon: 'Star',
      };
      const mockMenu: MenuItem = {
        id: '1',
        name: 'Updated Menu',
        path: '/dashboard',
        icon: 'Star',
        order: 1,
        parentId: null,
        requiredPermission: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockApi.put.mockResolvedValue(mockMenu);

      const result = await menusService.update('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/menus/1', updateData);
      expect(result).toEqual(mockMenu);
    });

    it('should handle partial updates', async () => {
      const updateData: Partial<CreateMenuData> = { order: 5 };
      mockApi.put.mockResolvedValue({} as MenuItem);

      await menusService.update('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/menus/1', updateData);
    });
  });

  describe('delete', () => {
    it('should delete menu item', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await menusService.delete('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/menus/1');
    });

    it('should handle menu with children error', async () => {
      mockApi.delete.mockRejectedValue({
        status: 400,
        message: 'Cannot delete menu with children',
      });

      await expect(menusService.delete('1')).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe('assignRoles', () => {
    it('should assign roles to menu', async () => {
      const roleIds = ['r1', 'r2', 'r3'];
      mockApi.post.mockResolvedValue(undefined);

      await menusService.assignRoles('m1', roleIds);

      expect(mockApi.post).toHaveBeenCalledWith('/menus/m1/roles', {
        roleIds,
      });
    });

    it('should handle empty role list', async () => {
      mockApi.post.mockResolvedValue(undefined);

      await menusService.assignRoles('m1', []);

      expect(mockApi.post).toHaveBeenCalledWith('/menus/m1/roles', {
        roleIds: [],
      });
    });
  });

  describe('removeRole', () => {
    it('should remove role from menu', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await menusService.removeRole('m1', 'r1');

      expect(mockApi.delete).toHaveBeenCalledWith('/menus/m1/roles/r1');
    });
  });
});
