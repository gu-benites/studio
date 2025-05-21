import { openai } from '../../client';
import OpenAI from 'openai';
import { BaseOpenAIModel } from '../../models/base/base-model';
import { cacheService } from '../../../redis';
import { generateCacheKey } from '../../../redis/utils/helpers';
import { Message, CompletionOptions, CompletionResponse } from './types';

// Import OpenAI types
import type { ChatCompletionMessageParam as OpenAIChatCompletionMessageParam } from 'openai/resources/chat/completions';

interface StreamOptions extends CompletionOptions {
  stream?: boolean;
}

// Cache configuration
const CACHE_NAMESPACE = 'openai:completions';
const DEFAULT_CACHE_TTL = 60 * 60 * 24; // 1 day

const DEFAULT_OPTIONS: Required<CompletionOptions> = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stop: [],
  user: 'system',
};

interface StreamOptions extends Partial<CompletionOptions> {
  stream?: boolean;
}

export class CompletionService extends BaseOpenAIModel<Message[], CompletionResponse> {
  private options: Required<CompletionOptions>;
  private cache: typeof cacheService;
  private cacheTtl: number;

  constructor(options: CompletionOptions = {}) {
    super(options.model || DEFAULT_OPTIONS.model, {
      ...DEFAULT_OPTIONS,
    });
    
    this.cache = cacheService;
    this.cacheTtl = DEFAULT_CACHE_TTL;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  protected processInput(input: Message[]) {
    return input;
  }

  protected processOutput(output: any): CompletionResponse {
    return {
      content: output.choices?.[0]?.message?.content || '',
      model: output.model,
      usage: {
        promptTokens: output.usage?.prompt_tokens || 0,
        completionTokens: output.usage?.completion_tokens || 0,
        totalTokens: output.usage?.total_tokens || 0,
      },
      finishReason: output.choices?.[0]?.finish_reason || 'stop',
    };
  }

  protected getApiNamespace(): string {
    return 'chat.completions';
  }

  async getCompletion(
    messages: Message[],
    options: Partial<CompletionOptions> = {}
  ): Promise<CompletionResponse> {
    // Create a cache key based on messages and options
    const cacheKey = generateCacheKey(
      CACHE_NAMESPACE, 
      this.modelName, 
      JSON.stringify({ messages, options })
    );

    return this.cache.withCache(
      cacheKey,
      async () => {
        const response = await this.executeRequest('create', {
          ...this.options,
          ...options,
          messages,
        });

        if (response.error) {
          throw response.error;
        }

        return this.processOutput(response.data);
      },
      { ttl: this.cacheTtl }
    );
  }

  async streamCompletion(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options: StreamOptions = {}
  ): Promise<CompletionResponse> {
    try {
      // For non-streaming, use the cached version if available
      if (options.stream === false) {
        return this.getCompletion(messages, options);
      }

      // Convert our Message type to chat completion messages
      const chatMessages: OpenAIChatCompletionMessageParam[] = messages.map(msg => {
        if (msg.role === 'function') {
          // For function messages, ensure name is provided
          if (!('name' in msg) || !msg.name) {
            throw new Error('Function messages must include a name');
          }
          return {
            role: 'function',
            content: msg.content,
            name: msg.name
          } as const;
        }
        
        // For non-function messages
        const baseMsg = {
          role: msg.role,
          content: msg.content
        };
        
        // Only add name if it exists
        if ('name' in msg && msg.name) {
          return {
            ...baseMsg,
            name: msg.name
          };
        }
        
        return baseMsg;
      });

      // For streaming, we can't cache the response chunks
      const stream = await openai.chat.completions.create({
        ...this.options,
        ...options,
        messages: chatMessages,
        stream: true,
      });

      let fullResponse = '';
      let usage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };

      // Process the stream
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      // After streaming is complete, we can get the usage from the API if needed
      // For now, we'll just return the accumulated content
      return {
        content: fullResponse,
        model: this.modelName,
        usage: {
          promptTokens: 0, // These would come from the API in a real implementation
          completionTokens: fullResponse.length / 4, // Rough estimate
          totalTokens: fullResponse.length / 4, // Rough estimate
        },
        finishReason: 'stop',
      };
    } catch (error) {
      console.error('Error in streamCompletion:', error);
      throw error;
    }
  }
}

// Singleton instance
export const completionService = new CompletionService();
