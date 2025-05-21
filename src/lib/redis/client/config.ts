import { Redis } from '@upstash/redis';

// Initialize Redis client with environment variables
const redisClient = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Export the configured client
export { redisClient };

export type { Redis } from '@upstash/redis';

export default redisClient;
