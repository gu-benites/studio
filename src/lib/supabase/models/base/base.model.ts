import { Tables, InsertDto, UpdateDto } from '../../types/database.types';

/**
 * Base model interface that all domain models should implement
 */
export interface IBaseModel<T extends keyof Database['public']['Tables']> {
  // Find a single record by ID
  findById(id: string): Promise<Tables<T> | null>;
  
  // Find all records with optional query
  findAll(query?: any): Promise<Tables<T>[]>;
  
  // Create a new record
  create(data: InsertDto<T>): Promise<Tables<T>>;
  
  // Update an existing record
  update(id: string, data: UpdateDto<T>): Promise<Tables<T> | null>;
  
  // Delete a record
  delete(id: string): Promise<boolean>;
  
  // Count records with optional query
  count(query?: any): Promise<number>;
}

/**
 * Base repository class that implements common CRUD operations
 */
export abstract class BaseRepository<T extends keyof Database['public']['Tables']> 
  implements IBaseModel<T> {
  
  constructor(protected tableName: T) {}
  
  // Implement the interface methods here
  // (Implementation will be in the BaseRepository class)
  abstract findById(id: string): Promise<Tables<T> | null>;
  abstract findAll(query?: any): Promise<Tables<T>[]>;
  abstract create(data: InsertDto<T>): Promise<Tables<T>>;
  abstract update(id: string, data: UpdateDto<T>): Promise<Tables<T> | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(query?: any): Promise<number>;
}
