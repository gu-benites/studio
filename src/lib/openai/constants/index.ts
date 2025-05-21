// Default model configurations
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small' as const;
export const DEFAULT_CHAT_MODEL = 'gpt-4' as const;

// API configuration
export const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
export const OPENAI_API_TIMEOUT = 30000; // 30 seconds

// Rate limiting
export const RATE_LIMIT_DELAY = 1000; // 1 second between requests

// Cache settings
export const DEFAULT_CACHE_TTL = 60 * 60 * 24; // 24 hours

// Error messages
export const ERROR_MESSAGES = {
  MISSING_API_KEY: 'OpenAI API key is missing',
  INVALID_API_KEY: 'Invalid OpenAI API key',
  RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
  MODEL_UNAVAILABLE: 'The requested model is not available',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

// Model token limits
export const MODEL_TOKEN_LIMITS = {
  'gpt-4': 8192,
  'gpt-4-32k': 32768,
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-16k': 16384,
  'text-embedding-ada-002': 8191,
  'text-embedding-3-small': 8191,
  'text-embedding-3-large': 8191,
} as const;

// Default completion parameters
export const DEFAULT_COMPLETION_PARAMS = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
} as const;

// Default embedding parameters
export const DEFAULT_EMBEDDING_PARAMS = {
  model: DEFAULT_EMBEDDING_MODEL,
  encoding_format: 'float' as const,
} as const;
