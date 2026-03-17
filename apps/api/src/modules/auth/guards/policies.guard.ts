import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, AppAbility } from '../casl-ability.factory';
import { POLICIES_KEY, PolicyHandler } from '../decorators/check-policies.decorator';
import { UserRole } from '@workspace/common';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(POLICIES_KEY, context.getHandler()) ||
      this.reflector.get<PolicyHandler[]>(POLICIES_KEY, context.getClass());

    if (!policyHandlers || policyHandlers.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      throw new ForbiddenException('User role not found in request context');
    }

    const ability = await this.caslAbilityFactory.createForUser(user.role as UserRole);

    const hasPermission = policyHandlers.every((handler) =>
      this.evaluatePolicy(handler, ability),
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }

  private evaluatePolicy(handler: PolicyHandler, ability: AppAbility): boolean {
    const [action, subject] = handler;
    return ability.can(action, subject);
  }
}
