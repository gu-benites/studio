import type { Redis } from '@upstash/redis';

export interface RedisClient extends Redis {}

export interface RedisClientOptions {
  url: string;
  token: string;
}

export interface RedisClientConfig {
  /**
   * The base URL for the Redis instance
   */
  url: string;
  
  /**
   * The authentication token
   */
  token: string;
  
  /**
   * Whether to enable debug logging
   */
  debug?: boolean;
  
  /**
   * Default TTL in seconds for cached items
   */
  defaultTtl?: number;
}
