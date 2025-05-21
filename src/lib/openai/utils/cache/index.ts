import { Redis } from '@upstash/redis';

// Initialize Redis if available
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const DEFAULT_TTL = 60 * 60 * 24; // 24 hours

export interface CacheOptions {
  ttl?: number; // in seconds
  namespace?: string;
}

export class CacheService {
  private namespace: string;

  constructor(namespace = 'openai') {
    this.namespace = namespace;
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    
    try {
      const data = await redis.get(this.getKey(key));
      return data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!redis) return false;

    try {
      const ttl = options.ttl || DEFAULT_TTL;
      await redis.set(this.getKey(key), value, { ex: ttl });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!redis) return false;

    try {
      await redis.del(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

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
}

// Singleton instance
export const cacheService = new CacheService('openai');
