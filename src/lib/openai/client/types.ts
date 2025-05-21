import { OpenAI } from 'openai';

export type OpenAIClient = OpenAI;
export type OpenAIEmbeddingModel = 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
export type OpenAIChatModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';

export interface OpenAIResponse<T> {
  data: T;
  error: Error | null;
  status: number;
  headers?: Record<string, string>;
}

export interface OpenAIRequestOptions {
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}
