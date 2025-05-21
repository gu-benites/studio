import { OpenAIError } from 'openai/error';

export class OpenAIError extends Error {
  status: number;
  code: string | null;
  param: string | null;
  type: string | null;

  constructor(error: any) {
    super(error.message);
    this.name = 'OpenAIError';
    this.status = error.status || 500;
    this.code = error.code || null;
    this.param = error.param || null;
    this.type = error.type || null;
  }
}

export function handleOpenAIError(error: unknown): never {
  if (error instanceof OpenAIError) {
    throw new OpenAIError({
      message: error.message,
      status: error.status,
      code: error.code,
      param: error.param,
      type: error.type,
    });
  }

  if (error instanceof Error) {
    throw new OpenAIError({
      message: error.message,
      status: 500,
    });
  }

  throw new OpenAIError({
    message: 'An unknown error occurred',
    status: 500,
  });
}

export function isRateLimitError(error: unknown): boolean {
  return (
    error instanceof OpenAIError &&
    (error.status === 429 || error.code === 'rate_limit_exceeded')
  );
}

export function isAuthenticationError(error: unknown): boolean {
  return (
    error instanceof OpenAIError &&
    (error.status === 401 || error.code === 'invalid_api_key')
  );
}

export function isModelError(error: unknown): boolean {
  return (
    error instanceof OpenAIError &&
    (error.status === 400 || error.code?.includes('model_not_found'))
  );
}
