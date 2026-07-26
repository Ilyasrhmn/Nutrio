import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { UserRole } from "@workspace/common";

/**
 * Guard that restricts access to ADMIN_BGN role only
 * Use for admin management endpoints
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Check role.name (Role entity) or roleLegacy (enum) for admin access
    const roleName = user.role?.name ?? user.roleLegacy;

    // Accept both 'admin_bgn' string and UserRole.ADMIN_BGN enum
    if (roleName !== UserRole.ADMIN_BGN && roleName !== "admin_bgn") {
      throw new ForbiddenException("Access denied. Admin privileges required.");
    }

    return true;
  }
}
