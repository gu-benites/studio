// Core exports
export * from './client';
export * from './utils';

// Services
export * from './services/embeddings';
export * from './services/completions';

// Models
export * from './models/base/base-model';

// Re-export OpenAI types for convenience
export type {
  ChatCompletionMessage,
  ChatCompletionCreateParams,
  ChatCompletion,
  Embedding,
  EmbeddingCreateParams,
} from 'openai/resources';

// Default export for simpler imports
import { openai } from './client';
export default openai;
