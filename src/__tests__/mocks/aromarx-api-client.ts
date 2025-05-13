// src/__tests__/mocks/aromarx-api-client.ts
import { RecipeFormData } from '@/contexts/RecipeFormContext';

// Mock API responses
export const mockSuggestedOils = {
  property_id: 'prop1',
  property_name: 'Anti-inflammatory',
  property_name_in_english: 'Anti-inflammatory',
  description: 'Helps reduce inflammation',
  suggested_oils: [
    {
      name_english: 'Lavender',
      name_local_language: 'Lavanda',
      oil_description: 'Calming and soothing',
      relevancy: 5
    },
    {
      name_english: 'Peppermint',
      name_local_language: 'Hortelã-pimenta',
      oil_description: 'Cooling and refreshing',
      relevancy: 4
    }
  ]
};

export const mockRecipeChoices = {
  choices: [
    {
      title: 'Anti-inflammatory Blend',
      description: 'A blend to help reduce inflammation',
      steps: ['Mix 3 drops of Lavender with 2 drops of Peppermint', 'Apply to affected area'],
      oils: ['Lavender', 'Peppermint']
    },
    {
      title: 'Soothing Blend',
      description: 'A blend to help soothe discomfort',
      steps: ['Mix 4 drops of Lavender with 1 drop of Peppermint', 'Diffuse for 30 minutes'],
      oils: ['Lavender', 'Peppermint']
    }
  ]
};

// Mock API functions
export const getSuggestedOils = jest.fn().mockImplementation(async (propertyId: string) => {
  return mockSuggestedOils;
});

export const fetchRecipeChoices = jest.fn().mockImplementation(async (data: RecipeFormData) => {
  // Check if required fields are present
  if (!data.healthConcern || !data.gender || !data.ageCategory || !data.ageSpecific || 
      !data.selectedCauses || !data.selectedSymptoms || !data.selectedTherapeuticProperties) {
    throw new Error('Missing required data for fetchRecipeChoices');
  }
  
  return mockRecipeChoices;
});
