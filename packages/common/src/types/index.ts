/**
 * User roles defined in the database schema
 */
export enum UserRole {
  VENDOR = 'vendor',
  INSPECTOR = 'inspector',
  ADMIN_BGN = 'admin_bgn',
  COORDINATOR_SPPG = 'coordinator_sppg',
  DINKES = 'dinkes',
  PUBLIC = 'public',
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Blockchain transaction status
 */
export type TransactionStatus = "pending" | "confirmed" | "failed" | "reverted";

/**
 * Base entity with audit fields
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ethereum address type (branded string for type-safety)
 */
export type Address = `0x${string}`;
