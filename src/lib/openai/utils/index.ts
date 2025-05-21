export * from './cache';
export * from './error-handler';
export * from '../constants';

/**
 * Truncates text to a maximum number of tokens
 * @param text Text to truncate
 * @param maxTokens Maximum number of tokens
 * @returns Truncated text
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  // Simple implementation - split by whitespace and join
  // In a real app, use a proper tokenizer
  const tokens = text.split(/\s+/);
  return tokens.slice(0, maxTokens).join(' ');
}

/**
 * Calculates the approximate number of tokens in a text
 * @param text Text to count tokens in
 * @returns Approximate token count
 */
export function countTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  // In a real app, use a proper tokenizer
  return Math.ceil(text.length / 4);
}

/**
 * Delays execution for a given number of milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a rate-limited version of a function
 * @param fn Function to rate-limit
 * @param delayMs Delay between calls in milliseconds
 * @returns Rate-limited function
 */
export function rateLimit<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastCall = 0;
  
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < delayMs) {
      await delay(delayMs - timeSinceLastCall);
    }
    
    lastCall = Date.now();
    return fn(...args);
  };
}
