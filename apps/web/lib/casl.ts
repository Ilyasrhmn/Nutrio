import { AbilityBuilder, PureAbility, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'view';
export type Subject = 'Dashboard' | 'Map' | 'Funds' | 'Menu' | 'LiveExecution' | 'Logistics' | 'Checkpoints' | 'Audit' | 'Reports' | 'Marketplace' | 'Settings' | 'all';

export type AppAbility = PureAbility<[Action, Subject]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export const defineAbilitiesFor = (role: string) => {
  const { can, cannot, build } = new AbilityBuilder(AppAbility);

  if (role === 'admin' || role === 'admin_bgn') {
    can('manage', 'all');
  } else if (role === 'vendor') {
    can('view', 'Dashboard');
    can('view', 'Map');
    can('view', 'Funds');
    can('view', 'Menu');
    can('view', 'LiveExecution');
    can('view', 'Logistics');
    can('view', 'Checkpoints');
    can('view', 'Marketplace');
    can('view', 'Settings');
    cannot('view', 'Audit');
    cannot('view', 'Reports');
  } else if (role === 'supplier') {
    can('view', 'Dashboard');
    can('view', 'Marketplace');
    can('view', 'Settings');
    cannot('view', 'Funds');
    cannot('view', 'Menu');
    cannot('view', 'LiveExecution');
    cannot('view', 'Logistics');
    cannot('view', 'Checkpoints');
    cannot('view', 'Audit');
    cannot('view', 'Reports');
  } else if (role === 'school' || role === 'public') {
    can('view', 'Dashboard');
    can('view', 'Map');
    can('view', 'LiveExecution');
    cannot('view', 'Funds');
    cannot('view', 'Menu');
    cannot('view', 'Marketplace');
  } else if (role === 'parent') {
    can('view', 'Dashboard');
    can('view', 'Reports');
    cannot('view', 'Funds');
    cannot('view', 'Marketplace');
  } else {
    // Default or guest permissions
    can('view', 'Dashboard');
  }

  return build({
    detectSubjectType: (item) => item as ExtractSubjectType<Subject>,
  });
};
