
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

// Use NEXT_PUBLIC_ prefixed environment variables for client-side access
const BASE_URL = process.env.NEXT_PUBLIC_AROMARX_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_AROMARX_API_KEY;

// Explicitly type the parts of the payload that vary by step
interface PotentialCausesPayload {
  health_concern: string;
  gender: string;
  age_category: string;
  age_specific: string;
  step: "PotentialCauses";
  user_language: string;
}

interface PotentialSymptomsPayload {
  health_concern: string;
  gender: string;
  age_category: string;
  age_specific: string;
  selected_causes: NonNullable<RecipeFormData['selectedCauses']>; // Ensure it's the full PotentialCause object
  step: "PotentialSymptoms";
  user_language: string;
}

interface MedicalPropertiesPayload {
  health_concern: string;
  gender: string;
  age_category: string;
  age_specific: string;
  selected_causes: NonNullable<RecipeFormData['selectedCauses']>;
  selected_symptoms: NonNullable<RecipeFormData['selectedSymptoms']>; // Array of { symptom_name: string }
  step: "MedicalProperties";
  user_language: string;
}

interface SuggestedOilsPayload {
  health_concern: string;
  gender: string;
  age_category: string;
  age_specific: string;
  selected_causes: NonNullable<RecipeFormData['selectedCauses']>;
  selected_symptoms: NonNullable<RecipeFormData['selectedSymptoms']>;
  therapeutic_properties: [NonNullable<RecipeFormData['selectedTherapeuticProperties']>[0]]; // API expects an array of one property
  step: "SuggestedOils";
  user_language: string;
}

type ApiRequestPayload = 
  | PotentialCausesPayload 
  | PotentialSymptomsPayload 
  | MedicalPropertiesPayload 
  | SuggestedOilsPayload;

// Generic fetch function
async function fetchFromAromaRx<T>(payload: ApiRequestPayload): Promise<T> {
  if (!BASE_URL || !API_KEY) {
    console.error("API base URL or API key is not configured. Check .env.local and ensure variables are prefixed with NEXT_PUBLIC_");
    throw new Error("API base URL or API key is not configured.");
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'apikey': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage += `: ${errorData.message || JSON.stringify(errorData)}`;
    } catch (e) {
        // Could not parse JSON, use default error message
    }
    console.error("API Error:", errorMessage, "Payload:", payload);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (Array.isArray(data) && data.length > 0 && data[0].message && data[0].message.content) {
    return data[0].message.content as T;
  }
  
  console.error("Unexpected API response structure:", data, "Payload:", payload);
  throw new Error("Unexpected API response structure");
}

// Specific API call functions
export const getPotentialCauses = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific'>
) => {
  if (!data.healthConcern || !data.gender || !data.ageCategory || !data.ageSpecific) {
    throw new Error("Missing required data for getPotentialCauses");
  }
  const payload: PotentialCausesPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    step: "PotentialCauses",
    user_language: "PT_BR",
  };
  type PotentialCausesResponse = { potential_causes: NonNullable<RecipeFormData['potentialCausesResult']> };
  const result = await fetchFromAromaRx<PotentialCausesResponse>(payload);
  return result.potential_causes; 
};


export const getPotentialSymptoms = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses'>
) => {
   if (!data.healthConcern || !data.gender || !data.ageCategory || !data.ageSpecific || !data.selectedCauses) {
    throw new Error("Missing required data for getPotentialSymptoms");
  }
  const payload: PotentialSymptomsPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    selected_causes: data.selectedCauses,
    step: "PotentialSymptoms",
    user_language: "PT_BR",
  };
  type PotentialSymptomsResponse = { potential_symptoms: NonNullable<RecipeFormData['potentialSymptomsResult']> };
  const result = await fetchFromAromaRx<PotentialSymptomsResponse>(payload);
  return result.potential_symptoms;
};

export const getMedicalProperties = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses' | 'selectedSymptoms'>
) => {
  if (!data.healthConcern || !data.gender || !data.ageCategory || !data.ageSpecific || !data.selectedCauses || !data.selectedSymptoms) {
    throw new Error("Missing required data for getMedicalProperties");
  }
  const payload: MedicalPropertiesPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    selected_causes: data.selectedCauses,
    selected_symptoms: data.selectedSymptoms, 
    step: "MedicalProperties",
    user_language: "PT_BR",
  };
  return fetchFromAromaRx<NonNullable<RecipeFormData['medicalPropertiesResult']>>(payload);
};

export const getSuggestedOils = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses' | 'selectedSymptoms'>,
  therapeuticProperty: NonNullable<RecipeFormData['selectedTherapeuticProperties']>[0] 
) => {
   if (!data.healthConcern || !data.gender || !data.ageCategory || !data.ageSpecific || !data.selectedCauses || !data.selectedSymptoms || !therapeuticProperty) {
    throw new Error("Missing required data for getSuggestedOils");
  }
  const payload: SuggestedOilsPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    selected_causes: data.selectedCauses,
    selected_symptoms: data.selectedSymptoms,
    therapeutic_properties: [therapeuticProperty], 
    step: "SuggestedOils",
    user_language: "PT_BR",
  };
  type SuggestedOilsResponse = NonNullable<RecipeFormData['suggestedOilsByProperty']>[string];
  return fetchFromAromaRx<SuggestedOilsResponse>(payload);
};
