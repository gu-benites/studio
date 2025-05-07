
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

// Define types for API responses based on 01_api_calls_n_responses.txt
interface PotentialCause {
  cause_name: string;
  cause_suggestion: string;
  explanation: string;
  id?: string; 
}

interface PotentialSymptom {
  symptom_name: string;
  symptom_suggestion: string;
  explanation: string;
  id?: string;
}

interface TherapeuticProperty {
  property_id: string;
  property_name: string;
  property_name_in_english: string;
  description: string;
  causes_addressed: string;
  symptoms_addressed: string;
  relevancy: number;
}

interface SuggestedOil {
  name_english: string;
  name_local_language: string;
  oil_description: string;
  relevancy: number;
}

interface SuggestedOilsForProperty {
  property_id: string;
  property_name: string; 
  property_name_in_english: string; 
  description: string; 
  suggested_oils: SuggestedOil[];
}


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

// Internal API proxy endpoint
const INTERNAL_API_PROXY_URL = '/api/aromarx';

// Generic fetch function to call the internal API proxy
async function fetchFromInternalApi<T>(payload: ApiRequestPayload): Promise<T> {
  if (!payload || Object.keys(payload).length === 0) {
    console.error("fetchFromInternalApi called with an empty or null payload. This is not allowed. Payload:", JSON.stringify(payload));
    throw new Error("Internal error: API client called with empty payload.");
  }

  let response;
  try {
    response = await fetch(INTERNAL_API_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError: any) {
    console.error("Network error during internal API request:", networkError.message, "Payload:", JSON.stringify(payload));
    throw new Error(`Network error: ${networkError.message}`);
  }

  if (!response.ok) {
    let errorMessage = `Internal API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage += `: ${errorData.message || errorData.error || JSON.stringify(errorData)}`;
    } catch (e) {
      try {
        const errorText = await response.text();
        errorMessage += `. Response body: ${errorText.substring(0, 200)}...`;
      } catch (textErr) {
        // Silent
      }
    }
    console.error("Internal API Error (non-200 OK):", errorMessage, "Payload:", JSON.stringify(payload));
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const rawText = await response.text();
    console.error("Internal API response was not JSON (Status OK). Content-Type:", contentType, "Raw text:", rawText.substring(0, 500) + "...", "Payload:", JSON.stringify(payload));
    throw new Error("Internal API returned non-JSON response. Check console.");
  }

  let data: any;
  try {
    data = await response.json();
  } catch (e: any) {
    console.error("Failed to parse internal API JSON response (Status OK). Error:", e.message, "Payload:", JSON.stringify(payload));
    throw new Error("Failed to parse internal API JSON response. Check console.");
  }

  // The external API returns data in a specific structure, often an array.
  // We expect the internal proxy to return this structure directly.
  // The client-side functions (getPotentialCauses, etc.) will extract the relevant 'content' part.
  // Primary expected structure: API returns an object like { message: { content: { ... } } }
  // Fallback for structure documented in 01_api_calls_n_responses.txt: API returns an array [ { message: { content: { ... } } } ]
  
  // Check for the array structure first as per 01_api_calls_n_responses.txt
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (firstItem && typeof firstItem === 'object' && 
        firstItem.message && typeof firstItem.message === 'object' && firstItem.message !== null &&
        Object.prototype.hasOwnProperty.call(firstItem.message, 'content')) {
      
      if (firstItem.message.content !== null && firstItem.message.content !== undefined) {
        if (typeof firstItem.message.content === 'object' && Object.keys(firstItem.message.content).length === 0) {
            console.warn("API response (from array) 'content' is an empty object. Data:", JSON.stringify(data), "Payload:", JSON.stringify(payload));
        }
        return firstItem.message.content as T; // Return the content part
      } else {
        console.error("API response (from array) 'content' field is null or undefined. Data:", JSON.stringify(data), "Payload:", JSON.stringify(payload));
        throw new Error("API response (from array) 'content' field is missing or empty. Check console.");
      }
    }
  } 
  // Check for direct object structure if not an array (alternative API response structure)
  else if (data && typeof data === 'object' && !Array.isArray(data) &&
      data.message && typeof data.message === 'object' && data.message !== null &&
      Object.prototype.hasOwnProperty.call(data.message, 'content')) {
    
    if (data.message.content !== null && data.message.content !== undefined) {
      if (typeof data.message.content === 'object' && Object.keys(data.message.content).length === 0) {
         console.warn("API response 'content' is an empty object. Returning it as is. Data:", JSON.stringify(data), "Payload:", JSON.stringify(payload));
      }
      return data.message.content as T; // Return the content part
    } else {
      console.error("API response 'content' field is null or undefined. Data:", JSON.stringify(data), "Payload:", JSON.stringify(payload));
      throw new Error("API response 'content' field is missing or empty. Check console.");
    }
  }

  console.error("Unexpected API response JSON structure from internal proxy (Status OK). Actual data:", JSON.stringify(data), "Payload:", JSON.stringify(payload));
  throw new Error("Unexpected API response JSON structure from internal proxy. Check console for actual data received.");
}

// Type for the expected content structure for getPotentialCauses
type PotentialCausesContent = { potential_causes: PotentialCause[] };

export const getPotentialCauses = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific'>
): Promise<PotentialCause[]> => {
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
  
  const result = await fetchFromInternalApi<PotentialCausesContent>(payload);

  if (result && result.potential_causes && Array.isArray(result.potential_causes)) {
    return result.potential_causes;
  }
  console.warn("Potential causes key missing, not an array, or result was empty in API response content for getPotentialCauses. Payload:", JSON.stringify(payload), "Received content:", JSON.stringify(result));
  return [];
};

// Type for the expected content structure for getPotentialSymptoms
type PotentialSymptomsContent = { potential_symptoms: PotentialSymptom[] };

export const getPotentialSymptoms = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses'>
): Promise<PotentialSymptom[]> => {
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

  const result = await fetchFromInternalApi<PotentialSymptomsContent>(payload);
  if (result && result.potential_symptoms && Array.isArray(result.potential_symptoms)) {
      return result.potential_symptoms;
  }
  console.warn("Potential symptoms key missing, not an array, or result was empty in API response content for getPotentialSymptoms. Payload:", JSON.stringify(payload), "Received content:", JSON.stringify(result));
  return [];
};

// Type for the expected content structure for getMedicalProperties
type MedicalPropertiesContent = NonNullable<RecipeFormData['medicalPropertiesResult']>;

export const getMedicalProperties = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses' | 'selectedSymptoms'>
): Promise<MedicalPropertiesContent> => {
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
  
  const result = await fetchFromInternalApi<MedicalPropertiesContent>(payload);
  if (result && result.health_concern_in_english !== undefined && Array.isArray(result.therapeutic_properties)) {
      return result;
  }
  console.warn("Medical properties structure incorrect or result was empty in API response content for getMedicalProperties. Payload:", JSON.stringify(payload), "Received content:", JSON.stringify(result));
  return { health_concern_in_english: data.healthConcern, therapeutic_properties: [] };
};

// Type for the expected content structure for getSuggestedOils
type SuggestedOilsContent = SuggestedOilsForProperty;

export const getSuggestedOils = async (
  data: Pick<RecipeFormData, 'healthConcern' | 'gender' | 'ageCategory' | 'ageSpecific' | 'selectedCauses' | 'selectedSymptoms'>,
  therapeuticProperty: TherapeuticProperty 
): Promise<SuggestedOilsContent> => {
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

  const result = await fetchFromInternalApi<SuggestedOilsContent>(payload);
  if (result && result.property_id && Array.isArray(result.suggested_oils)) {
      return result;
  }
  console.warn("Suggested oils structure incorrect or result was empty in API response content for getSuggestedOils. Payload:", JSON.stringify(payload), "Received content:", JSON.stringify(result));
  return { 
      property_id: therapeuticProperty.property_id, 
      property_name: therapeuticProperty.property_name,
      property_name_in_english: therapeuticProperty.property_name_in_english,
      description: therapeuticProperty.description,
      suggested_oils: [] 
    };
};
