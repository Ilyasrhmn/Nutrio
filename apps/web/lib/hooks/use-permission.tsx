'use client';

import { useContext, createContext, ReactNode, ReactElement } from 'react';
import { AppAction, AppSubject } from '@workspace/common';

interface PermissionContextType {
  permissions: string[];
  role?: string;
  can: (action: AppAction, subject: AppSubject) => boolean;
  cannot: (action: AppAction, subject: AppSubject) => boolean;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

interface PermissionProviderProps {
  children: ReactNode;
  permissions: string[];
  role?: string;
}

export function PermissionProvider({ children, permissions, role }: PermissionProviderProps): ReactElement {
  const can = (action: AppAction, subject: AppSubject): boolean => {
    if (permissions.includes('manage:all')) {
      return true;
    }
    return permissions.includes(`${action}:${subject}`);
  };

  const cannot = (action: AppAction, subject: AppSubject): boolean => {
    return !can(action, subject);
  };

  const value: PermissionContextType = {
    permissions,
    role,
    can,
    cannot,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === null) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

/**
 * Hook to check a single permission
 */
export function usePermission(action: AppAction, subject: AppSubject): boolean {
  const { can } = usePermissions();
  return can(action, subject);
}

export function usePermissionsAll(permissions: [AppAction, AppSubject][]): boolean {
  const { can } = usePermissions();
  return permissions.every(([action, subject]) => can(action, subject));
}

export function usePermissionsAny(permissions: [AppAction, AppSubject][]): boolean {
  const { can } = usePermissions();
  return permissions.some(([action, subject]) => can(action, subject));
}

/**
 * Component for conditional rendering based on permission
 */
interface PermissionProps {
  action: AppAction;
  subject: AppSubject;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ action, subject, children, fallback = null }: PermissionProps) {
  const { can } = usePermissions();
  if (can(action, subject)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

export function Cannot({ action, subject, children, fallback = null }: PermissionProps) {
  const { cannot } = usePermissions();
  if (cannot(action, subject)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

/**
 * HOC for class components or simple wrapping
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  action: AppAction,
  subject: AppSubject,
  FallbackComponent: React.ComponentType | null = null
) {
  return function WithPermission(props: P) {
    const { can } = usePermissions();
    if (can(action, subject)) {
      return <Component {...props} />;
    }
    return FallbackComponent ? <FallbackComponent /> : null;
  };
}
