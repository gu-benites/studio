import { redisClient } from '../client';
import type { Redis } from '@upstash/redis';

export interface CacheOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number;
  
  /**
   * Custom namespace for the cache key
   */
  namespace?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

export class CacheService {
  private namespace: string;
  private stats: CacheStats;
  private defaultTtl: number;

  constructor(namespace = 'cache', defaultTtl = 3600) {
    this.namespace = namespace;
    this.defaultTtl = defaultTtl;
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient) {
      console.warn('Redis client not initialized - cache get operation skipped');
      return null;
    }

    try {
      const data = await redisClient.get(this.getKey(key));
      if (data !== null) {
        this.stats.hits++;
        return data as T;
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options
   * @returns True if successful, false otherwise
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!redisClient) {
      console.warn('Redis client not initialized - cache set operation skipped');
      return false;
    }

    try {
      const ttl = options.ttl ?? this.defaultTtl;
      await redisClient.set(this.getKey(key), value, { ex: ttl });
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete a value from the cache
   * @param key Cache key
   * @returns True if successful, false otherwise
   */
  async delete(key: string): Promise<boolean> {
    if (!redisClient) {
      console.warn('Redis client not initialized - cache delete operation skipped');
      return false;
    }

    try {
      await redisClient.del(this.getKey(key));
      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Get a value from the cache, or set it if it doesn't exist
   * @param key Cache key
   * @param fn Function to generate the value if not in cache
   * @param options Cache options
   * @returns The cached or newly generated value
   */
  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, execute the function
    const result = await fn();
    
    // Cache the result
    await this.set(key, result, options);
    
    return result;
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern Pattern to match keys against
   * @returns True if successful, false otherwise
   */
  async invalidate(pattern: string): Promise<boolean> {
    if (!redisClient) {
      console.warn('Redis client not initialized - cache invalidation skipped');
      return false;
    }

    try {
      const keys = await redisClient.keys(`${this.namespace}:${pattern}`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns Current cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }
}

// Default cache service instance
export const cacheService = new CacheService('app');
