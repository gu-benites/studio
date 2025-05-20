import { FieldSelection, OrderByInput, WhereInput } from '../../client/types';

/**
 * Builds a GraphQL query string for a list of items
 */
export function buildQuery<T>(
  tableName: string,
  fields: FieldSelection<T> = {},
  where?: WhereInput<T>,
  orderBy?: OrderByInput<T>,
  pagination?: { limit?: number; offset?: number }
): string {
  const args: string[] = [];

  if (where) {
    args.push(`where: $where`);
  }

  if (orderBy) {
    args.push(`order_by: ${buildOrderBy(orderBy)}`);
  }

  if (pagination?.limit !== undefined) {
    args.push(`limit: ${pagination.limit}`);
  }

  if (pagination?.offset !== undefined) {
    args.push(`offset: ${pagination.offset}`);
  }

  const argsString = args.length > 0 ? `(${args.join(', ')})` : '';
  return `${tableName}${argsString} ${buildSelection(fields)}`;
}

/**
 * Builds a GraphQL mutation string
 */
export function buildMutation<T>(
  tableName: string,
  operation: 'insert' | 'update' | 'delete',
  fields: FieldSelection<T> = {},
  options: {
    inputName?: string;
    inputType?: string;
    returning?: boolean;
  } = {}
): string {
  const {
    inputName = 'objects',
    inputType = `[${tableName}_insert_input!]!`,
    returning = true,
  } = options;

  const operationName = `
    mutation ${operation.charAt(0).toUpperCase() + operation.slice(1)}${tableName}($${inputName}: ${inputType}) {
      ${operation}_${tableName}(
        ${inputName.startsWith('$') ? inputName.slice(1) : `$${inputName}`}: $${inputName}
      ) {
        ${returning ? `returning ${buildSelection(fields)}` : 'affected_rows'}
      }
    }
  `;

  return operationName;
}

/**
 * Builds a selection set from fields
 */
export function buildSelection(fields: FieldSelection<any>): string {
  if (Object.keys(fields).length === 0) {
    return '{ __typename }';
  }

  const result: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === true) {
      result.push(key);
    } else if (typeof value === 'object' && value !== null) {
      result.push(`${key} ${buildSelection(value)}`);
    }
  }

  return `{ ${result.join(' ')} }`;
}

/**
 * Builds an order_by clause
 */
function buildOrderBy(orderBy: OrderByInput<any>): string {
  const entries = Object.entries(orderBy);
  if (entries.length === 0) return '{}';

  const orderByClauses = entries.map(([field, direction]) => {
    return `${field}: ${direction}`;
  });

  return `{ ${orderByClauses.join(', ')} }`;
}

/**
 * Builds a where clause
 */
export function buildWhere<T>(where: WhereInput<T>): string {
  if (!where || Object.keys(where).length === 0) {
    return '{}';
  }

  const conditions: string[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (value === undefined || value === null) continue;

    if (key.startsWith('_')) {
      // Handle logical operators (_and, _or, _not)
      if (key === '_and' || key === '_or') {
        const nestedConditions = (value as Array<WhereInput<T>>)
          .map((cond) => buildWhere(cond))
          .filter(Boolean);
        if (nestedConditions.length > 0) {
          conditions.push(`${key}: [${nestedConditions.join(', ')}]`);
        }
      } else if (key === '_not') {
        conditions.push(`${key}: ${buildWhere(value as WhereInput<T>)}`);
      }
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle operators (_eq, _in, etc.)
      const operators = Object.entries(value as Record<string, any>)
        .map(([op, val]) => {
          if (val === undefined || val === null) return null;
          return `${op}: ${JSON.stringify(val)}`;
        })
        .filter(Boolean);

      if (operators.length > 0) {
        conditions.push(`${key}: { ${operators.join(', ')} }`);
      }
    } else {
      // Simple equality
      conditions.push(`${key}: { _eq: ${JSON.stringify(value)} }`);
    }
  }

  return `{ ${conditions.join(', ')} }`;
}
