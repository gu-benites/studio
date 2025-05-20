import { Tables } from '../../types/database.types';

/**
 * Essential Oil domain model
 * Extends the base database type with domain-specific methods and properties
 */
export interface EssentialOil extends Tables<'essential_oils'> {
  // Add any additional domain-specific properties or methods here
  fullName?: string;
}

/**
 * DTO for creating a new essential oil
 */
export interface CreateEssentialOilDto {
  name_english: string;
  name_scientific: string;
  name_portuguese: string;
  general_description: string;
  internal_use_status_id: string;
  dilution_recommendation_id: string;
  phototoxicity_status_id: string;
  image_url?: string | null;
}

/**
 * DTO for updating an existing essential oil
 */
export interface UpdateEssentialOilDto {
  name_english?: string;
  name_scientific?: string;
  name_portuguese?: string;
  general_description?: string;
  internal_use_status_id?: string;
  dilution_recommendation_id?: string;
  phototoxicity_status_id?: string;
  image_url?: string | null;
  updated_at?: string;
}

/**
 * Query options for filtering and pagination
 */
export interface EssentialOilQueryOptions {
  searchTerm?: string;
  limit?: number;
  offset?: number;
  orderBy?: {
    column: keyof EssentialOil;
    ascending: boolean;
  };
}
