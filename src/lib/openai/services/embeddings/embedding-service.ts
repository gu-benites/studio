import { openai } from '../../../client';
import { BaseOpenAIModel } from '../../models/base/base-model';
import { cacheService } from '../../../redis';
import { generateCacheKey } from '../../../redis/utils/helpers';
import { 
  EmbeddingOptions, 
  EmbeddingResponse, 
  BatchEmbeddingResponse 
} from './types';

// Cache configuration
const CACHE_NAMESPACE = 'openai:embeddings';
const DEFAULT_CACHE_TTL = 60 * 60 * 24 * 7; // 1 week

const DEFAULT_OPTIONS: Required<Omit<EmbeddingOptions, 'dimensions'>> & { dimensions?: number } = {
  model: 'text-embedding-3-small',
  user: 'system',
  encodingFormat: 'float',
};

export class EmbeddingService extends BaseOpenAIModel<string, EmbeddingResponse> {
  private cache: typeof cacheService;
  private cacheTtl: number;

  constructor(options: EmbeddingOptions = {}) {
    super(options.model || DEFAULT_OPTIONS.model, {
      ...DEFAULT_OPTIONS,
      ...options,
    });
    this.cache = cacheService;
    this.cacheTtl = DEFAULT_CACHE_TTL;
  }

  protected processInput(input: string) {
    return input;
  }

  protected processOutput(output: any): EmbeddingResponse {
    return {
      embedding: output.data[0].embedding,
      model: output.model,
      usage: {
        promptTokens: output.usage.prompt_tokens,
        totalTokens: output.usage.total_tokens,
      },
    };
  }

  protected getApiNamespace() {
    return 'embeddings';
  }

  async getEmbedding(
    input: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    const cacheKey = generateCacheKey(CACHE_NAMESPACE, this.modelName, input);
    
    return this.cache.withCache(
      cacheKey,
      async () => {
        const response = await this.executeRequest('create', {
          ...options,
          input,
        });

        if (response.error) {
          throw response.error;
        }

        return response.data;
      },
      { ttl: this.cacheTtl }
    );
  }

  async getBatchEmbeddings(
    inputs: string[],
    options?: EmbeddingOptions
  ): Promise<BatchEmbeddingResponse> {
    // For batch requests, we'll check cache for each input individually
    const cachedResults: (EmbeddingResponse | null)[] = await Promise.all(
      inputs.map((input) => 
        this.getEmbedding(input, options).catch(() => null)
      )
    );

    // Find inputs that weren't in the cache
    const uncachedInputs = inputs.filter((_, index) => !cachedResults[index]);
    
    let batchResponse: BatchEmbeddingResponse = {
      embeddings: [],
      model: this.modelName,
      usage: { promptTokens: 0, totalTokens: 0 },
    };

    if (uncachedInputs.length > 0) {
      // Only make the API call for uncached inputs
      const response = await this.executeRequest('create', {
        ...options,
        input: uncachedInputs,
      });

      if (response.error) {
        throw response.error;
      }

      batchResponse = {
        embeddings: response.data.data.map((item: any) => item.embedding),
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };

      // Cache the new embeddings
      await Promise.all(
        uncachedInputs.map((input, index) => {
          const cacheKey = generateCacheKey(CACHE_NAMESPACE, this.modelName, input);
          return this.cache.set(
            cacheKey,
            {
              embedding: batchResponse.embeddings[index],
              model: batchResponse.model,
              usage: {
                promptTokens: 0, // Not available per item in batch
                totalTokens: 0,  // Not available per item in batch
              },
            },
            { ttl: this.cacheTtl }
          );
        })
      );
    }

    // Combine cached and new results
    const allEmbeddings = inputs.map((_, index) => {
      const cached = cachedResults[index];
      if (cached) return cached.embedding;
      const uncachedIndex = uncachedInputs.indexOf(inputs[index]);
      return batchResponse.embeddings[uncachedIndex];
    });

    return {
      embeddings: allEmbeddings,
      model: this.modelName,
      usage: {
        promptTokens: batchResponse.usage.promptTokens,
        totalTokens: batchResponse.usage.totalTokens,
      },
    };
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
