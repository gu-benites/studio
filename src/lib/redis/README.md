# Redis Caching Service

A high-performance, type-safe Redis caching service for Node.js applications, specifically designed for use with OpenAI API responses.

## Features

- **Type-safe caching** with TypeScript support
- **TTL (Time To Live)** support for automatic cache invalidation
- **Namespace support** to prevent key collisions
- **Cache statistics** for monitoring hit/miss rates
- **Modular design** for easy extension
- **Environment-based configuration** for different deployment environments

## Installation

1. Install the required dependencies:
   ```bash
   npm install @upstash/redis
   ```

2. Set up your environment variables in `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL=your_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
   ```

## Usage

### Basic Usage

```typescript
import { cacheService } from './lib/redis';

// Set a value in cache
await cacheService.set('user:123', { name: 'John Doe' }, 3600);

// Get a value from cache
const user = await cacheService.get('user:123');

// Delete a value from cache
await cacheService.del('user:123');
```

### Using with OpenAI Services

The Redis cache service is pre-configured to work with OpenAI API responses:

```typescript
import { OpenAIService } from '../openai';

const openai = new OpenAIService();

// This will automatically use the Redis cache
const response = await openai.createCompletion({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello, world!' }],
});
```

## API Reference

### CacheService

#### `get<T>(key: string): Promise<T | null>`
Retrieves a value from the cache.

#### `set<T>(key: string, value: T, ttl?: number): Promise<boolean>`
Stores a value in the cache with an optional TTL (in seconds).

#### `del(key: string): Promise<boolean>`
Removes a value from the cache.

#### `withCache<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>`
A higher-order function that wraps an async function with caching logic.

### Configuration

The Redis client can be configured using environment variables:

- `UPSTASH_REDIS_REST_URL`: The REST URL for your Upstash Redis instance
- `UPSTASH_REDIS_REST_TOKEN`: The REST token for your Upstash Redis instance

## Best Practices

1. **Use meaningful cache keys** that include the namespace and relevant parameters
2. **Set appropriate TTLs** based on how frequently your data changes
3. **Handle cache misses** gracefully in your application code
4. **Monitor cache hit/miss rates** to optimize your caching strategy

## License

MIT

A modular and reusable Redis service for the application, providing caching and key-value storage capabilities.

## Features

- 🚀 Simple and intuitive API
- 🔒 Type-safe with TypeScript
- ⚡ Built-in support for namespacing
- 📦 Automatic JSON serialization/deserialization
- 🕒 TTL (Time To Live) support
- 🔄 Cache invalidation
- 📊 Cache statistics

## Installation

1. Install the required dependencies:

```bash
npm install @upstash/redis
```

2. Add the following environment variables to your `.env.local` file:

```env
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

## Usage

### Basic Usage

```typescript
import { cacheService } from '@/lib/redis';

// Set a value with a TTL of 1 hour
await cacheService.set('user:123', { name: 'John Doe' }, { ttl: 3600 });

// Get a value
const user = await cacheService.get('user:123');

// Delete a value
await cacheService.delete('user:123');

// Invalidate cache by pattern
await cacheService.invalidate('user:*');
```

### With Cache Fallback

```typescript
import { cacheService } from '@/lib/redis';

async function getUser(userId: string) {
  return cacheService.withCache(
    `user:${userId}`,
    async () => {
      // This function is only called if the key is not in the cache
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    { ttl: 300 } // Cache for 5 minutes
  );
}

// First call - fetches from API and caches the result
const user1 = await getUser('123');

// Subsequent calls - returns from cache
const user2 = await getUser('123');
```

### Using Namespaces

```typescript
import { CacheService } from '@/lib/redis/services/cache-service';

// Create a namespaced cache service
const userCache = new CacheService('users');

// All keys will be prefixed with "users:"
await userCache.set('123', { name: 'John' });
// => Key stored as "users:123"
```

## API Reference

### `CacheService`

#### `constructor(namespace?: string, defaultTtl?: number)`

Create a new cache service instance with an optional namespace and default TTL.

#### `get<T>(key: string): Promise<T | null>`

Get a value from the cache.

#### `set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>`

Set a value in the cache.

Options:
- `ttl`: Time to live in seconds (default: 1 hour)
- `namespace`: Override the instance namespace

#### `delete(key: string): Promise<boolean>`

Delete a value from the cache.

#### `withCache<T>(key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T>`

Get a value from the cache, or execute the provided function and cache the result.

#### `invalidate(pattern: string): Promise<boolean>`

Invalidate all keys matching the given pattern.

#### `getStats(): CacheStats`

Get cache statistics.

#### `resetStats(): void`

Reset cache statistics.

## Best Practices

1. **Use meaningful cache keys**: Include the entity type and identifier in your cache keys (e.g., `user:123`).

2. **Set appropriate TTLs**: Always set a TTL to prevent stale data. The default is 1 hour.

3. **Use namespaces**: Group related cache keys using namespaces to make invalidation easier.

4. **Handle cache misses**: Always handle the case where a value is not in the cache.

5. **Monitor cache usage**: Keep an eye on your cache hit/miss ratio to ensure your caching strategy is effective.

## Error Handling

The cache service is designed to be fault-tolerant. If Redis is unavailable, the service will:
- Return `null` for cache misses
- Silently fail for write operations
- Log errors to the console

This ensures that your application continues to work (albeit without caching) even if Redis is down.

## Testing

When testing, you can mock the Redis client or use an in-memory implementation:

```typescript
// In your test setup
jest.mock('@/lib/redis/client', () => ({
  __esModule: true,
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
}));
```

## License

MIT
