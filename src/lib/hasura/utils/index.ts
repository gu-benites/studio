import { GraphQLError } from '../client';

/**
 * Checks if the error is a GraphQL error
 */
export function isGraphQLError(error: unknown): error is GraphQLError {
  return error instanceof GraphQLError;
}

/**
 * Formats an error message from an unknown error
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

/**
 * Converts an object to a GraphQL input object
 * Removes undefined values and converts Date objects to ISO strings
 */
export function toGraphQLInput<T extends Record<string, any>>(input: T): T {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'object' && item !== null ? toGraphQLInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = toGraphQLInput(value);
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
}

/**
 * Converts a GraphQL response to a more usable format
 */
export function normalizeGraphQLResponse<T>(response: any): T {
  if (!response || typeof response !== 'object') {
    return response as T;
  }
  
  // Handle arrays
  if (Array.isArray(response)) {
    return response.map(normalizeGraphQLResponse) as unknown as T;
  }
  
  // Handle objects
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(response)) {
    // Remove GraphQL metadata fields
    if (key.startsWith('__')) continue;
    
    // Handle nested objects
    if (value && typeof value === 'object') {
      if ('edges' in value && 'pageInfo' in value) {
        // Handle Relay-style connections
        result[key] = {
          ...value,
          edges: value.edges.map((edge: any) => ({
            ...edge,
            node: normalizeGraphQLResponse(edge.node)
          })),
          pageInfo: value.pageInfo
        };
      } else if ('nodes' in value && 'pageInfo' in value) {
        // Handle simplified connections
        result[key] = {
          nodes: value.nodes.map(normalizeGraphQLResponse),
          pageInfo: value.pageInfo
        };
      } else if (Array.isArray(value)) {
        // Handle arrays
        result[key] = value.map(normalizeGraphQLResponse);
      } else {
        // Handle plain objects
        result[key] = normalizeGraphQLResponse(value);
      }
    } else {
      // Handle scalar values
      result[key] = value;
    }
  }
  
  return result as T;
}

/**
 * Creates a type-safe GraphQL query/mutation
 */
export function createOperation<T, V = Record<string, any>>(
  strings: TemplateStringsArray,
  ...values: any[]
): [string, (variables: V) => Promise<T>] {
  const query = String.raw(strings, ...values);
  
  return [
    query,
    async (variables: V) => {
      const { executeQuery, executeMutation } = await import('../client');
      const isMutation = query.trim().startsWith('mutation');
      
      try {
        const response = isMutation
          ? await executeMutation<T>(query, variables)
          : await executeQuery<T>(query, variables);
        
        if (response.errors) {
          throw new GraphQLError(response.errors);
        }
        
        return response.data!;
      } catch (error) {
        console.error('GraphQL operation failed:', error);
        throw error;
      }
    }
  ];
}
