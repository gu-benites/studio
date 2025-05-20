import { GraphQLClient } from 'graphql-request';

const HASURA_GRAPHQL_URL = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || 'http://129.148.47.122:8585/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_SECRET;

if (!HASURA_GRAPHQL_URL) {
  throw new Error('Missing NEXT_PUBLIC_HASURA_GRAPHQL_URL environment variable');
}

if (!HASURA_ADMIN_SECRET) {
  throw new Error('Missing HASURA_SECRET environment variable');
}

/**
 * Base GraphQL client for making requests to Hasura
 */
export const hasuraClient = new GraphQLClient(HASURA_GRAPHQL_URL, {
  headers: {
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    'Content-Type': 'application/json',
  },
});

export type HasuraError = {
  message: string;
  extensions?: {
    code?: string;
    path?: string;
  };
};

export type HasuraResponse<T> = {
  data?: T;
  errors?: HasuraError[];
};

/**
 * Executes a GraphQL query against the Hasura instance
 * @param query The GraphQL query string
 * @param variables Variables for the query
 * @returns Promise with the typed response
 */
export async function executeQuery<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<HasuraResponse<T>> {
  try {
    const data = await hasuraClient.request<T>(query, variables);
    return { data };
  } catch (error: any) {
    console.error('GraphQL Query Error:', error);
    return {
      errors: error.response?.errors || [{ message: error.message }],
    };
  }
}

/**
 * Executes a GraphQL mutation against the Hasura instance
 * @param mutation The GraphQL mutation string
 * @param variables Variables for the mutation
 * @returns Promise with the typed response
 */
export async function executeMutation<T = any>(
  mutation: string,
  variables?: Record<string, any>
): Promise<HasuraResponse<T>> {
  return executeQuery<T>(mutation, variables);
}

/**
 * Subscribes to GraphQL subscription
 * @param subscription The GraphQL subscription string
 * @param onData Callback when data is received
 * @param onError Callback when an error occurs
 * @returns Function to unsubscribe
 */
export function subscribe<T = any>(
  subscription: string,
  onData: (data: T) => void,
  onError?: (error: Error) => void
): () => void {
  // Note: For real subscriptions, you might want to use a WebSocket client
  // This is a simplified version that would work with polling
  console.warn('Using polling instead of WebSocket for subscriptions');
  
  const POLL_INTERVAL = 5000; // 5 seconds
  let isSubscribed = true;
  let lastResult: any = null;

  const poll = async () => {
    if (!isSubscribed) return;
    
    try {
      const { data, errors } = await executeQuery<T>(subscription);
      
      if (errors) {
        throw new Error(errors[0]?.message || 'Subscription error');
      }
      
      if (data && JSON.stringify(data) !== JSON.stringify(lastResult)) {
        lastResult = data;
        onData(data);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      onError?.(error as Error);
    } finally {
      if (isSubscribed) {
        setTimeout(poll, POLL_INTERVAL);
      }
    }
  };

  poll();
  
  return () => {
    isSubscribed = false;
  };
}
