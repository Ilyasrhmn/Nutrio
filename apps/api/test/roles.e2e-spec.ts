import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesModule } from '../src/modules/access-control/roles/roles.module';
import { Role } from '../src/modules/access-control/roles/entities/role.entity';
import { Permission } from '../src/modules/access-control/permissions/entities/permission.entity';
import { RolePermission } from '../src/modules/access-control/roles/entities/role-permission.entity';
import { AdminGuard } from '../src/modules/access-control/common/admin.guard';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { UserRole } from '@workspace/common';

describe('RolesController (e2e)', () => {
  let app: INestApplication;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;
  let rolePermissionRepository: Repository<RolePermission>;

  // Mock data
  const mockRoles: Partial<Role>[] = [
    {
      id: '1',
      name: 'Test Admin',
      description: 'Test admin role',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Test User',
      description: 'Test user role',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPermissions: Partial<Permission>[] = [
    {
      id: 'p1',
      action: 'read',
      subject: 'Dashboard',
      description: 'Read dashboard',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'p2',
      action: 'update',
      subject: 'Dashboard',
      description: 'Update dashboard',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Mock repositories
  const mockRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  const mockPermissionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
  };

  const mockRolePermissionRepository = {
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  // Mock guards to bypass authentication
  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RolesModule],
    })
      .overrideProvider(getRepositoryToken(Role))
      .useValue(mockRoleRepository)
      .overrideProvider(getRepositoryToken(Permission))
      .useValue(mockPermissionRepository)
      .overrideProvider(getRepositoryToken(RolePermission))
      .useValue(mockRolePermissionRepository)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    roleRepository = moduleFixture.get<Repository<Role>>(
      getRepositoryToken(Role),
    );
    permissionRepository = moduleFixture.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
    rolePermissionRepository = moduleFixture.get<Repository<RolePermission>>(
      getRepositoryToken(RolePermission),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /roles', () => {
    it('should return paginated roles', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getManyAndCount').mockResolvedValue([
        mockRoles as Role[],
        mockRoles.length,
      ]);

      const response = await request(app.getHttpServer())
        .get('/roles?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('should filter roles by search query', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getManyAndCount').mockResolvedValue([
        [mockRoles[0]] as Role[],
        1,
      ]);

      await request(app.getHttpServer())
        .get('/roles?page=1&limit=10&search=Admin')
        .expect(200);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should handle invalid pagination parameters', async () => {
      await request(app.getHttpServer())
        .get('/roles?page=-1&limit=0')
        .expect(400);
    });
  });

  describe('GET /roles/:id', () => {
    it('should return a role by id', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockRoles[0] as Role);

      const response = await request(app.getHttpServer())
        .get('/roles/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent role', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);

      await request(app.getHttpServer()).get('/roles/999').expect(404);
    });
  });

  describe('POST /roles', () => {
    it('should create a new role', async () => {
      const newRole = {
        name: 'New Role',
        description: 'New role description',
      };

      const createdRole = {
        id: '3',
        ...newRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'create').mockReturnValue(createdRole as Role);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(createdRole as Role);

      const response = await request(app.getHttpServer())
        .post('/roles')
        .send(newRole)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newRole.name);
    });

    it('should reject duplicate role names', async () => {
      const duplicateRole = {
        name: 'Test Admin',
        description: 'Duplicate role',
      };

      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRoles[0] as Role);

      await request(app.getHttpServer())
        .post('/roles')
        .send(duplicateRole)
        .expect(400);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .send({ description: 'Missing name' })
        .expect(400);
    });
  });

  describe('PUT /roles/:id', () => {
    it('should update a role', async () => {
      const updateData = {
        name: 'Updated Role',
        description: 'Updated description',
      };

      const updatedRole = {
        ...mockRoles[0],
        ...updateData,
        updatedAt: new Date(),
      };

      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockRoles[0] as Role);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(updatedRole as Role);

      const response = await request(app.getHttpServer())
        .put('/roles/1')
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent role', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);

      await request(app.getHttpServer())
        .put('/roles/999')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should delete a role', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockRoles[0] as Role);
      jest.spyOn(roleRepository, 'remove').mockResolvedValue(mockRoles[0] as Role);

      await request(app.getHttpServer()).delete('/roles/1').expect(200);

      expect(roleRepository.remove).toHaveBeenCalled();
    });

    it('should return 404 for non-existent role', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);

      await request(app.getHttpServer()).delete('/roles/999').expect(404);
    });
  });

  describe('POST /roles/:id/permissions', () => {
    it('should add permissions to role', async () => {
      const permissionIds = ['p1', 'p2'];

      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockRoles[0] as Role);
      jest.spyOn(permissionRepository, 'findBy').mockResolvedValue(mockPermissions as Permission[]);
      jest.spyOn(rolePermissionRepository, 'save').mockResolvedValue([] as any);

      const response = await request(app.getHttpServer())
        .post('/roles/1/permissions')
        .send({ permissionIds })
        .expect(200);

      expect(rolePermissionRepository.save).toHaveBeenCalled();
    });

    it('should validate permission IDs exist', async () => {
      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockRoles[0] as Role);
      jest.spyOn(permissionRepository, 'findBy').mockResolvedValue([]);

      await request(app.getHttpServer())
        .post('/roles/1/permissions')
        .send({ permissionIds: ['invalid-id'] })
        .expect(400);
    });
  });

  describe('DELETE /roles/:id/permissions', () => {
    it('should remove permissions from role', async () => {
      const permissionIds = ['p1'];

      const mockQueryBuilder = roleRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockRoles[0] as Role);
      jest.spyOn(rolePermissionRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await request(app.getHttpServer())
        .delete('/roles/1/permissions')
        .send({ permissionIds })
        .expect(200);

      expect(rolePermissionRepository.delete).toHaveBeenCalled();
    });
  });
});
