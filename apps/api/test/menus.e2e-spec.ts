import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenusModule } from '../src/modules/access-control/menus/menus.module';
import { Menu } from '../src/modules/access-control/menus/entities/menu.entity';
import { RoleMenu } from '../src/modules/access-control/menus/entities/role-menu.entity';
import { Role } from '../src/modules/access-control/roles/entities/role.entity';
import { AdminGuard } from '../src/modules/access-control/common/admin.guard';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('MenusController (e2e)', () => {
  let app: INestApplication;
  let menuRepository: Repository<Menu>;
  let roleMenuRepository: Repository<RoleMenu>;
  let roleRepository: Repository<Role>;

  const mockMenus: Partial<Menu>[] = [
    {
      id: 'm1',
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'Home',
      order: 1,
      parentId: null,
      requiredPermission: 'read:Dashboard',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'm2',
      name: 'Settings',
      path: '/settings',
      icon: 'Settings',
      order: 2,
      parentId: null,
      requiredPermission: null,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'm3',
      name: 'Users',
      path: '/settings/users',
      icon: 'Users',
      order: 1,
      parentId: 'm2',
      requiredPermission: 'manage:Users',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockMenuRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  const mockRoleMenuRepository = {
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockRoleRepository = {
    findBy: jest.fn(),
  };

  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MenusModule],
    })
      .overrideProvider(getRepositoryToken(Menu))
      .useValue(mockMenuRepository)
      .overrideProvider(getRepositoryToken(RoleMenu))
      .useValue(mockRoleMenuRepository)
      .overrideProvider(getRepositoryToken(Role))
      .useValue(mockRoleRepository)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    menuRepository = moduleFixture.get<Repository<Menu>>(getRepositoryToken(Menu));
    roleMenuRepository = moduleFixture.get<Repository<RoleMenu>>(
      getRepositoryToken(RoleMenu),
    );
    roleRepository = moduleFixture.get<Repository<Role>>(getRepositoryToken(Role));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /menus/tree', () => {
    it('should return menu tree structure', async () => {
      jest.spyOn(menuRepository, 'find').mockResolvedValue(mockMenus as Menu[]);

      const response = await request(app.getHttpServer())
        .get('/menus/tree')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should build hierarchical structure', async () => {
      jest.spyOn(menuRepository, 'find').mockResolvedValue(mockMenus as Menu[]);

      const response = await request(app.getHttpServer())
        .get('/menus/tree')
        .expect(200);

      // Find parent menu (Settings)
      const settingsMenu = response.body.find((m: any) => m.id === 'm2');
      if (settingsMenu) {
        expect(settingsMenu).toHaveProperty('children');
        expect(Array.isArray(settingsMenu.children)).toBe(true);
      }
    });
  });

  describe('GET /menus/user/:roleId', () => {
    it('should return filtered menu tree for role', async () => {
      // Mock menus assigned to a specific role
      const roleMenus = mockMenus.slice(0, 2); // Dashboard and Settings
      jest.spyOn(menuRepository, 'find').mockResolvedValue(roleMenus as Menu[]);

      const response = await request(app.getHttpServer())
        .get('/menus/user/role-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /menus/:id', () => {
    it('should return menu by id', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[0] as Menu);

      const response = await request(app.getHttpServer())
        .get('/menus/m1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'm1');
      expect(response.body).toHaveProperty('name', 'Dashboard');
    });

    it('should return 404 for non-existent menu', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);

      await request(app.getHttpServer()).get('/menus/invalid').expect(404);
    });
  });

  describe('POST /menus', () => {
    it('should create a new menu', async () => {
      const newMenu = {
        name: 'Reports',
        path: '/reports',
        icon: 'FileText',
        order: 3,
        parentId: null,
        requiredPermission: 'read:Reports',
        metadata: {},
      };

      const createdMenu = {
        id: 'm4',
        ...newMenu,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(menuRepository, 'create').mockReturnValue(createdMenu as Menu);
      jest.spyOn(menuRepository, 'save').mockResolvedValue(createdMenu as Menu);

      const response = await request(app.getHttpServer())
        .post('/menus')
        .send(newMenu)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newMenu.name);
    });

    it('should create submenu with parent', async () => {
      const submenu = {
        name: 'Audit Logs',
        path: '/settings/audit',
        icon: 'List',
        order: 2,
        parentId: 'm2',
      };

      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[1] as Menu);
      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(menuRepository, 'create').mockReturnValue({ id: 'm5', ...submenu } as Menu);
      jest.spyOn(menuRepository, 'save').mockResolvedValue({ id: 'm5', ...submenu } as Menu);

      const response = await request(app.getHttpServer())
        .post('/menus')
        .send(submenu)
        .expect(201);

      expect(response.body.parentId).toBe('m2');
    });

    it('should reject duplicate path', async () => {
      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(mockMenus[0] as Menu);

      await request(app.getHttpServer())
        .post('/menus')
        .send({ name: 'Duplicate', path: '/dashboard', icon: 'Home', order: 1 })
        .expect(400);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/menus')
        .send({ path: '/test', icon: 'Home', order: 1 })
        .expect(400);
    });

    it('should validate parent exists', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/menus')
        .send({
          name: 'Invalid',
          path: '/invalid',
          icon: 'X',
          order: 1,
          parentId: 'non-existent',
        })
        .expect(400);
    });
  });

  describe('PUT /menus/:id', () => {
    it('should update menu', async () => {
      const updateData = {
        name: 'Updated Dashboard',
        icon: 'LayoutDashboard',
      };

      const updatedMenu = {
        ...mockMenus[0],
        ...updateData,
        updatedAt: new Date(),
      };

      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne')
        .mockResolvedValueOnce(mockMenus[0] as Menu)
        .mockResolvedValueOnce(updatedMenu as Menu);
      jest.spyOn(menuRepository, 'save').mockResolvedValue(updatedMenu as Menu);

      const response = await request(app.getHttpServer())
        .put('/menus/m1')
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should prevent circular parent reference', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[1] as Menu);

      // Try to set m2 (Settings) as child of m3 (Users, which is already child of m2)
      await request(app.getHttpServer())
        .put('/menus/m2')
        .send({ parentId: 'm3' })
        .expect(400);
    });
  });

  describe('DELETE /menus/:id', () => {
    it('should delete menu without children', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[0] as Menu);
      jest.spyOn(menuRepository, 'find').mockResolvedValue([]);
      jest.spyOn(menuRepository, 'remove').mockResolvedValue(mockMenus[0] as Menu);

      await request(app.getHttpServer()).delete('/menus/m1').expect(200);

      expect(menuRepository.remove).toHaveBeenCalled();
    });

    it('should reject deleting menu with children', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[1] as Menu);
      jest.spyOn(menuRepository, 'find').mockResolvedValue([mockMenus[2]] as Menu[]);

      await request(app.getHttpServer()).delete('/menus/m2').expect(400);

      expect(menuRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('POST /menus/:id/roles', () => {
    it('should assign roles to menu', async () => {
      const roleIds = ['r1', 'r2'];
      const mockRoles = [
        { id: 'r1', name: 'Admin' },
        { id: 'r2', name: 'Editor' },
      ];

      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[0] as Menu);
      jest.spyOn(roleRepository, 'findBy').mockResolvedValue(mockRoles as Role[]);
      jest.spyOn(roleMenuRepository, 'save').mockResolvedValue([] as any);

      await request(app.getHttpServer())
        .post('/menus/m1/roles')
        .send({ roleIds })
        .expect(200);

      expect(roleMenuRepository.save).toHaveBeenCalled();
    });

    it('should validate all role IDs exist', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[0] as Menu);
      jest.spyOn(roleRepository, 'findBy').mockResolvedValue([]);

      await request(app.getHttpServer())
        .post('/menus/m1/roles')
        .send({ roleIds: ['invalid'] })
        .expect(400);
    });
  });

  describe('DELETE /menus/:id/roles/:roleId', () => {
    it('should remove role from menu', async () => {
      const mockQueryBuilder = menuRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockMenus[0] as Menu);
      jest.spyOn(roleMenuRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await request(app.getHttpServer())
        .delete('/menus/m1/roles/r1')
        .expect(200);

      expect(roleMenuRepository.delete).toHaveBeenCalled();
    });
  });
});
