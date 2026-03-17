export type AppAction = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'view';

export type AppSubject =
  | 'Dashboard'
  | 'Map'
  | 'Funds'
  | 'Menu'
  | 'LiveExecution'
  | 'Logistics'
  | 'Checkpoints'
  | 'Audit'
  | 'Reports'
  | 'Marketplace'
  | 'Settings'
  | 'Monitoring'
  | 'all';

export type Permission = {
  action: AppAction;
  subject: AppSubject;
};
