import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from '../src/modules/access-control/common/admin.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { PermissionsGuard } from '../src/modules/access-control/common/permissions.guard';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../src/modules/auth/casl-ability.factory';
import { UserRole } from '@workspace/common';

describe('Authorization Guards (Integration)', () => {
  describe('AdminGuard', () => {
    let guard: AdminGuard;

    beforeEach(() => {
      guard = new AdminGuard();
    });

    function createMockContext(user: any): ExecutionContext {
      return {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
      } as ExecutionContext;
    }

    it('should allow admin users', () => {
      const context = createMockContext({ role: UserRole.ADMIN_BGN });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny non-admin users', () => {
      const context = createMockContext({ role: UserRole.VENDOR });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny unauthenticated requests', () => {
      const context = createMockContext(null);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny requests without user object', () => {
      const context = createMockContext(undefined);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    function createMockContext(user: any, requiredRoles?: UserRole[]): ExecutionContext {
      const mockReflector = reflector;
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(requiredRoles || null);

      return {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;
    }

    it('should allow access when no roles required', () => {
      const context = createMockContext({ role: UserRole.VENDOR }, undefined);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const context = createMockContext(
        { role: UserRole.ADMIN_BGN },
        [UserRole.ADMIN_BGN, UserRole.COORDINATOR_SPPG],
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
      const context = createMockContext(
        { role: UserRole.VENDOR },
        [UserRole.ADMIN_BGN],
      );
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const context = createMockContext(
        { role: UserRole.COORDINATOR_SPPG },
        [UserRole.ADMIN_BGN, UserRole.COORDINATOR_SPPG, UserRole.DINKES],
      );
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;
    let abilityFactory: CaslAbilityFactory;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PermissionsGuard,
          Reflector,
          {
            provide: CaslAbilityFactory,
            useValue: {
              createForUser: jest.fn(),
            },
          },
        ],
      }).compile();

      guard = module.get<PermissionsGuard>(PermissionsGuard);
      reflector = module.get<Reflector>(Reflector);
      abilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
    });

    function createMockContext(user: any, requiredPermissions?: string[]): ExecutionContext {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions || null);

      return {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;
    }

    it('should allow access when no permissions required', async () => {
      const context = createMockContext({ role: UserRole.VENDOR }, undefined);
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow access when user has required permissions', async () => {
      const mockAbility = {
        can: jest.fn().mockReturnValue(true),
      };
      jest.spyOn(abilityFactory, 'createForUser').mockResolvedValue(mockAbility as any);

      const context = createMockContext(
        { role: UserRole.ADMIN_BGN },
        ['read:Dashboard', 'update:Dashboard'],
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(mockAbility.can).toHaveBeenCalledWith('read', 'Dashboard');
      expect(mockAbility.can).toHaveBeenCalledWith('update', 'Dashboard');
    });

    it('should deny access when user lacks required permissions', async () => {
      const mockAbility = {
        can: jest.fn().mockReturnValue(false),
      };
      jest.spyOn(abilityFactory, 'createForUser').mockResolvedValue(mockAbility as any);

      const context = createMockContext(
        { role: UserRole.VENDOR },
        ['manage:User'],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should deny unauthenticated requests', async () => {
      const context = createMockContext(null, ['read:Dashboard']);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should handle invalid permission format', async () => {
      const mockAbility = {
        can: jest.fn(),
      };
      jest.spyOn(abilityFactory, 'createForUser').mockResolvedValue(mockAbility as any);

      const context = createMockContext(
        { role: UserRole.ADMIN_BGN },
        ['invalid_format'], // Missing colon separator
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should require all permissions when multiple are specified', async () => {
      let callCount = 0;
      const mockAbility = {
        can: jest.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1; // First permission passes, second fails
        }),
      };
      jest.spyOn(abilityFactory, 'createForUser').mockResolvedValue(mockAbility as any);

      const context = createMockContext(
        { role: UserRole.VENDOR },
        ['read:Dashboard', 'manage:User'],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });
});
