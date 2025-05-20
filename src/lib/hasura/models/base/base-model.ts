import { executeQuery, executeMutation, HasuraResponse } from '../../client';
import { buildQuery, buildMutation } from '../../queries/builder';
import { FieldSelection, OrderByInput, PaginationInput, WhereInput } from '../../client/types';

/**
 * Base model class that provides common CRUD operations for Hasura
 */
export abstract class BaseModel<T, ID = string> {
  protected abstract tableName: string;
  protected abstract idField: string;

  /**
   * Finds a single record by ID
   */
  async findById(
    id: ID,
    fields: FieldSelection<T>
  ): Promise<T | null> {
    const query = `
      query Get${this.getTypeName()}ById($id: ${this.getIdType()}) {
        ${this.tableName}_by_pk(${this.idField}: $id) ${this.buildSelection(fields)}
      }
    `;

    const { data, errors } = await executeQuery<{ [key: string]: T }>(query, { id });
    
    if (errors || !data) {
      console.error(`Error finding ${this.tableName} by ID:`, errors);
      return null;
    }

    return data[`${this.tableName}_by_pk`];
  }

  /**
   * Finds multiple records with filtering, sorting, and pagination
   */
  async findMany(
    where?: WhereInput<T>,
    fields: FieldSelection<T> = {},
    orderBy?: OrderByInput<T>,
    pagination?: PaginationInput
  ): Promise<T[]> {
    const query = `
      query Get${this.getTypeName()}List($where: ${this.tableName}_bool_exp) {
        ${buildQuery(this.tableName, fields, where, orderBy, pagination)}
      }
    `;

    const { data, errors } = await executeQuery<{ [key: string]: T[] }>(query, { where });

    if (errors || !data) {
      console.error(`Error finding ${this.tableName} list:`, errors);
      return [];
    }

    return data[this.tableName] || [];
  }

  /**
   * Creates a new record
   */
  async create(
    data: Partial<T>,
    fields: FieldSelection<T> = { id: true }
  ): Promise<T | null> {
    const mutation = `
      mutation Create${this.getTypeName()}($object: ${this.tableName}_insert_input!) {
        insert_${this.tableName}_one(object: $object) ${this.buildSelection(fields)}
      }
    `;

    const { data: result, errors } = await executeMutation<{ [key: string]: T }>(mutation, {
      object: data,
    });

    if (errors || !result) {
      console.error(`Error creating ${this.tableName}:`, errors);
      return null;
    }

    return result[`insert_${this.tableName}_one`];
  }

  /**
   * Updates an existing record
   */
  async update(
    id: ID,
    updates: Partial<T>,
    fields: FieldSelection<T> = { id: true }
  ): Promise<T | null> {
    const mutation = `
      mutation Update${this.getTypeName()}($id: ${this.getIdType()}!, $_set: ${this.tableName}_set_input) {
        update_${this.tableName}_by_pk(pk_columns: { ${this.idField}: $id }, _set: $_set) ${this.buildSelection(fields)}
      }
    `;

    const { data: result, errors } = await executeMutation<{ [key: string]: T }>(mutation, {
      id,
      _set: updates,
    });

    if (errors || !result) {
      console.error(`Error updating ${this.tableName}:`, errors);
      return null;
    }

    return result[`update_${this.tableName}_by_pk`];
  }

  /**
   * Deletes a record
   */
  async delete(id: ID): Promise<boolean> {
    const mutation = `
      mutation Delete${this.getTypeName()}($id: ${this.getIdType()}!) {
        delete_${this.tableName}_by_pk(${this.idField}: $id) { ${this.idField} }
      }
    `;

    const { data, errors } = await executeMutation<{ [key: string]: { [key: string]: ID } | null }>(
      mutation,
      { id }
    );

    if (errors || !data) {
      console.error(`Error deleting ${this.tableName}:`, errors);
      return false;
    }

    return !!data[`delete_${this.tableName}_by_pk`];
  }

  /**
   * Counts records matching the where clause
   */
  async count(where?: WhereInput<T>): Promise<number> {
    const query = `
      query Count${this.getTypeName()}($where: ${this.tableName}_bool_exp) {
        ${this.tableName}_aggregate(where: $where) { aggregate { count } }
      }
    `;

    const { data, errors } = await executeQuery<{ [key: string]: { aggregate: { count: number } } }>(
      query,
      { where }
    );

    if (errors || !data) {
      console.error(`Error counting ${this.tableName}:`, errors);
      return 0;
    }

    return data[`${this.tableName}_aggregate`].aggregate.count;
  }

  /**
   * Builds a selection set from fields
   */
  protected buildSelection(fields: FieldSelection<any>): string {
    if (Object.keys(fields).length === 0) {
      return '{ __typename }';
    }

    const result: string[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value === true) {
        result.push(key);
      } else if (typeof value === 'object' && value !== null) {
        result.push(`${key} ${this.buildSelection(value)}`);
      }
    }

    return `{ ${result.join(' ')} }`;
  }

  /**
   * Gets the GraphQL type for the ID field
   */
  protected getIdType(): string {
    return 'uuid';
  }

  /**
   * Gets the type name for use in GraphQL operations
   */
  protected getTypeName(): string {
    return this.tableName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
