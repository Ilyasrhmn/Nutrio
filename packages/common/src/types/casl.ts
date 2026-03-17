import { PaginatedResult } from "./index";

export type AppAction =
  | "manage"
  | "create"
  | "read"
  | "update"
  | "delete"
  | "view";

export type AppSubject =
  | "Dashboard"
  | "Map"
  | "Funds"
  | "Menu"
  | "LiveExecution"
  | "Logistics"
  | "Checkpoints"
  | "Audit"
  | "Reports"
  | "Marketplace"
  | "Settings"
  | "Role"
  | "Permission"
  | "User"
  | "Monitoring"
  | "SupplierShop"
  | "SupplierProducts"
  | "SupplierChat"
  | "all";

export type Permission = {
  action: AppAction;
  subject: AppSubject;
};

/**
 * Database permission structure
 */
export interface DatabasePermission {
  id: string;
  action: AppAction;
  subject: AppSubject;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions {
  id: string;
  name: string;
  description?: string;
  permissions: DatabasePermission[];
  permissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Menu item structure
 */
export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  order: number;
  parentId?: string | null;
  requiredPermission?: string | null;
  metadata?: Record<string, unknown> | null;
  children?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Menu tree structure (recursive)
 */
export interface MenuTree extends Omit<MenuItem, "children"> {
  children: MenuTree[];
  assignedRoles?: Array<{ id: string; name: string }>;
}

/**
 * Access control API response types
 */
export interface RoleResponse extends RoleWithPermissions {}

export interface PermissionResponse extends DatabasePermission {
  roleCount?: number;
}

export interface MenuResponse extends MenuItem {
  assignedRoles?: Array<{ id: string; name: string }>;
}

export interface PaginatedRolesResponse extends PaginatedResult<RoleWithPermissions> {}

export interface PermissionsGroupedResponse {
  [subject: string]: DatabasePermission[];
}
