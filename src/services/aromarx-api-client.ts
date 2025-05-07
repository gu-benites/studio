
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

const BASE_URL = process.env.AROMARX_BASE_URL;
const API_KEY = process.env.AROMARX_API_KEY;

interface ApiRequestPayload {
  health_concern?: string | null;
  gender?: string | null;
  age_category?: string | null;
  age_specific?: string | null;
  selected_causes?: RecipeFormData['selectedCauses'];
  selected_symptoms?: RecipeFormData['selectedSymptoms'];
  therapeutic_properties?: RecipeFormData['selectedTherapeuticProperties']; // For SuggestedOils step
  step: "PotentialCauses" | "PotentialSymptoms" | "MedicalProperties" | "SuggestedOils"; // Add more steps as needed
  user_language: string; // e.g., "PT_BR"
}

// Generic fetch function
async function fetchFromAromaRx<T>(payload: ApiRequestPayload): Promise<T> {
  if (!BASE_URL || !API_KEY) {
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
    // Try to parse error from API if available
    let errorMessage = `API request failed with status ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage += `: ${errorData.message || JSON.stringify(errorData)}`;
    } catch (e) {
        // Could not parse JSON, use default error message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // The API wraps the actual content in an array, under message.content
  // For example, PotentialCauses response is `[ { message: { content: { potential_causes: [...] } } } ]`
  if (Array.isArray(data) && data.length > 0 && data[0].message && data[0].message.content) {
    return data[0].message.content as T;
  }
  // For SuggestedOils, the response structure is slightly different
  // It's `[ { message: { content: { property_id: ..., suggested_oils: [...] } } } ]`
  // The above check should still return the content object.

  throw new Error("Unexpected API response structure");
}

// Specific API call functions
export const getPotentialCauses = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific'>
) => {
  const payload: ApiRequestPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    step: "PotentialCauses",
    user_language: "PT_BR", // Make this configurable if needed
  };
  // Type expected from API for this step's content
  type PotentialCausesResponse = { potential_causes: RecipeFormData['potentialCausesResult'] };
  const result = await fetchFromAromaRx<PotentialCausesResponse>(payload);
  return result.potential_causes; // Extract the array
};


export const getPotentialSymptoms = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses'>
) => {
  const payload: ApiRequestPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    selected_causes: data.selectedCauses,
    step: "PotentialSymptoms",
    user_language: "PT_BR",
  };
  type PotentialSymptomsResponse = { potential_symptoms: RecipeFormData['potentialSymptomsResult'] };
  const result = await fetchFromAromaRx<PotentialSymptomsResponse>(payload);
  return result.potential_symptoms;
};

export const getMedicalProperties = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses' | 'selectedSymptoms'>
) => {
  const payload: ApiRequestPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    selected_causes: data.selectedCauses,
    selected_symptoms: data.selectedSymptoms, // API expects array of { symptom_name: "..." }
    step: "MedicalProperties",
    user_language: "PT_BR",
  };
  // The response for MedicalProperties is directly the object we defined in RecipeFormData
  return fetchFromAromaRx<NonNullable<RecipeFormData['medicalPropertiesResult']>>(payload);
};

export const getSuggestedOils = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses' | 'selectedSymptoms'>,
  therapeuticProperty: NonNullable<RecipeFormData['selectedTherapeuticProperties']>[0] // Single property object
) => {
  const payload: ApiRequestPayload = {
    health_concern: data.healthConcern,
    gender: data.gender,
    age_category: data.ageCategory,
    age_specific: data.ageSpecific,
    selected_causes: data.selectedCauses,
    selected_symptoms: data.selectedSymptoms,
    therapeutic_properties: [therapeuticProperty], // API expects an array of one property
    step: "SuggestedOils",
    user_language: "PT_BR",
  };
  // Response is an object with property_id, property_name, etc., and suggested_oils array
  type SuggestedOilsResponse = NonNullable<RecipeFormData['suggestedOilsByProperty']>[string];
  return fetchFromAromaRx<SuggestedOilsResponse>(payload);
};

// Add other API call functions (e.g., CreateRecipe) as needed
