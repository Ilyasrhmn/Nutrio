import {
  AbilityBuilder,
  PureAbility,
  AbilityClass,
  ExtractSubjectType,
} from "@casl/ability";
import { AppAction, AppSubject, UserRole } from "@workspace/common";

export type { AppAction };
export type AppSubject = any;
export type AppAbility = PureAbility<[AppAction, AppSubject]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

/**
 * Define abilities based on user role
 * This mirrors the backend CaslAbilityFactory logic
 */
export const defineAbilitiesFor = (role: UserRole | string): AppAbility => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

  switch (role) {
    case UserRole.ADMIN_BGN:
      defineAdminAbilities(can, cannot);
      break;
    case UserRole.VENDOR:
      defineVendorAbilities(can, cannot);
      break;
    case UserRole.INSPECTOR:
      defineInspectorAbilities(can, cannot);
      break;
    case UserRole.COORDINATOR_SPPG:
      defineCoordinatorAbilities(can, cannot);
      break;
    case UserRole.DINKES:
      defineDinkesAbilities(can, cannot);
      break;
    case UserRole.SUPPLIER:
      defineSupplierAbilities(can, cannot);
      break;
    case UserRole.PUBLIC:
    default:
      definePublicAbilities(can, cannot);
      break;
  }

  return build({
    detectSubjectType: (item) => item as ExtractSubjectType<AppSubject>,
  });
};

function defineAdminAbilities(
  can: AbilityBuilder<AppAbility>["can"],
  cannot: AbilityBuilder<AppAbility>["cannot"],
): void {
  can("manage", "all");
  // Admin only manages macro stuff, cannot access specific vendor operations
  // as they are strictly for Vendor role
  cannot("read", "MonitoringKepatuhan");
  cannot("read", "Operasional");
}

function defineVendorAbilities(
  can: AbilityBuilder<AppAbility>["can"],
  cannot: AbilityBuilder<AppAbility>["cannot"],
): void {
  can("read", "Dashboard");
  can("read", "Funds");
  can("read", "Marketplace");
  can("read", "Logistics");
  can("read", "Reports");
  can("read", "MonitoringKepatuhan"); // New Parent
  can("read", "Live");
  can("read", "Checkpoints");
  can("read", "SOP");
  can("read", "Incidents");
  can("read", "Audit");
  can("read", "Operasional"); // New Parent
  can("read", "Menu");
  can("read", "OperasionalJadwal");
  can("read", "OperasionalKalkulasi");
  can("read", "OperasionalKitchen");
  can("read", "OperasionalStock");
  can("read", "Settings");
  cannot("read", "Map");
  cannot("read", "MenuAdmin");
}

function defineSupplierAbilities(
  can: AbilityBuilder<AppAbility>["can"],
  cannot: AbilityBuilder<AppAbility>["cannot"],
): void {
  can("read", "Dashboard");
  can("read", "Marketplace");
  can("read", "SupplierShop");
  can("read", "SupplierProducts");
  can("read", "SupplierChat");
  can("read", "Reports"); // New access for supplier reports
  can("read", "Settings");
  cannot("read", "Map");
  cannot("read", "Funds");
  cannot("read", "Menu");
  cannot("read", "LiveExecution");
  cannot("read", "Logistics");
  cannot("read", "Checkpoints");
  cannot("read", "Audit");
  cannot("read", "MonitoringKepatuhan");
  cannot("read", "Operasional");
}

function defineInspectorAbilities(
  can: AbilityBuilder<AppAbility>["can"],
  cannot: AbilityBuilder<AppAbility>["cannot"],
): void {
  can("read", "Dashboard");
  can("read", "Map");
  can("read", "LiveExecution");
  can("read", "Logistics");
  can("read", "Checkpoints");
  can("read", "Audit");
  can("read", "Reports");
  can("read", "Monitoring");
  cannot("read", "Funds");
  cannot("read", "Menu");
  cannot("read", "Marketplace");
}

function defineCoordinatorAbilities(
  can: AbilityBuilder<AppAbility>["can"],
  cannot: AbilityBuilder<AppAbility>["cannot"],
): void {
  can("read", "Dashboard");
  can("read", "Map");
  can("read", "LiveExecution");
  can("read", "Logistics");
  can("read", "Checkpoints");
  can("read", "Audit");
  can("read", "Reports");
  can("read", "Settings");
  can("read", "Monitoring");
  cannot("read", "Funds");
  cannot("read", "Menu");
  cannot("read", "Marketplace");
}

function defineDinkesAbilities(
  can: AbilityBuilder<AppAbility>["can"],
  cannot: AbilityBuilder<AppAbility>["cannot"],
): void {
  can("read", "Dashboard");
  can("read", "Map");
  can("read", "LiveExecution");
  can("read", "Audit");
  can("read", "Reports");
  can("read", "Monitoring");
  cannot("read", "Funds");
  cannot("read", "Menu");
  cannot("read", "Marketplace");
}

function definePublicAbilities(
  can: AbilityBuilder<AppAbility>["can"],
  cannot: AbilityBuilder<AppAbility>["cannot"],
): void {
  can("read", "Dashboard");
  can("read", "Map");
  can("read", "LiveExecution");
  can("read", "Monitoring");
  cannot("read", "Funds");
  cannot("read", "Menu");
  cannot("read", "Marketplace");
  cannot("read", "Audit");
  cannot("read", "Reports");
}
