import { Injectable, Inject, Optional } from '@nestjs/common';
import {
  PureAbility,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability';
import {
  AppAction,
  AppSubject,
  UserRole,
} from '@workspace/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';

export type AppAbility = PureAbility<[AppAction, AppSubject]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

/**
 * Permission structure from database
 */
interface DatabasePermission {
  action: string;
  subject: string;
}

@Injectable()
export class CaslAbilityFactory {
  private readonly useDatabasePermissions: boolean;
  private readonly cacheTTL = 300; // 5 minutes

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.useDatabasePermissions = 
      this.configService.get<string>('USE_DB_PERMISSIONS') === 'true';
  }

  /**
   * Creates CASL ability based on user role
   * If USE_DB_PERMISSIONS is enabled, loads from database with caching
   * Otherwise, uses hardcoded fallback
   */
  async createForUser(role: UserRole): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

    // Use database permissions if enabled
    if (this.useDatabasePermissions) {
      const permissions = await this.getPermissionsFromCache(role);
      if (permissions && permissions.length > 0) {
        this.defineDatabaseAbilities(can, permissions);
      } else {
        // Fallback to hardcoded if cache miss
        this.defineHardcodedAbilities(can, cannot, role);
      }
    } else {
      // Use hardcoded permissions
      this.defineHardcodedAbilities(can, cannot, role);
    }

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<AppSubject>,
    });
  }

  /**
   * Get permissions from cache or database
   */
  private async getPermissionsFromCache(role: UserRole): Promise<DatabasePermission[] | null> {
    const cacheKey = this.cacheService.getRolePermissionsKey(role);
    
    // Try cache first
    const cached = await this.cacheService.get<DatabasePermission[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - permissions will be loaded from AuthService
    // and cached there
    return null;
  }

  /**
   * Cache permissions for a role
   */
  async cachePermissions(role: UserRole, permissions: DatabasePermission[]): Promise<void> {
    const cacheKey = this.cacheService.getRolePermissionsKey(role);
    await this.cacheService.set(cacheKey, permissions, { ttl: this.cacheTTL });
  }

  /**
   * Invalidate cached permissions for a role
   */
  async invalidatePermissions(role: UserRole): Promise<void> {
    await this.cacheService.invalidateRolePermissions(role);
  }

  /**
   * Define abilities from database permissions
   */
  private defineDatabaseAbilities(
    can: AbilityBuilder<AppAbility>['can'],
    permissions: DatabasePermission[],
  ): void {
    for (const permission of permissions) {
      if (permission.action === 'manage' && permission.subject === 'all') {
        can('manage', 'all');
      } else {
        can(permission.action as AppAction, permission.subject as AppSubject);
      }
    }
  }

  /**
   * Define abilities from hardcoded rules (fallback)
   */
  private defineHardcodedAbilities(
    can: AbilityBuilder<AppAbility>['can'],
    cannot: AbilityBuilder<AppAbility>['cannot'],
    role: UserRole,
  ): void {
    switch (role) {
      case UserRole.ADMIN_BGN:
        this.defineAdminAbilities(can);
        break;
      case UserRole.VENDOR:
        this.defineVendorAbilities(can, cannot);
        break;
      case UserRole.INSPECTOR:
        this.defineInspectorAbilities(can, cannot);
        break;
      case UserRole.COORDINATOR_SPPG:
        this.defineCoordinatorAbilities(can, cannot);
        break;
      case UserRole.DINKES:
        this.defineDinkesAbilities(can, cannot);
        break;
      case UserRole.PUBLIC:
      default:
        this.definePublicAbilities(can, cannot);
        break;
    }
  }

  private defineAdminAbilities(can: AbilityBuilder<AppAbility>['can']): void {
    can('manage', 'all');
  }

  private defineVendorAbilities(
    can: AbilityBuilder<AppAbility>['can'],
    cannot: AbilityBuilder<AppAbility>['cannot'],
  ): void {
    can('read', 'Dashboard');
    can('read', 'Map');
    can('read', 'Funds');
    can('read', 'Menu');
    can('read', 'LiveExecution');
    can('read', 'Logistics');
    can('read', 'Checkpoints');
    can('read', 'Marketplace');
    can('read', 'Settings');
    cannot('read', 'Audit');
    cannot('read', 'Reports');
    can('read', 'Eligibility');
    can('read', 'Onboarding');
    can('read', 'MissionControl');
    can('read', 'Checkpoint');
    can('read', 'DeliveryToken');
    can('read', 'Scoring');
    can('read', 'Debrief');
    can('read', 'RAG');
  }

  private defineInspectorAbilities(
    can: AbilityBuilder<AppAbility>['can'],
    cannot: AbilityBuilder<AppAbility>['cannot'],
  ): void {
    can('read', 'Dashboard');
    can('read', 'Map');
    can('read', 'LiveExecution');
    can('read', 'Logistics');
    can('read', 'Checkpoints');
    can('read', 'Audit');
    can('read', 'Reports');
    cannot('read', 'Funds');
    cannot('read', 'Menu');
    cannot('read', 'Marketplace');
    can('read', 'Inspection');
    can('read', 'Document');
  }

  private defineCoordinatorAbilities(
    can: AbilityBuilder<AppAbility>['can'],
    cannot: AbilityBuilder<AppAbility>['cannot'],
  ): void {
    can('read', 'Dashboard');
    can('read', 'Map');
    can('read', 'LiveExecution');
    can('read', 'Logistics');
    can('read', 'Checkpoints');
    can('read', 'Audit');
    can('read', 'Reports');
    can('read', 'Settings');
    cannot('read', 'Funds');
    cannot('read', 'Menu');
    cannot('read', 'Marketplace');
    can('read', 'Checkpoint');
    can('read', 'Scoring');
  }

  private defineDinkesAbilities(
    can: AbilityBuilder<AppAbility>['can'],
    cannot: AbilityBuilder<AppAbility>['cannot'],
  ): void {
    can('read', 'Dashboard');
    can('read', 'Map');
    can('read', 'LiveExecution');
    can('read', 'Audit');
    can('read', 'Reports');
    cannot('read', 'Funds');
    cannot('read', 'Menu');
    cannot('read', 'Marketplace');
    can('read', 'CommandCenter');
    can('read', 'RiskIntelligence');
    can('read', 'PublicDashboard');
  }

  private definePublicAbilities(
    can: AbilityBuilder<AppAbility>['can'],
    cannot: AbilityBuilder<AppAbility>['cannot'],
  ): void {
    can('read', 'Dashboard');
    can('read', 'Map');
    can('read', 'LiveExecution');
    cannot('read', 'Funds');
    cannot('read', 'Menu');
    cannot('read', 'Marketplace');
    cannot('read', 'Audit');
    cannot('read', 'Reports');
    can('read', 'PublicDashboard');
    can('read', 'Eligibility');
  }
}
