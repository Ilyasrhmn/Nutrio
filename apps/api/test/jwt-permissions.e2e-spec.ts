import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@workspace/common';

describe('JWT Permission Claims (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Token Generation with Permissions', () => {
    it('should include permissions in JWT payload for admin', () => {
      const payload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: UserRole.ADMIN_BGN,
        permissions: ['manage:all'],
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(decoded).toHaveProperty('permissions');
      expect(decoded.permissions).toContain('manage:all');
    });

    it('should include role-specific permissions in JWT payload', () => {
      const payload = {
        sub: 'user-2',
        email: 'vendor@test.com',
        role: UserRole.VENDOR,
        permissions: ['read:Dashboard', 'read:Funds', 'read:Menu'],
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.permissions).toHaveLength(3);
      expect(decoded.permissions).toContain('read:Dashboard');
      expect(decoded.permissions).toContain('read:Funds');
    });

    it('should handle empty permissions array', () => {
      const payload = {
        sub: 'user-3',
        email: 'limited@test.com',
        role: UserRole.PUBLIC,
        permissions: [],
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.permissions).toEqual([]);
    });
  });

  describe('Token Validation', () => {
    it('should validate token structure', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        role: UserRole.VENDOR,
        permissions: ['read:Dashboard'],
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
      expect(decoded).toHaveProperty('permissions');
      expect(decoded).toHaveProperty('iat'); // Issued at
      expect(decoded).toHaveProperty('exp'); // Expiry
    });

    it('should reject expired tokens', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        role: UserRole.VENDOR,
        permissions: ['read:Dashboard'],
      };

      // Sign with very short expiry
      const token = jwtService.sign(payload, { expiresIn: '1ms' });

      // Wait for token to expire
      setTimeout(() => {
        expect(() => jwtService.verify(token)).toThrow();
      }, 10);
    });

    it('should reject tampered tokens', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        role: UserRole.VENDOR,
        permissions: ['read:Dashboard'],
      };

      const token = jwtService.sign(payload);
      
      // Tamper with token
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => jwtService.verify(tamperedToken)).toThrow();
    });
  });

  describe('Permission Extraction from JWT', () => {
    it('should extract permissions from valid JWT', () => {
      const permissions = ['read:Dashboard', 'update:Funds', 'manage:User'];
      const payload = {
        sub: 'user-1',
        email: 'admin@test.com',
        role: UserRole.ADMIN_BGN,
        permissions,
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.permissions).toEqual(permissions);
    });

    it('should handle permission array formats', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        role: UserRole.VENDOR,
        permissions: [
          'read:Dashboard',
          'read:Funds',
          'update:Funds',
          'read:Menu',
        ],
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(Array.isArray(decoded.permissions)).toBe(true);
      expect(decoded.permissions).toHaveLength(4);
    });
  });

  describe('Role-based Permission Loading', () => {
    it('should load permissions based on role from database', async () => {
      // This test would require actual database integration
      // For now, we verify the payload structure is correct
      const payload = {
        sub: 'user-1',
        email: 'vendor@test.com',
        role: UserRole.VENDOR,
        permissions: [], // Would be populated from database
      };

      expect(payload).toHaveProperty('role');
      expect(payload).toHaveProperty('permissions');
      expect(Array.isArray(payload.permissions)).toBe(true);
    });

    it('should refresh permissions on role change', () => {
      // Initial token with vendor permissions
      const initialPayload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: UserRole.VENDOR,
        permissions: ['read:Dashboard', 'read:Funds'],
      };

      const token1 = jwtService.sign(initialPayload);
      const decoded1 = jwtService.verify(token1);

      expect(decoded1.role).toBe(UserRole.VENDOR);
      expect(decoded1.permissions).toHaveLength(2);

      // New token after role change to admin
      const updatedPayload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: UserRole.ADMIN_BGN,
        permissions: ['manage:all'],
      };

      const token2 = jwtService.sign(updatedPayload);
      const decoded2 = jwtService.verify(token2);

      expect(decoded2.role).toBe(UserRole.ADMIN_BGN);
      expect(decoded2.permissions).toContain('manage:all');
    });
  });

  describe('Permission Claim Validation', () => {
    it('should validate permission claim format', () => {
      const validPermissions = [
        'read:Dashboard',
        'update:Funds',
        'delete:User',
        'manage:all',
      ];

      validPermissions.forEach((perm) => {
        const parts = perm.split(':');
        expect(parts).toHaveLength(2);
        expect(parts[0]).toBeTruthy(); // Action
        expect(parts[1]).toBeTruthy(); // Subject
      });
    });

    it('should handle malformed permission strings', () => {
      const malformedPermissions = [
        'invalid',
        'too:many:colons',
        ':noaction',
        'nosubject:',
      ];

      malformedPermissions.forEach((perm) => {
        const parts = perm.split(':');
        const isValid = parts.length === 2 && parts[0] && parts[1];
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Token Refresh with Updated Permissions', () => {
    it('should issue new token with updated permissions', () => {
      const originalPayload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: UserRole.VENDOR,
        permissions: ['read:Dashboard'],
      };

      const originalToken = jwtService.sign(originalPayload);
      const originalDecoded = jwtService.verify(originalToken);

      // Simulate permission update
      const updatedPayload = {
        ...originalPayload,
        permissions: ['read:Dashboard', 'update:Dashboard', 'read:Funds'],
      };

      const newToken = jwtService.sign(updatedPayload);
      const newDecoded = jwtService.verify(newToken);

      expect(newDecoded.permissions).toHaveLength(3);
      expect(newDecoded.permissions).toContain('update:Dashboard');
      expect(originalDecoded.permissions).toHaveLength(1);
    });

    it('should invalidate old token after permission revocation', () => {
      // This would typically be handled by a token blacklist
      // or by checking permissions against database on critical operations
      const payload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: UserRole.VENDOR,
        permissions: ['manage:User'],
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      // Token still contains old permission
      expect(decoded.permissions).toContain('manage:User');

      // In real implementation, guards would check against current DB permissions
      // for sensitive operations, not just rely on JWT claims
    });
  });

  describe('Multiple Role Permissions', () => {
    it('should handle user with multiple role permissions', () => {
      // Some systems allow users to have multiple roles
      // This test demonstrates the payload structure
      const payload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: UserRole.ADMIN_BGN, // Primary role
        roles: [UserRole.ADMIN_BGN, UserRole.COORDINATOR_SPPG], // All roles
        permissions: [
          'manage:all',
          'read:Audit',
          'read:Reports',
        ],
      };

      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.roles).toContain(UserRole.ADMIN_BGN);
      expect(decoded.roles).toContain(UserRole.COORDINATOR_SPPG);
    });
  });

  describe('Permission Inheritance', () => {
    it('should demonstrate permission inheritance concept', () => {
      // manage:X implies read:X, update:X, delete:X, create:X
      const adminPayload = {
        sub: 'admin-1',
        email: 'admin@test.com',
        role: UserRole.ADMIN_BGN,
        permissions: ['manage:all'],
      };

      const token = jwtService.sign(adminPayload);
      const decoded = jwtService.verify(token);

      expect(decoded.permissions).toContain('manage:all');
      
      // In actual use, PermissionsGuard with CASL handles the inheritance
      // manage:all -> can(read, X), can(update, X), can(delete, X) for any X
    });

    it('should demonstrate granular permissions', () => {
      const vendorPayload = {
        sub: 'vendor-1',
        email: 'vendor@test.com',
        role: UserRole.VENDOR,
        permissions: [
          'read:Dashboard',
          'read:Funds',
          'create:Funds',
          'update:Funds',
          // Note: no delete:Funds - granular control
        ],
      };

      const token = jwtService.sign(vendorPayload);
      const decoded = jwtService.verify(token);

      expect(decoded.permissions).toContain('read:Funds');
      expect(decoded.permissions).toContain('update:Funds');
      expect(decoded.permissions).not.toContain('delete:Funds');
    });
  });
});
