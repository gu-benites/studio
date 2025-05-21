import { OpenAIEmbeddingModel } from '../../../client/types';

export interface EmbeddingOptions {
  model?: OpenAIEmbeddingModel;
  user?: string;
  encodingFormat?: 'float' | 'base64';
  dimensions?: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface BatchEmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}
