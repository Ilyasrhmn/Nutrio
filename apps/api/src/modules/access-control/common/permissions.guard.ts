import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './decorators';
import { CaslAbilityFactory } from '../../auth/casl-ability.factory';
import { AppAction, AppSubject } from '@workspace/common';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Create ability for user (async now)
    const ability = await this.abilityFactory.createForUser(user.role);

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every((permission) => {
      const [action, subject] = permission.split(':');
      if (!action || !subject) {
        return false;
      }
      return ability.can(action as AppAction, subject as AppSubject);
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
