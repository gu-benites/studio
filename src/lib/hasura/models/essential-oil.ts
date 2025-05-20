import { BaseModel } from '../base-model';
import type { FieldSelection, WhereInput } from '../types';
import type { EssentialOil } from './essential-oil-related';

export type {
  EssentialOil,
  EssentialOilWithRelations,
  InternalUseStatus,
  PhototoxicityStatus,
  DilutionRecommendation,
} from './essential-oil-related';

export {
  internalUseStatusModel,
  phototoxicityStatusModel,
  dilutionRecommendationModel,
  essentialOilWithRelationsModel,
} from './essential-oil-related';

/**
 * Model for interacting with essential_oils table
 */
export class EssentialOilModel extends BaseModel<EssentialOil> {
  protected tableName = 'essential_oils';
  protected idField = 'id';

  /**
   * Finds essential oils by name (case-insensitive search)
   * @param name The name to search for
   * @param fields The fields to select
   * @returns An array of matching essential oils
   */
  async findByName(
    name: string,
    fields: FieldSelection<EssentialOil> = { id: true, name_english: true }
  ): Promise<EssentialOil[]> {
    return this.findMany(
      { name_english: { _ilike: `%${name}%` } } as WhereInput<EssentialOil>,
      fields
    );
  }

  /**
   * Finds active essential oils
   * @param fields The fields to select
   * @returns An array of active essential oils
   */
  async findActive(
    fields: FieldSelection<EssentialOil> = { id: true, name_english: true }
  ): Promise<EssentialOil[]> {
    return this.findMany(
      { is_active: { _eq: true } } as WhereInput<EssentialOil>,
      fields
    );
  }

  // Add other specific methods for essential oils here
}

// Export a singleton instance
export const essentialOilModel = new EssentialOilModel();
