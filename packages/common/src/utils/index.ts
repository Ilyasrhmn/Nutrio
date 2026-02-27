/**
 * Truncate an Ethereum address for display
 * @example formatAddress("0x1234567890abcdef1234567890abcdef12345678") → "0x1234...5678"
 */
export function formatAddress(
  address: string,
  startChars = 6,
  endChars = 4,
): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Async sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format a number with commas for display
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
