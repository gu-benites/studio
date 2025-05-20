/**
 * Base types for Hasura responses and operations
 */

/**
 * Represents a single field selection in a GraphQL query
 */
export type FieldSelection<T> = {
  [K in keyof T]?: boolean | FieldSelection<T[K]>;
};

/**
 * Represents the structure of a GraphQL query result
 */
export type QueryResult<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? Array<QueryResult<U>>
    : T[K] extends object
    ? QueryResult<T[K]>
    : T[K];
};

/**
 * Represents the structure of a GraphQL mutation input
 */
export type MutationInput<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<MutationInput<U>>
    : T[K] extends object
    ? MutationInput<T[K]>
    : T[K];
};

/**
 * Represents the structure of a where clause
 */
export type WhereInput<T> = {
  _and?: Array<WhereInput<T>>;
  _or?: Array<WhereInput<T>>;
  _not?: WhereInput<T>;
} & {
  [K in keyof T]?: T[K] | {
    _eq?: T[K];
    _neq?: T[K];
    _in?: T[K][] | any[];
    _nin?: T[K][] | any[];
    _gt?: T[K];
    _lt?: T[K];
    _gte?: T[K];
    _lte?: T[K];
    _like?: string;
    _ilike?: string;
    _is_null?: boolean;
  };
};

/**
 * Represents the structure of an order by clause
 */
export type OrderByInput<T> = {
  [K in keyof T]?: 'asc' | 'desc' | 'asc_nulls_first' | 'desc_nulls_first' | 'asc_nulls_last' | 'desc_nulls_last';
};

/**
 * Represents pagination options
 */
export type PaginationInput = {
  limit?: number;
  offset?: number;
};

/**
 * Represents a GraphQL query result with pagination
 */
export type PaginatedResult<T> = {
  data: T[];
  total: number;
  hasMore: boolean;
  pageInfo: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
