
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

// Use NEXT_PUBLIC_ prefixed environment variables for client-side access
const BASE_URL = process.env.NEXT_PUBLIC_AROMARX_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_AROMARX_API_KEY;

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

// Generic fetch function
async function fetchFromAromaRx<T>(payload: ApiRequestPayload): Promise<T | null> {
  if (!BASE_URL || !API_KEY) {
    console.error("API base URL or API key is not configured. Check .env.local and ensure variables are prefixed with NEXT_PUBLIC_");
    throw new Error("API base URL or API key is not configured.");
  }

  let response;
  try {
    response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError: any) {
    console.error("Network error during API request:", networkError.message, "Payload:", payload);
    throw new Error(`Network error: ${networkError.message}`);
  }

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      // Attempt to parse error response as JSON
      const errorData = await response.json();
      errorMessage += `: ${errorData.message || JSON.stringify(errorData)}`;
    } catch (e) {
      // If not JSON, try to get text
      try {
        const errorText = await response.text();
        errorMessage += `. Response body: ${errorText.substring(0, 200)}...`; // Log a snippet
      } catch (textErr) {
        // If text also fails, just use the status
      }
    }
    console.error("API Error (non-200 OK):", errorMessage, "Payload:", payload);
    throw new Error(errorMessage);
  }

  // Response is OK (2xx status)
  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (e: any) {
      console.error("Failed to parse API JSON response (Status OK). Error:", e.message, "Payload:", payload);
      // Attempt to get raw text for debugging if JSON parsing fails on a 200 OK
      const rawTextForDebugging = await response.text(); // This re-consumes body, so do it only on error
      console.error("Raw text of unparseable 200 OK JSON response:", rawTextForDebugging.substring(0, 500) + "...");
      throw new Error("Failed to parse API JSON response despite Content-Type header. Check console.");
    }
  } else {
    // Response is OK, but not JSON. This is unexpected for this API.
    const rawText = await response.text();
    console.error("API response was not JSON (Status OK). Content-Type:", contentType, "Raw text:", rawText.substring(0, 500) + "...", "Payload:", payload);
    throw new Error("API returned non-JSON response. Check console.");
  }
  
  // At this point, 'data' should be the parsed JSON from a 2xx response
  if (Array.isArray(data)) {
    if (data.length === 0) {
      // API returned an empty array. This often means "no results" rather than an error.
      console.warn("API returned an empty array (interpreted as no results found) for payload:", payload);
      return null; 
    }
    // If data is an array, we expect a specific structure like [ { message: { content: { ... } } } ]
    if (data.length > 0 && data[0] && typeof data[0] === 'object' && 
        data[0].message && typeof data[0].message === 'object' && 
        Object.prototype.hasOwnProperty.call(data[0].message, 'content')) {
      // The structure data[0].message.content exists.
      // The value of data[0].message.content is what we expect to be of type T.
      return data[0].message.content as T;
    }
  }
  
  // If data is not an array with the expected structure, or not an array at all.
  console.error("Unexpected API response JSON structure (Status OK). Actual data:", data, "Payload:", payload);
  throw new Error("Unexpected API response JSON structure. Check console for actual data received.");
}

// Specific API call functions

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
  
  const result = await fetchFromAromaRx<PotentialCausesContent>(payload);

  if (result === null) { // API returned empty array `[]`
    return []; 
  }
  if (result && Array.isArray(result.potential_causes)) {
    return result.potential_causes;
  }
  console.warn("Potential causes key missing or not an array in API response content for getPotentialCauses. Payload:", payload, "Received content:", result);
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

  const result = await fetchFromAromaRx<PotentialSymptomsContent>(payload);
  if (result === null) {
      return [];
  }
  if (result && Array.isArray(result.potential_symptoms)) {
      return result.potential_symptoms;
  }
  console.warn("Potential symptoms key missing or not an array in API response content for getPotentialSymptoms. Payload:", payload, "Received content:", result);
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
  
  const result = await fetchFromAromaRx<MedicalPropertiesContent>(payload);
  if (result === null) {
      return { health_concern_in_english: data.healthConcern, therapeutic_properties: [] }; // Default empty structure
  }
  if (result && result.health_concern_in_english !== undefined && Array.isArray(result.therapeutic_properties)) {
      return result;
  }
  console.warn("Medical properties structure incorrect in API response content for getMedicalProperties. Payload:", payload, "Received content:", result);
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

  const result = await fetchFromAromaRx<SuggestedOilsContent>(payload);
  if (result === null) {
      return { 
          property_id: therapeuticProperty.property_id, 
          property_name: therapeuticProperty.property_name,
          property_name_in_english: therapeuticProperty.property_name_in_english,
          description: therapeuticProperty.description,
          suggested_oils: [] 
        };
  }
  if (result && result.property_id && Array.isArray(result.suggested_oils)) {
      return result;
  }
  console.warn("Suggested oils structure incorrect in API response content for getSuggestedOils. Payload:", payload, "Received content:", result);
  return { 
      property_id: therapeuticProperty.property_id, 
      property_name: therapeuticProperty.property_name,
      property_name_in_english: therapeuticProperty.property_name_in_english,
      description: therapeuticProperty.description,
      suggested_oils: [] 
    };
};
