
// Basic form data types
export type HealthConcern = string;

export type Gender = 'male' | 'female' | 'other';

export type AgeCategory = 'child' | 'teen' | 'adult' | 'senior';

export interface FormData {
  health_concern: HealthConcern;
  gender: Gender;
  age_category: AgeCategory;
  age_specific: string;
  selected_causes: Cause[];
  selected_symptoms: Symptom[];
  therapeutic_properties: TherapeuticProperty[];
  suggested_oils: SuggestedOil[];
}

// API related types
export interface Cause {
  cause_name: string;
  cause_suggestion: string;
  explanation: string;
}

export interface Symptom {
  symptom_name: string;
  symptom_suggestion?: string;
  explanation?: string;
}

export interface TherapeuticProperty {
  property_id: string;
  property_name: string;
  property_name_in_english: string;
  description: string;
  causes_addressed: string;
  symptoms_addressed: string;
  relevancy: number;
}

export interface SuggestedOil {
  name_english: string;
  name_local_language: string;
  oil_description: string;
  relevancy: number;
}

export interface PropertyOil {
  property_id: string;
  oils: SuggestedOil[];
}

export interface ApiError {
  message: string;
  code?: string;
}

// Form step type
export type FormStep = 
  | 'health-concern'
  | 'demographics'
  | 'causes'
  | 'symptoms'
  | 'review'
  | 'properties'
  | 'oils';

// API response types
export interface PotentialCausesResponse {
  potential_causes: Cause[];
}

export interface PotentialSymptomsResponse {
  potential_symptoms: Symptom[];
}

export interface MedicalPropertiesResponse {
  health_concern_in_english: string;
  therapeutic_properties: TherapeuticProperty[];
}

export interface SuggestedOilsResponse {
  property_id: string;
  property_name: string;
  property_name_in_english: string;
  description: string;
  suggested_oils: SuggestedOil[];
}

export interface ApiResponse<T> {
  index: number;
  message: {
    role: string;
    content: T;
    refusal: null;
    annotations: any[];
  };
  logprobs: null;
  finish_reason: string;
}
