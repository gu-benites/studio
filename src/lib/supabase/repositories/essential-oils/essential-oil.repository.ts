import { supabase } from '../../client';
import { BaseRepository } from '../base/base.repository';
import { 
  EssentialOil, 
  CreateEssentialOilDto, 
  UpdateEssentialOilDto, 
  EssentialOilQueryOptions 
} from '../../models/essential-oils/essential-oil.model';

/**
 * Repository for essential oils
 * Extends the base repository with essential oil specific methods
 */
export class EssentialOilRepository extends BaseRepository<'essential_oils'> {
  constructor() {
    super('essential_oils');
  }

  /**
   * Find essential oils with advanced querying options
   */
  async findWithOptions(options: EssentialOilQueryOptions = {}): Promise<EssentialOil[]> {
    let query = supabase
      .from(this.tableName)
      .select('*');

    // Apply search term if provided
    if (options.searchTerm) {
      query = query.or(
        `name_english.ilike.%${options.searchTerm}%,name_scientific.ilike.%${options.searchTerm}%,name_portuguese.ilike.%${options.searchTerm}%`
      );
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column as string, {
        ascending: options.orderBy.ascending,
      });
    }

    // Apply pagination
    if (options.limit !== undefined) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding essential oils with options:', error);
      return [];
    }

    return data as EssentialOil[];
  }

  /**
   * Search essential oils by name (supports partial matching)
   */
  async searchByName(searchTerm: string, limit = 10): Promise<EssentialOil[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`name_english.ilike.%${searchTerm}%,name_scientific.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching essential oils by name:', error);
      return [];
    }

    return data as EssentialOil[];
  }

  /**
   * Find essential oils by therapeutic property
   */
  async findByTherapeuticProperty(propertyId: string): Promise<EssentialOil[]> {
    const { data, error } = await supabase
      .from('essential_oil_therapeutic_properties')
      .select('essential_oils(*)')
      .eq('therapeutic_property_id', propertyId);

    if (error) {
      console.error('Error finding essential oils by therapeutic property:', error);
      return [];
    }

    return data.map(item => item.essential_oils) as EssentialOil[];
  }

  // Override base methods with proper typing
  async create(data: CreateEssentialOilDto): Promise<EssentialOil> {
    return super.create(data);
  }

  async update(id: string, data: UpdateEssentialOilDto): Promise<EssentialOil | null> {
    return super.update(id, { ...data, updated_at: new Date().toISOString() });
  }
}

// Export a singleton instance
export const essentialOilRepository = new EssentialOilRepository();
