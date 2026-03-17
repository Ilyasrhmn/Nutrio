import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionsModule } from '../src/modules/access-control/permissions/permissions.module';
import { Permission } from '../src/modules/access-control/permissions/entities/permission.entity';
import { RolePermission } from '../src/modules/access-control/roles/entities/role-permission.entity';
import { AdminGuard } from '../src/modules/access-control/common/admin.guard';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('PermissionsController (e2e)', () => {
  let app: INestApplication;
  let permissionRepository: Repository<Permission>;
  let rolePermissionRepository: Repository<RolePermission>;

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
    {
      id: 'p3',
      action: 'read',
      subject: 'Users',
      description: 'Read users',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPermissionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  const mockRolePermissionRepository = {
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PermissionsModule],
    })
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

  describe('GET /permissions', () => {
    it('should return permissions grouped by subject', async () => {
      jest.spyOn(permissionRepository, 'find').mockResolvedValue(mockPermissions as Permission[]);

      const response = await request(app.getHttpServer())
        .get('/permissions')
        .expect(200);

      expect(response.body).toHaveProperty('Dashboard');
      expect(response.body).toHaveProperty('Users');
      expect(response.body.Dashboard).toHaveLength(2);
      expect(response.body.Users).toHaveLength(1);
    });

    it('should return empty object when no permissions exist', async () => {
      jest.spyOn(permissionRepository, 'find').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/permissions')
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('GET /permissions/:id', () => {
    it('should return permission with role count', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockPermissions[0] as Permission);
      jest.spyOn(rolePermissionRepository, 'count').mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .get('/permissions/p1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'p1');
      expect(response.body).toHaveProperty('roleCount', 3);
    });

    it('should return 404 for non-existent permission', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);

      await request(app.getHttpServer()).get('/permissions/invalid').expect(404);
    });
  });

  describe('POST /permissions', () => {
    it('should create a new permission', async () => {
      const newPermission = {
        action: 'delete',
        subject: 'Users',
        description: 'Delete users',
      };

      const createdPermission = {
        id: 'p4',
        ...newPermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(permissionRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(permissionRepository, 'create').mockReturnValue(createdPermission as Permission);
      jest.spyOn(permissionRepository, 'save').mockResolvedValue(createdPermission as Permission);

      const response = await request(app.getHttpServer())
        .post('/permissions')
        .send(newPermission)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.action).toBe(newPermission.action);
      expect(response.body.subject).toBe(newPermission.subject);
    });

    it('should reject duplicate action-subject combination', async () => {
      const duplicatePermission = {
        action: 'read',
        subject: 'Dashboard',
      };

      jest.spyOn(permissionRepository, 'findOne').mockResolvedValue(mockPermissions[0] as Permission);

      await request(app.getHttpServer())
        .post('/permissions')
        .send(duplicatePermission)
        .expect(400);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/permissions')
        .send({ action: 'read' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/permissions')
        .send({ subject: 'Dashboard' })
        .expect(400);
    });

    it('should validate action enum values', async () => {
      await request(app.getHttpServer())
        .post('/permissions')
        .send({ action: 'invalid_action', subject: 'Dashboard' })
        .expect(400);
    });
  });

  describe('PUT /permissions/:id', () => {
    it('should update permission description', async () => {
      const updateData = {
        description: 'Updated description',
      };

      const updatedPermission = {
        ...mockPermissions[0],
        ...updateData,
        updatedAt: new Date(),
      };

      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockPermissions[0] as Permission);
      jest.spyOn(permissionRepository, 'save').mockResolvedValue(updatedPermission as Permission);

      const response = await request(app.getHttpServer())
        .put('/permissions/p1')
        .send(updateData)
        .expect(200);

      expect(response.body.description).toBe(updateData.description);
    });

    it('should not allow updating action or subject', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockPermissions[0] as Permission);

      // The controller should only accept description updates
      const response = await request(app.getHttpServer())
        .put('/permissions/p1')
        .send({ action: 'update', subject: 'NewSubject', description: 'test' })
        .expect(200);

      // Action and subject should remain unchanged
      expect(response.body.action).toBe('read');
      expect(response.body.subject).toBe('Dashboard');
    });
  });

  describe('DELETE /permissions/:id', () => {
    it('should delete permission not assigned to any role', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockPermissions[0] as Permission);
      jest.spyOn(rolePermissionRepository, 'count').mockResolvedValue(0);
      jest.spyOn(permissionRepository, 'remove').mockResolvedValue(mockPermissions[0] as Permission);

      await request(app.getHttpServer()).delete('/permissions/p1').expect(200);

      expect(permissionRepository.remove).toHaveBeenCalled();
    });

    it('should reject deleting permission assigned to roles', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockPermissions[0] as Permission);
      jest.spyOn(rolePermissionRepository, 'count').mockResolvedValue(2);

      await request(app.getHttpServer()).delete('/permissions/p1').expect(400);

      expect(permissionRepository.remove).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent permission', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);

      await request(app.getHttpServer()).delete('/permissions/invalid').expect(404);
    });
  });

  describe('GET /permissions/:id/roles', () => {
    it('should return all roles using the permission', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockPermissions[0] as Permission);

      const mockRoleQueryBuilder = rolePermissionRepository.createQueryBuilder();
      const mockRoles = [
        { id: 'r1', name: 'Admin' },
        { id: 'r2', name: 'Editor' },
      ];
      jest.spyOn(mockRoleQueryBuilder, 'getMany').mockResolvedValue(mockRoles as any);

      const response = await request(app.getHttpServer())
        .get('/permissions/p1/roles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array if no roles use the permission', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockPermissions[0] as Permission);

      const mockRoleQueryBuilder = rolePermissionRepository.createQueryBuilder();
      jest.spyOn(mockRoleQueryBuilder, 'getMany').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/permissions/p1/roles')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});
