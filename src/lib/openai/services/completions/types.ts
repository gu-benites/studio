// Define chat model types
type OpenAIChatModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';

// Base message type for system, user, and assistant messages
type BaseMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
};

// Function message type with required name
interface FunctionMessage {
  role: 'function';
  content: string;
  name: string; // name is required for function messages
}

export type Message = BaseMessage | FunctionMessage;

export interface CompletionOptions {
  model?: OpenAIChatModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  user?: string;
}

export interface CompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}
