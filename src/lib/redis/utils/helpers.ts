/**
 * Generate a cache key from multiple parts
 * @param parts Parts to join into a cache key
 * @returns A string that can be used as a cache key
 */
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts
    .filter(Boolean)
    .map(part => String(part).replace(/[^a-z0-9_\-:.]/gi, '_'))
    .join(':');
}

/**
 * Parse a TTL value from various formats
 * @param ttl Time to live value (number in seconds or string with unit, e.g., '1h', '30m')
 * @returns TTL in seconds
 */
export function parseTtl(ttl?: string | number): number | undefined {
  if (typeof ttl === 'number') {
    return Math.max(0, ttl);
  }
  
  if (typeof ttl === 'string') {
    const match = ttl.match(/^(\d+)([smhd])?$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2] || 's';
      
      switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
      }
    }
  }
  
  return undefined;
}
