import { FieldSelection, OrderByInput, PaginationInput, QueryResult, WhereInput } from './types';

/**
 * Builds a GraphQL query string based on the provided parameters
 * @param tableName The name of the table to query
 * @param fields The fields to select
 * @param where The where clause
 * @param orderBy The order by clause
 * @param pagination Pagination options
 * @param distinctOn Fields to distinct on
 * @returns The GraphQL query string
 */
export function buildQuery<T>(
  tableName: string,
  fields: FieldSelection<T>,
  where?: WhereInput<T>,
  orderBy?: OrderByInput<T>,
  pagination?: PaginationInput,
  distinctOn?: Array<keyof T>
): string {
  const selection = buildSelection(fields);
  const args: string[] = [];

  if (where) {
    args.push(`where: ${buildWhere(where)}`);
  }

  if (orderBy) {
    args.push(`order_by: ${buildOrderBy(orderBy)}`);
  }

  if (pagination) {
    if (pagination.limit !== undefined) {
      args.push(`limit: ${pagination.limit}`);
    }
    if (pagination.offset !== undefined) {
      args.push(`offset: ${pagination.offset}`);
    }
  }

  if (distinctOn && distinctOn.length > 0) {
    args.push(`distinct_on: [${distinctOn.join(', ')}]`);
  }

  return `${tableName}${args.length ? `(${args.join(', ')})` : ''} ${selection}`;
}

/**
 * Builds a selection set from the provided fields
 * @param fields The fields to select
 * @returns The selection set as a string
 */
function buildSelection(fields: Record<string, any>): string {
  const selectedFields: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === true) {
      selectedFields.push(key);
    } else if (typeof value === 'object' && value !== null) {
      selectedFields.push(`${key} ${buildSelection(value)}`);
    }
  }

  return `{ ${selectedFields.join(' ')} }`;
}

/**
 * Builds a where clause from the provided conditions
 * @param where The where conditions
 * @returns The where clause as a string
 */
function buildWhere(where: Record<string, any>): string {
  const conditions: string[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (key === '_and' || key === '_or' || key === '_not') {
      const operator = key.replace('_', '');
      const nested = Array.isArray(value)
        ? value.map((v) => `{ ${buildWhere(v)} }`).join(', ')
        : `{ ${buildWhere(value)} }`;
      conditions.push(`${key}: [${nested}]`);
    } else if (typeof value === 'object' && value !== null) {
      const operators: string[] = [];
      for (const [op, opValue] of Object.entries(value)) {
        if (opValue !== undefined) {
          operators.push(`${op}: ${JSON.stringify(opValue)}`);
        }
      }
      if (operators.length > 0) {
        conditions.push(`${key}: { ${operators.join(', ')} }`);
      }
    } else if (value !== undefined) {
      conditions.push(`${key}: { _eq: ${JSON.stringify(value)} }`);
    }
  }

  return conditions.join(', ');
}

/**
 * Builds an order by clause from the provided ordering
 * @param orderBy The order by conditions
 * @returns The order by clause as a string
 */
function buildOrderBy(orderBy: Record<string, any>): string {
  const orders: string[] = [];

  for (const [key, value] of Object.entries(orderBy)) {
    if (value) {
      orders.push(`${key}: ${value}`);
    }
  }

  return `{ ${orders.join(', ')} }`;
}

/**
 * Builds a GraphQL mutation string
 * @param operation The operation type (insert, update, delete)
 * @param tableName The name of the table
 * @param data The data for the mutation
 * @param where The where clause for update/delete operations
 * @param returning The fields to return
 * @returns The GraphQL mutation string
 */
export function buildMutation<T>(
  operation: 'insert' | 'update' | 'delete',
  tableName: string,
  data: any,
  where?: WhereInput<T>,
  returning?: FieldSelection<T>
): string {
  const args: string[] = [];

  if (operation === 'insert') {
    args.push(`objects: ${JSON.stringify(Array.isArray(data) ? data : [data])}`);
  } else if (operation === 'update') {
    if (where) {
      args.push(`where: ${buildWhere(where)}`);
    }
    args.push(`_set: ${JSON.stringify(data)}`);
  } else if (operation === 'delete') {
    if (where) {
      args.push(`where: ${buildWhere(where)}`);
    }
  }

  const selection = returning ? buildSelection(returning) : '{ affected_rows }';
  
  return `${operation}_${tableName}(${args.join(', ')}) ${selection}`;
}

/**
 * Builds a GraphQL subscription string
 * @param tableName The name of the table to subscribe to
 * @param fields The fields to select
 * @param where The where clause
 * @param orderBy The order by clause
 * @param limit The maximum number of results to return
 * @returns The GraphQL subscription string
 */
export function buildSubscription<T>(
  tableName: string,
  fields: FieldSelection<T>,
  where?: WhereInput<T>,
  orderBy?: OrderByInput<T>,
  limit?: number
): string {
  const selection = buildSelection(fields);
  const args: string[] = [];

  if (where) {
    args.push(`where: ${buildWhere(where)}`);
  }

  if (orderBy) {
    args.push(`order_by: ${buildOrderBy(orderBy)}`);
  }

  if (limit) {
    args.push(`limit: ${limit}`);
  }

  return `subscription ${tableName}_subscription {
    ${tableName}${args.length ? `(${args.join(', ')})` : ''} ${selection}
  }`;
}
