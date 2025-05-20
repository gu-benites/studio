/**
 * Core types for Hasura GraphQL client
 */

export type HasuraError = {
  message: string;
  extensions?: {
    code?: string;
    path?: string;
  };
};

export type HasuraResponse<T = any> = {
  data?: T;
  errors?: HasuraError[];
};

export type FieldSelection<T> = {
  [K in keyof T]?: boolean | FieldSelection<any>;
};

export type WhereInput<T> = {
  [K in keyof T]?: 
    | T[K] 
    | { _eq?: T[K] }
    | { _neq?: T[K] }
    | { _in?: T[K][] }
    | { _nin?: T[K][] }
    | { _is_null?: boolean }
    | { _like?: string }
    | { _ilike?: string }
    | { _similar?: string }
    | { _nsimilar?: string }
    | { _regex?: string }
    | { _iregex?: string }
    | { _contains?: any }
    | { _contained_in?: any }
    | { _has_key?: string }
    | { _has_keys_any?: string[] }
    | { _has_keys_all?: string[] }
    | { _st_d_within?: { distance: number; from: any } }
    | { _st_contains?: any }
    | { _st_crosses?: any }
    | { _st_equals?: any }
    | { _st_intersects?: any }
    | { _st_overlaps?: any }
    | { _st_touches?: any }
    | { _st_within?: any }
    | { _st_3d_intersects?: any }
    | { _st_3d_d_within?: { distance: number; from: any } }
    | { _st_intersects_geography?: any }
    | { _st_d_within_geography?: { distance: number; from: any } }
    | { _st_3d_intersects_geography?: any }
    | { _st_3d_d_within_geography?: { distance: number; from: any } }
    | { _and?: Array<WhereInput<T>> }
    | { _or?: Array<WhereInput<T>> }
    | { _not?: WhereInput<T> };
} & { _and?: Array<WhereInput<T>>; _or?: Array<WhereInput<T>>; _not?: WhereInput<T> };

export type OrderByInput<T> = {
  [K in keyof T]?: 'asc' | 'desc' | 'asc_nulls_first' | 'desc_nulls_first' | 'asc_nulls_last' | 'desc_nulls_last';
};

export type PaginationInput = {
  limit?: number;
  offset?: number;
};

export type GraphQLRequestOptions = {
  headers?: Record<string, string>;
  operationName?: string;
};
