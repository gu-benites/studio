import { supabase } from '../../client';
import { Tables, InsertDto, UpdateDto } from '../../types/database.types';
import { IBaseModel } from '../../models/base/base.model';

/**
 * Base repository implementation with common CRUD operations
 * Extend this class to create repositories for specific tables
 */
export abstract class BaseRepository<T extends keyof Database['public']['Tables']> 
  implements IBaseModel<T> {
  
  constructor(protected tableName: T) {}

  async findById(id: string): Promise<Tables<T> | null> {
    const { data, error } = await supabase
      .from(this.tableName as string)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error finding ${String(this.tableName)}:`, error);
      return null;
    }

    return data as Tables<T>;
  }

  async findAll(query: any = {}): Promise<Tables<T>[]> {
    let queryBuilder = supabase
      .from(this.tableName as string)
      .select('*');

    // Apply filters if provided
    if (query.where) {
      Object.entries(query.where).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    // Apply ordering if provided
    if (query.orderBy) {
      queryBuilder = queryBuilder.order(query.orderBy.column, {
        ascending: query.orderBy.ascending !== false,
      });
    }

    // Apply pagination if provided
    if (query.limit) {
      queryBuilder = queryBuilder.range(
        query.offset || 0,
        (query.offset || 0) + query.limit - 1
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error(`Error finding all ${String(this.tableName)}:`, error);
      return [];
    }

    return data as Tables<T>[];
  }

  async create(data: InsertDto<T>): Promise<Tables<T>> {
    const { data: created, error } = await supabase
      .from(this.tableName as string)
      .insert(data as any)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${String(this.tableName)}:`, error);
      throw error;
    }

    return created as Tables<T>;
  }

  async update(id: string, data: UpdateDto<T>): Promise<Tables<T> | null> {
    const { data: updated, error } = await supabase
      .from(this.tableName as string)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${String(this.tableName)}:`, error);
      return null;
    }

    return updated as Tables<T>;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName as string)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${String(this.tableName)}:`, error);
      return false;
    }

    return true;
  }

  async count(query: any = {}): Promise<number> {
    let queryBuilder = supabase
      .from(this.tableName as string)
      .select('*', { count: 'exact', head: true });

    // Apply filters if provided
    if (query.where) {
      Object.entries(query.where).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    const { count, error } = await queryBuilder;

    if (error) {
      console.error(`Error counting ${String(this.tableName)}:`, error);
      return 0;
    }

    return count || 0;
  }
}
