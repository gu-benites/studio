import { GraphQLClient } from 'graphql-request';
import { HasuraError, HasuraResponse, GraphQLRequestOptions } from './types';

const HASURA_GRAPHQL_URL = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL;
const HASURA_ADMIN_SECRET = process.env.HASURA_SECRET;

if (!HASURA_GRAPHQL_URL) {
  throw new Error('Missing NEXT_PUBLIC_HASURA_GRAPHQL_URL environment variable');
}

if (!HASURA_ADMIN_SECRET) {
  throw new Error('Missing HASURA_SECRET environment variable');
}

/**
 * Custom error class for GraphQL errors
 */
export class GraphQLError extends Error {
  public errors: HasuraError[];
  public status?: number;

  constructor(errors: HasuraError[], status?: number) {
    super('GraphQL request failed');
    this.name = 'GraphQLError';
    this.errors = errors;
    this.status = status;
  }
}

/**
 * Executes a GraphQL query
 */
export async function executeQuery<T = any>(
  query: string,
  variables?: Record<string, any>,
  options: GraphQLRequestOptions = {}
): Promise<HasuraResponse<T>> {
  try {
    const client = new GraphQLClient(HASURA_GRAPHQL_URL, {
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await client.request<T>(query, variables, options);
    return { data };
  } catch (error: any) {
    console.error('GraphQL Query Error:', error);
    
    if (error.response) {
      // Handle Hasura errors
      const { errors, status } = error.response;
      throw new GraphQLError(errors || [{ message: error.message }], status);
    }
    
    throw new GraphQLError([{ message: error.message }]);
  }
}

/**
 * Executes a GraphQL mutation
 */
export async function executeMutation<T = any>(
  mutation: string,
  variables?: Record<string, any>,
  options: GraphQLRequestOptions = {}
): Promise<HasuraResponse<T>> {
  return executeQuery<T>(mutation, variables, {
    ...options,
    headers: {
      ...options.headers,
      'X-Hasura-Use-Backend-Only-Permissions': 'true',
    },
  });
}

/**
 * Subscribes to a GraphQL subscription
 * Note: This uses polling under the hood for simplicity
 */
export function subscribe<T = any>(
  subscription: string,
  onData: (data: T) => void,
  onError?: (error: Error) => void,
  pollInterval = 5000,
  variables?: Record<string, any>,
  options: GraphQLRequestOptions = {}
): () => void {
  let isSubscribed = true;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    if (!isSubscribed) return;

    try {
      const { data } = await executeQuery<T>(subscription, variables, options);
      if (data) {
        onData(data);
      }
    } catch (error) {
      onError?.(error as Error);
    }

    if (isSubscribed) {
      timeoutId = setTimeout(poll, pollInterval);
    }
  };

  // Start polling
  poll();

  // Return unsubscribe function
  return () => {
    isSubscribed = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}
