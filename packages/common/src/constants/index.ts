/**
 * Application name
 */
export const APP_NAME = "bi-hackathon" as const;

/**
 * API version prefix
 */
export const API_VERSION = "v1" as const;

/**
 * Supported blockchain chain IDs
 */
export const SUPPORTED_CHAINS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  LOCAL: 31337,
} as const;

export type SupportedChainId =
  (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];

/**
 * Default pagination values
 */
export const DEFAULT_PAGE_SIZE = 20 as const;
export const MAX_PAGE_SIZE = 100 as const;
