import { 
  FormData, 
  ApiResponse, 
  PotentialCausesResponse, 
  PotentialSymptomsResponse,
  MedicalPropertiesResponse,
  SuggestedOilsResponse,
  ApiError,
  Cause,
  Symptom,
  SuggestedOil,
  TherapeuticProperty
} from '@/types';

const API_URL = 'https://webhook.daianefreitas.com/webhook/10p_build_recipe_protocols';

// Helper function to handle API responses
const handleResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      message: errorData.message || 'An error occurred while fetching data',
      code: response.status.toString()
    } as ApiError;
  }
  
  return await response.json();
};

// Get potential causes based on health concern and demographics
export const getPotentialCauses = async (formData: Partial<FormData>): Promise<Cause[]> => {
  try {
    const payload = {
      health_concern: formData.health_concern,
      gender: formData.gender,
      age_category: formData.age_category,
      age_specific: formData.age_specific,
      step: "PotentialCauses",
      user_language: "PT_BR"
    };

    console.log("Sending payload for potential causes:", payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await handleResponse<any>(response);
    console.log("Raw API response for causes:", responseData);
    
    // Check if responseData is an array and has the expected structure
    if (Array.isArray(responseData) && 
        responseData.length > 0 && 
        responseData[0]?.message?.content?.potential_causes) {
      return responseData[0].message.content.potential_causes;
    } else if (responseData?.message?.content?.potential_causes) {
      // Handle non-array response format
      return responseData.message.content.potential_causes;
    } else {
      console.error("Unexpected response format:", responseData);
      throw new Error("Unexpected response format from API");
    }
  } catch (error) {
    console.error('Error fetching potential causes:', error);
    throw error;
  }
};

// Get potential symptoms based on health concern, demographics, and selected causes
export const getPotentialSymptoms = async (formData: Partial<FormData>): Promise<Symptom[]> => {
  try {
    const payload = {
      health_concern: formData.health_concern,
      gender: formData.gender,
      age_category: formData.age_category,
      age_specific: formData.age_specific,
      selected_causes: formData.selected_causes,
      step: "PotentialSymptoms",
      user_language: "PT_BR"
    };

    console.log("Sending payload for potential symptoms:", payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await handleResponse<any>(response);
    console.log("Raw API response for symptoms:", responseData);
    
    // Check if responseData is an array and has the expected structure
    if (Array.isArray(responseData) && 
        responseData.length > 0 && 
        responseData[0]?.message?.content?.potential_symptoms) {
      return responseData[0].message.content.potential_symptoms;
    } else if (responseData?.message?.content?.potential_symptoms) {
      // Handle non-array response format
      return responseData.message.content.potential_symptoms;
    } else {
      console.error("Unexpected response format:", responseData);
      throw new Error("Unexpected response format from API");
    }
  } catch (error) {
    console.error('Error fetching potential symptoms:', error);
    throw error;
  }
};

// Get therapeutic properties based on health concern, demographics, and selected causes and symptoms
export const getTherapeuticProperties = async (formData: Partial<FormData>) => {
  try {
    const payload = {
      health_concern: formData.health_concern,
      gender: formData.gender,
      age_category: formData.age_category,
      age_specific: formData.age_specific,
      selected_causes: formData.selected_causes,
      selected_symptoms: formData.selected_symptoms,
      step: "MedicalProperties",
      user_language: "PT_BR"
    };

    console.log("Sending payload for therapeutic properties:", payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await handleResponse<any>(response);
    console.log("Raw API response for properties:", responseData);
    
    // Check if responseData is an array and has the expected structure
    if (Array.isArray(responseData) && 
        responseData.length > 0 && 
        responseData[0]?.message?.content?.therapeutic_properties) {
      return responseData[0].message.content.therapeutic_properties;
    } else if (responseData?.message?.content?.therapeutic_properties) {
      // Handle non-array response format
      return responseData.message.content.therapeutic_properties;
    } else {
      console.error("Unexpected response format:", responseData);
      throw new Error("Unexpected response format from API");
    }
  } catch (error) {
    console.error('Error fetching therapeutic properties:', error);
    throw error;
  }
};

// Get oils for a specific therapeutic property
export const getOilsForProperty = async (formData: Partial<FormData>, property: TherapeuticProperty): Promise<SuggestedOil[]> => {
  try {
    const payload = {
      health_concern: formData.health_concern,
      gender: formData.gender,
      age_category: formData.age_category,
      age_specific: formData.age_specific,
      selected_causes: formData.selected_causes,
      selected_symptoms: formData.selected_symptoms,
      therapeutic_properties: [property], // Pass the complete property object in an array
      step: "SuggestedOils",
      user_language: "PT_BR"
    };

    console.log(`Sending payload for oils for property ${property.property_id}:`, payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await handleResponse<any>(response);
    console.log(`Raw API response for oils for property ${property.property_id}:`, responseData);
    
    // Check if responseData is an array and has the expected structure
    if (Array.isArray(responseData) && 
        responseData.length > 0 && 
        responseData[0]?.message?.content?.suggested_oils) {
      return responseData[0].message.content.suggested_oils;
    } else if (responseData?.message?.content?.suggested_oils) {
      // Handle non-array response format
      return responseData.message.content.suggested_oils;
    } else {
      console.error("Unexpected response format:", responseData);
      throw new Error("Unexpected response format from API");
    }
  } catch (error) {
    console.error(`Error fetching oils for property ${property.property_id}:`, error);
    throw error;
  }
};

// Get suggested oils based on health concern, demographics, selected causes, symptoms, and therapeutic properties
export const getSuggestedOils = async (formData: Partial<FormData>) => {
  try {
    const payload = {
      health_concern: formData.health_concern,
      gender: formData.gender,
      age_category: formData.age_category,
      age_specific: formData.age_specific,
      selected_causes: formData.selected_causes,
      selected_symptoms: formData.selected_symptoms,
      therapeutic_properties: formData.therapeutic_properties,
      step: "SuggestedOils",
      user_language: "PT_BR"
    };

    console.log("Sending payload for suggested oils:", payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await handleResponse<any>(response);
    console.log("Raw API response for oils:", responseData);
    
    // Check if responseData is an array and has the expected structure
    if (Array.isArray(responseData) && 
        responseData.length > 0 && 
        responseData[0]?.message?.content?.suggested_oils) {
      return responseData[0].message.content.suggested_oils;
    } else if (responseData?.message?.content?.suggested_oils) {
      // Handle non-array response format
      return responseData.message.content.suggested_oils;
    } else {
      console.error("Unexpected response format:", responseData);
      throw new Error("Unexpected response format from API");
    }
  } catch (error) {
    console.error('Error fetching suggested oils:', error);
    throw error;
  }
};
