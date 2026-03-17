import { Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 300; // 5 minutes

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? undefined;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl ?? this.defaultTTL;
      await this.cacheManager.set(key, value, ttl * 1000); // Convert to milliseconds
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * Invalidate cache keys matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Note: cache-manager v5+ doesn't support pattern deletion directly
      // This would need to be implemented with a key tracking mechanism
      this.logger.warn(`Pattern invalidation requested for: ${pattern}`);
    } catch (error) {
      this.logger.error(`Cache pattern invalidation error for ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.cacheManager.get(key);
      return value !== undefined;
    } catch (error) {
      this.logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache key for role permissions
   */
  getRolePermissionsKey(roleName: string): string {
    return `permissions:role:${roleName}`;
  }

  /**
   * Get cache key for user menu
   */
  getUserMenuKey(roleId: string): string {
    return `menu:user:${roleId}`;
  }

  /**
   * Invalidate role permissions cache
   */
  async invalidateRolePermissions(roleName: string): Promise<void> {
    const key = this.getRolePermissionsKey(roleName);
    await this.del(key);
    this.logger.log(`Invalidated permissions cache for role: ${roleName}`);
  }

  /**
   * Invalidate user menu cache
   */
  async invalidateUserMenu(roleId: string): Promise<void> {
    const key = this.getUserMenuKey(roleId);
    await this.del(key);
    this.logger.log(`Invalidated menu cache for role: ${roleId}`);
  }
}
