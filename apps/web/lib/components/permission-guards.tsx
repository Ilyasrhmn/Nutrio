'use client';

import { ReactNode } from 'react';
import { usePermission as usePermissionHook } from '../hooks/use-permission';
import { AppAction, AppSubject } from '@workspace/common';

interface CanProps {
  I: AppAction;
  a: AppSubject;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that renders children only if user has the specified permission
 * Usage: <Can I="read" a="Funds">Content</Can>
 */
export function Can({ I: action, a: subject, children, fallback = null }: CanProps) {
  const hasPermission = usePermissionHook(action, subject);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface CannotProps {
  I: AppAction;
  a: AppSubject;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that renders children only if user DOES NOT have the specified permission
 * Usage: <Cannot I="delete" a="Role">Content</Cannot>
 */
export function Cannot({ I: action, a: subject, children, fallback = null }: CannotProps) {
  const hasPermission = usePermissionHook(action, subject);
  
  if (hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
