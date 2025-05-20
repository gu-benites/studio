import { executeMutation, executeQuery, hasuraClient, HasuraResponse } from './client';
import { buildMutation, buildQuery, buildSubscription } from './query-builder';
import { FieldSelection, OrderByInput, PaginatedResult, PaginationInput, WhereInput } from './types';

/**
 * Base model class that provides common CRUD operations
 */
export abstract class BaseModel<T, ID = string> {
  protected abstract tableName: string;
  protected abstract idField: string;

  /**
   * Finds a single record by ID
   * @param id The ID of the record to find
   * @param fields The fields to select
   * @returns The found record or null if not found
   */
  async findById(id: ID, fields: FieldSelection<T>): Promise<T | null> {
    const query = `query Get${this.tableName}ById($id: uuid!) {
      ${this.tableName}_by_pk(${this.idField}: $id) ${buildSelection(fields)}
    }`;

    const { data, errors } = await executeQuery<{ [key: string]: T }>(query, { id });
    
    if (errors || !data) {
      console.error('Error finding record:', errors);
      return null;
    }

    return data[`${this.tableName}_by_pk`];
  }

  /**
   * Finds multiple records matching the where clause
   * @param where The where clause
   * @param fields The fields to select
   * @param orderBy The order by clause
   * @param pagination Pagination options
   * @returns An array of matching records
   */
  async findMany(
    where?: WhereInput<T>,
    fields: FieldSelection<T> = {},
    orderBy?: OrderByInput<T>,
    pagination?: PaginationInput
  ): Promise<T[]> {
    const query = `query Get${this.tableName}($where: ${this.tableName}_bool_exp) {
      ${buildQuery(this.tableName, fields, where, orderBy, pagination)}
    }`;

    const { data, errors } = await executeQuery<{ [key: string]: T[] }>(query, { where });
    
    if (errors || !data) {
      console.error('Error finding records:', errors);
      return [];
    }

    return data[this.tableName] || [];
  }

  /**
   * Finds multiple records with pagination
   * @param where The where clause
   * @param fields The fields to select
   * @param orderBy The order by clause
   * @param pagination Pagination options
   * @returns A paginated result with data and pagination info
   */
  async findManyPaginated(
    where?: WhereInput<T>,
    fields: FieldSelection<T> = {},
    orderBy?: OrderByInput<T>,
    pagination: PaginationInput = { limit: 10, offset: 0 }
  ): Promise<PaginatedResult<T>> {
    // First, get the total count
    const countQuery = `query Get${this.tableName}Count($where: ${this.tableName}_bool_exp) {
      ${this.tableName}_aggregate(where: $where) { aggregate { count } }
    }`;

    const { data: countData, errors: countErrors } = await executeQuery<{
      [key: string]: { aggregate: { count: number } };
    }>(countQuery, { where });

    if (countErrors || !countData) {
      console.error('Error counting records:', countErrors);
      return { data: [], total: 0, hasMore: false, pageInfo: { currentPage: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
    }

    const total = countData[`${this.tableName}_aggregate`].aggregate.count;
    const totalPages = Math.ceil(total / (pagination.limit || 10));
    const currentPage = Math.floor((pagination.offset || 0) / (pagination.limit || 10)) + 1;

    // Then get the paginated data
    const data = await this.findMany(where, fields, orderBy, pagination);

    return {
      data,
      total,
      hasMore: currentPage < totalPages,
      pageInfo: {
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  /**
   * Creates a new record
   * @param data The data to insert
   * @param returning The fields to return
   * @returns The created record
   */
  async create(data: Partial<T>, returning: FieldSelection<T> = {}): Promise<T | null> {
    const mutation = `mutation Create${this.tableName}($objects: [${this.tableName}_insert_input!]!) {
      ${buildMutation('insert', this.tableName, data, undefined, returning)}
    }`;

    const { data: result, errors } = await executeMutation<{ [key: string]: { returning: T[] } }>(
      mutation,
      { objects: [data] }
    );

    if (errors || !result) {
      console.error('Error creating record:', errors);
      return null;
    }

    return result[`insert_${this.tableName}`]?.returning?.[0] || null;
  }

  /**
   * Updates a record by ID
   * @param id The ID of the record to update
   * @param data The data to update
   * @param returning The fields to return
   * @returns The updated record or null if not found
   */
  async updateById(
    id: ID,
    data: Partial<T>,
    returning: FieldSelection<T> = {}
  ): Promise<T | null> {
    const where = { [this.idField]: { _eq: id } } as unknown as WhereInput<T>;
    return this.update(where, data, returning);
  }

  /**
   * Updates multiple records matching the where clause
   * @param where The where clause
   * @param data The data to update
   * @param returning The fields to return
   * @returns The first updated record or null if none found
   */
  async update(
    where: WhereInput<T>,
    data: Partial<T>,
    returning: FieldSelection<T> = {}
  ): Promise<T | null> {
    const mutation = `mutation Update${this.tableName}($where: ${this.tableName}_bool_exp!, $_set: ${this.tableName}_set_input) {
      ${buildMutation('update', this.tableName, data, where, returning)}
    }`;

    const { data: result, errors } = await executeMutation<{ [key: string]: { returning: T[] } }>(
      mutation,
      { where, _set: data }
    );

    if (errors || !result) {
      console.error('Error updating record:', errors);
      return null;
    }

    return result[`update_${this.tableName}`]?.returning?.[0] || null;
  }

  /**
   * Deletes a record by ID
   * @param id The ID of the record to delete
   * @param returning The fields to return before deletion
   * @returns The deleted record or null if not found
   */
  async deleteById(id: ID, returning: FieldSelection<T> = {}): Promise<T | null> {
    const where = { [this.idField]: { _eq: id } } as unknown as WhereInput<T>;
    return this.delete(where, returning);
  }

  /**
   * Deletes multiple records matching the where clause
   * @param where The where clause
   * @param returning The fields to return before deletion
   * @returns The first deleted record or null if none found
   */
  async delete(where: WhereInput<T>, returning: FieldSelection<T> = {}): Promise<T | null> {
    const mutation = `mutation Delete${this.tableName}($where: ${this.tableName}_bool_exp!) {
      ${buildMutation('delete', this.tableName, {}, where, returning)}
    }`;

    const { data: result, errors } = await executeMutation<{ [key: string]: { returning: T[] } }>(
      mutation,
      { where }
    );

    if (errors || !result) {
      console.error('Error deleting record:', errors);
      return null;
    }

    return result[`delete_${this.tableName}`]?.returning?.[0] || null;
  }

  /**
   * Subscribes to changes on the table
   * @param callback The callback to call when data changes
   * @param where The where clause
   * @param fields The fields to select
   * @returns A function to unsubscribe
   */
  subscribe(
    callback: (data: T[]) => void,
    where?: WhereInput<T>,
    fields: FieldSelection<T> = {}
  ): () => void {
    const subscription = buildSubscription(this.tableName, fields, where);
    
    // In a real implementation, you would use WebSocket for subscriptions
    // This is a simplified version that uses polling
    console.warn('Using polling instead of WebSocket for subscriptions');
    
    const POLL_INTERVAL = 5000; // 5 seconds
    let isSubscribed = true;
    let lastResult: any = null;

    const poll = async () => {
      if (!isSubscribed) return;
      
      try {
        const data = await this.findMany(where, fields);
        
        if (isSubscribed && JSON.stringify(data) !== JSON.stringify(lastResult)) {
          lastResult = data;
          callback(data);
        }
      } catch (error) {
        console.error('Subscription error:', error);
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
}

/**
 * Helper function to build a selection set from fields
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
