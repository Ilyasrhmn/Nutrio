import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify which roles can access a route
 * Usage: @Roles('admin_bgn', 'coordinator_sppg')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator to specify which permissions are required to access a route
 * Usage: @Permissions('read:Funds', 'update:Dashboard')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
