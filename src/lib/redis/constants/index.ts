/**
 * Default TTL values in seconds
 */
export const DEFAULT_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 3600,    // 1 hour
  LONG: 86400,     // 1 day
  VERY_LONG: 604800, // 1 week
} as const;

/**
 * Cache key prefixes
 */
export const CACHE_PREFIX = {
  SESSION: 'sess',
  USER: 'usr',
  API: 'api',
  AUTH: 'auth',
  CONFIG: 'cfg',
} as const;

/**
 * Redis configuration
 */
export const REDIS_CONFIG = {
  MAX_RETRIES: 3,
  CONNECT_TIMEOUT: 10000, // 10 seconds
  SOCKET_TIMEOUT: 5000,  // 5 seconds
} as const;
