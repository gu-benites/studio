import { openai } from '../../client';
import { OpenAIResponse } from '../../client/types';

export abstract class BaseOpenAIModel<TInput, TOutput> {
  protected modelName: string;
  protected defaultOptions: Record<string, unknown>;

  constructor(modelName: string, defaultOptions: Record<string, unknown> = {}) {
    this.modelName = modelName;
    this.defaultOptions = defaultOptions;
  }

  protected abstract processInput(input: TInput): unknown;
  protected abstract processOutput(output: unknown): TOutput;

  protected async executeRequest(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<OpenAIResponse<TOutput>> {
    try {
      // @ts-ignore - Dynamic method access
      const response = await openai[this.getApiNamespace()][endpoint].create({
        ...this.defaultOptions,
        ...data,
        model: this.modelName,
      });

      return {
        data: this.processOutput(response.data),
        error: null,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      return {
        data: null as unknown as TOutput,
        error: error as Error,
        status: (error as any)?.status || 500,
      };
    }
  }

  protected abstract getApiNamespace(): string;
}
