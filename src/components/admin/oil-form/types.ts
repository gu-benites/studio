import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export interface BasicInfoFields {
  name_english: string;
  name_scientific: string;
  name_portuguese: string;
  general_description: string;
  image_url: string;
}

export interface FormData {
  basic_info: BasicInfoFields;
  internal_use_status_id: string;
  dilution_recommendation_id: string;
  phototoxicity_status_id: string;
  therapeutic_properties: string;
  chemical_composition: string;
  safety_precautions: string;
  extraction_method: string;
  plant_part: string;
  origin: string;
  cultivation: string;
  aroma_profile: string;
  scent_characteristics: string;
  blending_notes: string;
  usage_instructions: string;
  storage_instructions: string;
  shelf_life: string;
  safety_notes_pets: Record<string, string>;
  safety_notes_age_ranges: Record<string, string>;
  safety_notes_pregnancy: Record<string, string>;
  application_methods: string[];
  safety_pet_animal_names: string[];
  safety_child_age_ranges: string[];
}

export type SetFormData = (field: keyof FormData, value: any) => void;

export type SupabaseClientType = SupabaseClient<Database, 'public'>;

export interface DatabaseItem {
  id: string;
  name: string;
  [key: string]: any; // Allow additional properties
}

export type OptionType = {
  value: string;
  label: string;
};
