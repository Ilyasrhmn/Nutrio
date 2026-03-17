import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory } from '../src/modules/auth/casl-ability.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../src/modules/access-control/permissions/entities/permission.entity';
import { RolePermission } from '../src/modules/access-control/roles/entities/role-permission.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { UserRole, AppAction, AppSubject } from '@workspace/common';
import { Cache } from 'cache-manager';

describe('CaslAbilityFactory (Integration)', () => {
  let factory: CaslAbilityFactory;
  let permissionRepository: Repository<Permission>;
  let rolePermissionRepository: Repository<RolePermission>;
  let cacheManager: Cache;
  let configService: ConfigService;

  const mockPermissions: Partial<Permission>[] = [
    {
      id: 'p1',
      action: 'read',
      subject: 'Dashboard',
      description: 'Read dashboard',
    },
    {
      id: 'p2',
      action: 'update',
      subject: 'Dashboard',
      description: 'Update dashboard',
    },
    {
      id: 'p3',
      action: 'manage',
      subject: 'User',
      description: 'Manage users',
    },
  ];

  const mockPermissionRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockRolePermissionRepository = {
    find: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaslAbilityFactory,
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
        {
          provide: getRepositoryToken(RolePermission),
          useValue: mockRolePermissionRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    factory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
    permissionRepository = module.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
    rolePermissionRepository = module.get<Repository<RolePermission>>(
      getRepositoryToken(RolePermission),
    );
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('createForUser - Database Mode', () => {
    beforeEach(() => {
      // Enable database permissions
      jest.spyOn(configService, 'get').mockReturnValue('true');
    });

    it('should create ability from database permissions', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getMany').mockResolvedValue(mockPermissions as Permission[]);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const ability = await factory.createForUser(UserRole.VENDOR);

      expect(ability).toBeDefined();
      expect(permissionRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should use cached permissions when available', async () => {
      const cachedPermissions = mockPermissions;
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedPermissions);

      const ability = await factory.createForUser(UserRole.VENDOR);

      expect(ability).toBeDefined();
      expect(permissionRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should cache fetched permissions', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getMany').mockResolvedValue(mockPermissions as Permission[]);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      await factory.createForUser(UserRole.VENDOR);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('permissions:'),
        mockPermissions,
        expect.any(Number),
      );
    });

    it('should grant permissions based on database rules', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getMany').mockResolvedValue([
        { action: 'read', subject: 'Dashboard' },
        { action: 'update', subject: 'Dashboard' },
      ] as Permission[]);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const ability = await factory.createForUser(UserRole.VENDOR);

      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('update', 'Dashboard')).toBe(true);
      expect(ability.can('delete', 'Dashboard')).toBe(false);
    });
  });

  describe('createForUser - Hardcoded Mode', () => {
    beforeEach(() => {
      // Disable database permissions
      jest.spyOn(configService, 'get').mockReturnValue('false');
    });

    it('should create ability from hardcoded rules for ADMIN_BGN', async () => {
      const ability = await factory.createForUser(UserRole.ADMIN_BGN);

      expect(ability).toBeDefined();
      expect(ability.can('manage', 'all')).toBe(true);
      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('delete', 'User')).toBe(true);
    });

    it('should create ability from hardcoded rules for VENDOR', async () => {
      const ability = await factory.createForUser(UserRole.VENDOR);

      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('read', 'Funds')).toBe(true);
      expect(ability.can('manage', 'User')).toBe(false);
    });

    it('should create ability from hardcoded rules for INSPECTOR', async () => {
      const ability = await factory.createForUser(UserRole.INSPECTOR);

      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('read', 'Audit')).toBe(true);
      expect(ability.can('read', 'Funds')).toBe(false);
    });

    it('should create ability from hardcoded rules for COORDINATOR_SPPG', async () => {
      const ability = await factory.createForUser(UserRole.COORDINATOR_SPPG);

      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('read', 'Audit')).toBe(true);
      expect(ability.can('read', 'Settings')).toBe(true);
    });

    it('should create ability from hardcoded rules for DINKES', async () => {
      const ability = await factory.createForUser(UserRole.DINKES);

      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('read', 'Reports')).toBe(true);
      expect(ability.can('read', 'Funds')).toBe(false);
    });

    it('should create ability from hardcoded rules for PUBLIC', async () => {
      const ability = await factory.createForUser(UserRole.PUBLIC);

      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('read', 'Map')).toBe(true);
      expect(ability.can('update', 'Dashboard')).toBe(false);
    });

    it('should not use cache in hardcoded mode', async () => {
      await factory.createForUser(UserRole.VENDOR);

      expect(cacheManager.get).not.toHaveBeenCalled();
      expect(permissionRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('Cache Invalidation', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockReturnValue('true');
    });

    it('should invalidate cached permissions for a role', async () => {
      await factory.invalidatePermissions(UserRole.VENDOR);

      expect(cacheManager.del).toHaveBeenCalledWith(
        expect.stringContaining('permissions:'),
      );
    });

    it('should fetch fresh permissions after invalidation', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getMany').mockResolvedValue(mockPermissions as Permission[]);

      // First call - cache miss
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
      await factory.createForUser(UserRole.VENDOR);

      // Invalidate
      await factory.invalidatePermissions(UserRole.VENDOR);

      // Second call - should fetch from database again
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
      await factory.createForUser(UserRole.VENDOR);

      expect(permissionRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Permissions', () => {
    it('should cache permissions with TTL', async () => {
      const permissions = mockPermissions as Permission[];

      await factory.cachePermissions(UserRole.VENDOR, permissions);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('permissions:VENDOR'),
        permissions,
        300000, // 5 minutes in milliseconds
      );
    });
  });

  describe('Permission Evaluation', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockReturnValue('true');
    });

    it('should correctly evaluate simple permissions', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getMany').mockResolvedValue([
        { action: 'read', subject: 'Dashboard' },
      ] as Permission[]);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const ability = await factory.createForUser(UserRole.VENDOR);

      expect(ability.can('read', 'Dashboard')).toBe(true);
      expect(ability.can('update', 'Dashboard')).toBe(false);
      expect(ability.can('read', 'User')).toBe(false);
    });

    it('should correctly evaluate manage permission', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getMany').mockResolvedValue([
        { action: 'manage', subject: 'User' },
      ] as Permission[]);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const ability = await factory.createForUser(UserRole.ADMIN_BGN);

      expect(ability.can('read', 'User')).toBe(true);
      expect(ability.can('create', 'User')).toBe(true);
      expect(ability.can('update', 'User')).toBe(true);
      expect(ability.can('delete', 'User')).toBe(true);
    });

    it('should handle empty permissions gracefully', async () => {
      const mockQueryBuilder = permissionRepository.createQueryBuilder();
      jest.spyOn(mockQueryBuilder, 'getMany').mockResolvedValue([]);
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const ability = await factory.createForUser(UserRole.PUBLIC);

      expect(ability.can('read', 'Dashboard')).toBe(false);
      expect(ability.can('manage', 'all')).toBe(false);
    });
  });
});
