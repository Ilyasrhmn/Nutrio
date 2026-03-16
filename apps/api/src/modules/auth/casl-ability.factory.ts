import { Injectable } from '@nestjs/common';
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

export type AppAbility = PureAbility<[AppAction, AppSubject]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

@Injectable()
export class CaslAbilityFactory {
  /**
   * Creates CASL ability based on user role
   */
  createForUser(role: UserRole): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

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

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<AppSubject>,
    });
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
  }
}
