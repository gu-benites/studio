// src/__tests__/services/aromarx-api-client.test.ts
import { fetchRecipeChoices, getSuggestedOils } from '@/services/aromarx-api-client';
import { RecipeFormData } from '@/contexts/RecipeFormContext';

// Mock fetch
global.fetch = jest.fn();

describe('aromarx-api-client', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchRecipeChoices', () => {
    it('throws an error when required data is missing', async () => {
      // Create incomplete form data
      const incompleteFormData = {
        healthConcern: 'Headache',
        gender: 'Female',
        // Missing other required fields
        isLoading: false
      } as unknown as RecipeFormData;

      // Expect the function to throw an error
      await expect(fetchRecipeChoices(incompleteFormData)).rejects.toThrow(
        'Missing required data for fetchRecipeChoices'
      );
    });

    it('successfully fetches recipe choices when all data is present', async () => {
      // Mock response
      const mockResponse = {
        choices: [
          {
            title: 'Test Recipe',
            description: 'Test Description',
            steps: ['Step 1', 'Step 2'],
            oils: ['Oil 1', 'Oil 2']
          }
        ]
      };

      // Mock fetch implementation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Create complete form data
      const completeFormData: RecipeFormData = {
        healthConcern: 'Headache',
        gender: 'female',
        ageCategory: 'adult',
        ageSpecific: '30-40',
        potentialCausesResult: null,
        selectedCauses: [
          { cause_name: 'Stress', cause_suggestion: 'Manage stress', explanation: 'Stress can trigger headaches' }
        ],
        potentialSymptomsResult: null,
        selectedSymptoms: [
          { symptom_name: 'Pain' }
        ],
        medicalPropertiesResult: null,
        selectedTherapeuticProperties: [],
        suggestedOilsByProperty: {},
        suggestedOilsForProperties: [],
        finalSelectedOils: null,
        recipeChoices: null,
        isLoading: false
      };

      // Call the function
      const result = await fetchRecipeChoices(completeFormData);

      // Expect the result to match the mock response
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      // Mock fetch to return an error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      // Create complete form data
      const completeFormData: RecipeFormData = {
        healthConcern: 'Headache',
        gender: 'female',
        ageCategory: 'adult',
        ageSpecific: '30-40',
        potentialCausesResult: null,
        selectedCauses: [{ cause_name: 'Stress' }],
        potentialSymptomsResult: null,
        selectedSymptoms: [{ symptom_name: 'Pain' }],
        medicalPropertiesResult: null,
        selectedTherapeuticProperties: [
          {
            property_id: 'prop1',
            property_name: 'Anti-inflammatory',
            property_name_in_english: 'Anti-inflammatory',
            description: 'Helps reduce inflammation',
            causes_addressed: 'Inflammation',
            symptoms_addressed: 'Pain, swelling',
            relevancy: 0.8
          }
        ],
        suggestedOilsByProperty: {
          prop1: {
            property_id: 'prop1',
            property_name: 'Anti-inflammatory',
            property_name_in_english: 'Anti-inflammatory',
            description: 'Helps reduce inflammation',
            suggested_oils: [
              {
                name_english: 'Lavender',
                name_local_language: 'Lavanda',
                oil_description: 'Calming and soothing',
                relevancy: 0.8
              }
            ]
          }
        },
        suggestedOilsForProperties: [
          {
            property_id: 'prop1',
            property_name: 'Anti-inflammatory',
            property_name_in_english: 'Anti-inflammatory',
            description: 'Helps reduce inflammation',
            suggested_oils: [
              {
                name_english: 'Lavender',
                name_local_language: 'Lavanda',
                oil_description: 'Calming and soothing',
                relevancy: 0.8
              }
            ]
          }
        ],
        finalSelectedOils: null,
        recipeChoices: null,
        isLoading: false
      };

      // Expect the function to fall back to default choices
      const result = await fetchRecipeChoices(completeFormData);
      
      // Should return fallback choices
      expect(result).toHaveProperty('choices');
      expect(result.choices.length).toBeGreaterThan(0);
    });
  });

  describe('getSuggestedOils', () => {
    it('fetches suggested oils for a property', async () => {
      // Mock response
      const mockResponse = {
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
          }
        ]
      };

      // Mock fetch implementation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Call the function
      const result = await getSuggestedOils('prop1');

      // Expect the result to match the mock response
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      // Mock fetch to return an error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      // Expect the function to return a default response
      const result = await getSuggestedOils('prop1');
      
      // Should return an object with suggested_oils
      expect(result).toHaveProperty('suggested_oils');
      expect(Array.isArray(result.suggested_oils)).toBe(true);
    });
  });
});
