import { SetMetadata } from '@nestjs/common';
import { AppAction, AppSubject } from '@workspace/common';

export const POLICIES_KEY = 'policies';
export type PolicyHandler = [AppAction, AppSubject];

/**
 * Decorator to set policy requirements on a route
 * @param handlers Array of [action, subject] tuples
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(POLICIES_KEY, handlers);
