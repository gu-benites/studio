export interface Option {
  value: string;
  label: string;
}

export interface SafetyNotes {
  [key: string]: string;
}

export interface FormData {
  name_english: string;
  name_scientific: string;
  name_portuguese: string;
  general_description: string;
  image_url: string | null;
  internal_use_status_id: string | null;
  dilution_recommendation_id: string | null;
  phototoxicity_status_id: string | null;
  application_methods: string[];
  safety_pet_animal_names: string[];
  safety_child_age_ranges: string[];
  safety_pregnancy_nursing: string[];
  safety_notes_pets: Record<string, string>;
  safety_notes_age_ranges: Record<string, string>;
  safety_notes_pregnancy: Record<string, string>;
  therapeutic_properties: string[];
  extraction_methods: string[];
  origin_countries: string[];
  aroma_profile: string;
  detailed_instructions: string;
}

export interface UsageAndSafetySectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  supabase: any;
}
