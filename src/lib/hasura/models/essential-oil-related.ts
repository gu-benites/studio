import { BaseModel } from '../base-model';
import type { FieldSelection, WhereInput } from '../types';

// Define EssentialOil type here to avoid circular dependencies
export type EssentialOil = {
  id: string;
  name_english: string;
  name_scientific: string | null;
  name_portuguese: string | null;
  general_description: string | null;
  embedding: any; // Vector embedding type from PostgreSQL
  created_at: string;
  updated_at: string;
  bubble_uid: string | null;
  names_concatenated: string | null;
  image_url: string | null;
  internal_use_status_id: string | null;
  dilution_recommendation_id: string | null;
  phototoxicity_status_id: string | null;
};

// ======================
// Related Types
// ======================

export type InternalUseStatus = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type PhototoxicityStatus = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type DilutionRecommendation = {
  id: string;
  name: string;
  description: string;
  percentage: number;
  created_at: string;
  updated_at: string;
};

// Extended EssentialOil type with relationships
export type EssentialOilWithRelations = Omit<EssentialOil, 
  'internal_use_status_id' | 'phototoxicity_status_id' | 'dilution_recommendation_id'
> & {
  internal_use_status?: InternalUseStatus | null;
  phototoxicity_status?: PhototoxicityStatus | null;
  dilution_recommendation?: DilutionRecommendation | null;
};

// ======================
// Related Models
// ======================

export class InternalUseStatusModel extends BaseModel<InternalUseStatus> {
  protected tableName = 'eo_internal_use_statuses';
  protected idField = 'id';
}

export class PhototoxicityStatusModel extends BaseModel<PhototoxicityStatus> {
  protected tableName = 'eo_phototoxicity_statuses';
  protected idField = 'id';
}

export class DilutionRecommendationModel extends BaseModel<DilutionRecommendation> {
  protected tableName = 'eo_dilution_recommendations';
  protected idField = 'id';
}

// Extended EssentialOil model with relationship methods
export class EssentialOilWithRelationsModel extends BaseModel<EssentialOil> {
  protected tableName = 'essential_oils';
  protected idField = 'id';

  private internalUseStatusModel = new InternalUseStatusModel();
  private phototoxicityStatusModel = new PhototoxicityStatusModel();
  private dilutionRecommendationModel = new DilutionRecommendationModel();

  /**
   * Get an essential oil with all its related data
   */
  async findByIdWithRelations(
    id: string,
    fields: FieldSelection<EssentialOilWithRelations> = {
      id: true,
      name_english: true,
      name_scientific: true,
      general_description: true,
      image_url: true,
      internal_use_status: {
        id: true,
        name: true,
        description: true,
      },
      phototoxicity_status: {
        id: true,
        name: true,
        description: true,
      },
      dilution_recommendation: {
        id: true,
        name: true,
        description: true,
        percentage: true,
      },
    }
  ): Promise<EssentialOilWithRelations | null> {
    // First get the base oil data
    const oil = await this.findById(id, {
      id: true,
      name_english: true,
      name_scientific: true,
      general_description: true,
      image_url: true,
      internal_use_status_id: true,
      phototoxicity_status_id: true,
      dilution_recommendation_id: true,
    });

    if (!oil) return null;

    // Fetch all related data in parallel
    const [internalUseStatus, phototoxicityStatus, dilutionRecommendation] = await Promise.all([
      oil.internal_use_status_id
        ? this.internalUseStatusModel.findById(oil.internal_use_status_id, 
            (fields as any)?.internal_use_status || { id: true, name: true }
          )
        : null,
      oil.phototoxicity_status_id
        ? this.phototoxicityStatusModel.findById(oil.phototoxicity_status_id, 
            (fields as any)?.phototoxicity_status || { id: true, name: true }
          )
        : null,
      oil.dilution_recommendation_id
        ? this.dilutionRecommendationModel.findById(oil.dilution_recommendation_id, 
            (fields as any)?.dilution_recommendation || { id: true, name: true, percentage: true }
          )
        : null,
    ]);

    // Combine all data
    return {
      ...oil,
      internal_use_status: internalUseStatus,
      phototoxicity_status: phototoxicityStatus,
      dilution_recommendation: dilutionRecommendation,
    } as EssentialOilWithRelations;
  }

  /**
   * Get essential oils with their related data
   */
  async findManyWithRelations(
    where?: WhereInput<EssentialOil>,
    fields: FieldSelection<EssentialOilWithRelations> = {
      id: true,
      name_english: true,
      name_scientific: true,
      image_url: true,
      internal_use_status: { id: true, name: true },
      phototoxicity_status: { id: true, name: true },
    },
    orderBy?: any,
    pagination?: { limit?: number; offset?: number }
  ): Promise<EssentialOilWithRelations[]> {
    // First get the base oils
    const oils = await this.findMany(where, {
      id: true,
      name_english: true,
      name_scientific: true,
      image_url: true,
      internal_use_status_id: true,
      phototoxicity_status_id: true,
      dilution_recommendation_id: true,
    }, orderBy, pagination);

    if (oils.length === 0) return [];

    // Get all unique IDs for batch loading
    const internalUseStatusIds = [...new Set(oils.map(o => o.internal_use_status_id).filter(Boolean))] as string[];
    const phototoxicityStatusIds = [...new Set(oils.map(o => o.phototoxicity_status_id).filter(Boolean))] as string[];
    const dilutionRecommendationIds = [...new Set(oils.map(o => o.dilution_recommendation_id).filter(Boolean))] as string[];

    // Fetch all related data in parallel
    const [internalUseStatuses, phototoxicityStatuses, dilutionRecommendations] = await Promise.all([
      internalUseStatusIds.length > 0
        ? this.internalUseStatusModel.findMany(
            { id: { _in: internalUseStatusIds } } as WhereInput<InternalUseStatus>,
            (fields as any)?.internal_use_status || { id: true, name: true }
          )
        : [],
      phototoxicityStatusIds.length > 0
        ? this.phototoxicityStatusModel.findMany(
            { id: { _in: phototoxicityStatusIds } } as WhereInput<PhototoxicityStatus>,
            (fields as any)?.phototoxicity_status || { id: true, name: true }
          )
        : [],
      dilutionRecommendationIds.length > 0
        ? this.dilutionRecommendationModel.findMany(
            { id: { _in: dilutionRecommendationIds } } as WhereInput<DilutionRecommendation>,
            (fields as any)?.dilution_recommendation || { id: true, name: true, percentage: true }
          )
        : [],
    ]);

    // Create lookup maps
    const internalUseStatusMap = new Map(internalUseStatuses.map(s => [s.id, s]));
    const phototoxicityStatusMap = new Map(phototoxicityStatuses.map(s => [s.id, s]));
    const dilutionRecommendationMap = new Map(dilutionRecommendations.map(d => [d.id, d]));

    // Combine all data
    return oils.map(oil => ({
      ...oil,
      internal_use_status: oil.internal_use_status_id ? internalUseStatusMap.get(oil.internal_use_status_id) : null,
      phototoxicity_status: oil.phototoxicity_status_id ? phototoxicityStatusMap.get(oil.phototoxicity_status_id) : null,
      dilution_recommendation: oil.dilution_recommendation_id 
        ? dilutionRecommendationMap.get(oil.dilution_recommendation_id) 
        : null,
    }));
  }
}

// Export singleton instances
export const internalUseStatusModel = new InternalUseStatusModel();
export const phototoxicityStatusModel = new PhototoxicityStatusModel();
export const dilutionRecommendationModel = new DilutionRecommendationModel();
export const essentialOilWithRelationsModel = new EssentialOilWithRelationsModel();
