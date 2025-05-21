import { openai } from '../../client/config';
import { OpenAIEmbeddingModel } from '../../client/types';
import { EmbeddingOptions, EmbeddingResponse } from './types';

export async function generateEmbedding(
  input: string,
  options: EmbeddingOptions = {}
): Promise<EmbeddingResponse> {
  try {
    const model: OpenAIEmbeddingModel = options.model || (process.env.OPENAI_EMBEDDING_MODEL as OpenAIEmbeddingModel) || 'text-embedding-3-small';
    
    const response = await openai.embeddings.create({
      model,
      input,
      encoding_format: options.encodingFormat,
      user: options.user,
      dimensions: options.dimensions,
    });

    // Extract the first embedding from the response
    const embedding = response.data[0].embedding;

    return {
      embedding,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Export a singleton instance for convenience
export const embeddingService = {
  generateEmbedding,
};
