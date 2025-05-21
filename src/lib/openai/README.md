# OpenAI Service with Redis Caching

A TypeScript service for interacting with OpenAI's API, featuring built-in Redis caching for improved performance and cost efficiency.

## Features

- **Chat Completions** with streaming support
- **Embeddings** generation with semantic caching
- **Automatic Redis caching** of API responses
- **Type-safe** API with TypeScript support
- **Configurable** model options and parameters

## Installation

1. Install the required dependencies:
   ```bash
   npm install openai @upstash/redis
   ```

2. Set up your environment variables in `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   UPSTASH_REDIS_REST_URL=your_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
   ```

## Usage

### Basic Usage

```typescript
import { OpenAIService } from './lib/openai';

const openai = new OpenAIService();

// Get a chat completion (automatically cached)
const response = await openai.createCompletion({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, world!' }
  ]
});

// Stream a completion
await openai.streamCompletion(
  [{ role: 'user', content: 'Tell me a story' }],
  (chunk) => process.stdout.write(chunk)
);

// Generate embeddings (automatically cached)
const embeddings = await openai.createEmbedding({
  model: 'text-embedding-3-small',
  input: 'The food was delicious and the waiter...'
});
```

## Caching

All API responses are automatically cached using Redis with the following defaults:

- **Completions**: 24 hours TTL
- **Embeddings**: 7 days TTL

### Cache Invalidation

Cache keys are automatically generated based on the input parameters. To force a cache refresh:

```typescript
// Manually delete a cached completion
await cacheService.del(`openai:completions:${cacheKey}`);

// Or disable caching for a specific request
const response = await openai.createCompletion({
  // ...
}, { useCache: false });
```

## API Reference

### OpenAIService

#### `createCompletion(params: CompletionParams, options?: CompletionOptions)`
Creates a chat completion with optional caching.

#### `streamCompletion(messages: Message[], onChunk: (chunk: string) => void, options?: StreamOptions)`
Streams a chat completion response.

#### `createEmbedding(params: EmbeddingParams, options?: EmbeddingOptions)`
Generates embeddings for the input text.

## Best Practices

1. **Reuse client instances** to maintain connection pooling
2. **Set appropriate cache TTLs** based on your data freshness requirements
3. **Handle rate limiting** with exponential backoff for retries
4. **Monitor API usage** to stay within rate limits

## License

MIT

A modular and type-safe implementation of OpenAI API services for the Aromatherapy application. This service provides easy-to-use interfaces for working with OpenAI's API, including chat completions and embeddings, with built-in caching and error handling.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Structure](#structure)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Embeddings](#embeddings)
  - [Completions](#completions)
  - [Caching](#caching)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [License](#license)

## Installation

1. Install the required dependencies:

```bash
npm install openai @upstash/redis
```

2. Add the following environment variables to your `.env.local` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORGANIZATION=your_organization_id  # Optional

# Redis Caching (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `OPENAI_ORGANIZATION` | No | Your OpenAI organization ID |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL (required for caching) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token (required for caching) |

### Default Configuration

Default values can be found in `src/lib/openai/constants/index.ts` and include:

- Default models
- API timeouts
- Rate limiting settings
- Cache TTLs

## Structure

```
src/lib/openai/
├── client/                  # OpenAI client configuration
│   ├── config.ts           # Client initialization
│   ├── types.ts            # TypeScript types
│   └── index.ts            # Client exports
│
├── models/                 # Domain models
│   └── base/              # Base model classes
│       └── base-model.ts  # Base model implementation
│
├── services/               # Service layer
│   ├── embeddings/         # Embedding services
│   │   ├── types.ts       # Type definitions
│   │   ├── embedding-service.ts  # Implementation
│   │   └── index.ts       # Exports
│   │
│   └── completions/        # Completion services
│       ├── types.ts       # Type definitions
│       ├── completion-service.ts  # Implementation
│       └── index.ts       # Exports
│
├── utils/                  # Utility functions
│   ├── cache/             # Caching implementation
│   ├── error-handler.ts   # Error handling
│   └── index.ts           # Utility exports
│
├── constants/             # Application constants
│   └── index.ts
│
└── index.ts               # Main exports
```

## Usage

### Basic Usage

```typescript
import { openai } from '@/lib/openai';

// Chat completion
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello, world!' }],
});
```

### Embeddings

```typescript
import { embeddingService } from '@/lib/openai';

// Get a single embedding
const embedding = await embeddingService.getEmbedding('Sample text');

// Get batch embeddings
const batchEmbeddings = await embeddingService.getBatchEmbeddings([
  'Text 1',
  'Text 2',
  'Text 3'
]);
```

### Completions

```typescript
import { completionService } from '@/lib/openai';

// Basic completion
const response = await completionService.createCompletion([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Tell me a joke' }
]);

// Streaming completion
await completionService.streamCompletion(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Tell me a story' }
  ],
  (chunk) => {
    // Handle each chunk of the response
    console.log(chunk);
  }
);
```

### Caching

```typescript
import { cacheService } from '@/lib/openai/utils/cache';

// Basic caching
await cacheService.set('key', { data: 'value' }, { ttl: 3600 });
const cached = await cacheService.get('key');

// With fallback
const result = await cacheService.withCache(
  'cache-key',
  async () => {
    // Expensive operation
    return await fetchData();
  },
  { ttl: 86400 } // Cache for 24 hours
);
```

## API Reference

### EmbeddingService

#### `getEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResponse>`

Get an embedding for a single text input.

**Parameters:**
- `text`: The text to generate an embedding for
- `options`: Optional configuration (model, user, etc.)

**Returns:**
```typescript
{
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}
```

#### `getBatchEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<BatchEmbeddingResponse>`

Get embeddings for multiple text inputs in a single request.

**Parameters:**
- `texts`: Array of texts to generate embeddings for
- `options`: Optional configuration

**Returns:**
```typescript
{
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}
```

### CompletionService

#### `createCompletion(messages: Message[], options?: CompletionOptions): Promise<CompletionResponse>`

Create a chat completion.

**Parameters:**
- `messages`: Array of message objects
- `options`: Optional configuration (model, temperature, etc.)

**Returns:**
```typescript
{
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}
```

#### `streamCompletion(messages: Message[], onChunk: (chunk: string) => void, options?: CompletionOptions): Promise<CompletionResponse>`

Stream a chat completion, calling `onChunk` for each received chunk.

**Parameters:**
- `messages`: Array of message objects
- `onChunk`: Callback function for each chunk
- `options`: Optional configuration

## Error Handling

All errors are wrapped in a custom `OpenAIError` class with the following properties:

- `message`: Error message
- `status`: HTTP status code
- `code`: OpenAI error code (if available)
- `param`: Parameter that caused the error (if available)
- `type`: Type of error

### Example Error Handling

```typescript
try {
  const result = await completionService.createCompletion([...]);
} catch (error) {
  if (error.status === 429) {
    // Handle rate limiting
    console.error('Rate limit exceeded');
  } else if (error.status === 401) {
    // Handle authentication errors
    console.error('Invalid API key');
  } else {
    // Handle other errors
    console.error('Error:', error.message);
  }
}
```

## Best Practices

1. **Use Environment Variables**: Never hardcode API keys or sensitive information.
2. **Enable Caching**: Use the built-in caching for expensive operations.
3. **Handle Rate Limits**: Implement retry logic with exponential backoff.
4. **Monitor Usage**: Keep track of token usage to avoid unexpected costs.
5. **Use Streaming**: For long-running completions, use streaming to improve user experience.

## Testing

Run tests with:

```bash
npm test openai
```

## License

MIT
