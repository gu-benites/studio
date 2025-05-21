import OpenAI from 'openai';

// Initialize the OpenAI client with configuration
export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    baseURL: process.env.OPENAI_API_BASE_URL,
  });
}

// Export a singleton instance
export const openai = createOpenAIClient();
