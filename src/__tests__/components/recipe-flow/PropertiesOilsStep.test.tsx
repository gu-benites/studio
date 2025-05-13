// src/__tests__/components/recipe-flow/PropertiesOilsStep.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertiesOilsStep from '@/components/recipe-flow/PropertiesOilsStep';
import { RecipeFormProvider } from '@/contexts/RecipeFormContext';

// Mock the API client
jest.mock('@/services/aromarx-api-client', () => {
  return {
    fetchRecipeChoices: jest.fn().mockImplementation(async (data) => {
      if (!data.healthConcern || !data.gender || !data.ageCategory || !data.ageSpecific || 
          !data.selectedCauses || !data.selectedSymptoms || !data.selectedTherapeuticProperties) {
        throw new Error('Missing required data for fetchRecipeChoices');
      }
      return {
        choices: [
          {
            title: 'Test Recipe',
            description: 'Test Description',
            steps: ['Step 1', 'Step 2'],
            oils: ['Oil 1', 'Oil 2']
          }
        ]
      };
    }),
    getSuggestedOils: jest.fn().mockImplementation(async () => {
      return {
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
    })
  };
});

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock translation function
const mockT = jest.fn((key) => key);

describe('PropertiesOilsStep', () => {
  const mockTherapeuticProperties = [
    {
      property_id: 'prop1',
      property_name: 'Anti-inflammatory',
      property_name_in_english: 'Anti-inflammatory',
      description: 'Helps reduce inflammation',
      causes_addressed: 'Inflammation',
      symptoms_addressed: 'Pain, swelling',
      relevancy: 5
    }
  ];

  const mockSuggestedOilsByProperty = {
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
          relevancy: 5
        }
      ]
    }
  };

  const mockFormData = {
    healthConcern: 'Headache',
    gender: 'Female',
    ageCategory: 'Adult',
    ageSpecific: '30-40',
    selectedCauses: [{ cause_name: 'Stress', cause_suggestion: 'Reduce stress', explanation: 'Stress can cause headaches' }],
    selectedSymptoms: [{ symptom_name: 'Pain' }],
    selectedTherapeuticProperties: mockTherapeuticProperties,
    medicalPropertiesResult: {
      health_concern_in_english: 'Headache',
      therapeutic_properties: mockTherapeuticProperties
    },
    suggestedOilsByProperty: mockSuggestedOilsByProperty,
    isLoading: false
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock sessionStorage
    window.sessionStorage.clear();
  });

  it('renders therapeutic properties correctly', () => {
    render(
      <RecipeFormProvider>
        <PropertiesOilsStep t={mockT} />
      </RecipeFormProvider>
    );

    // Initially, there might not be any properties rendered
    expect(screen.queryByText('Anti-inflammatory')).not.toBeInTheDocument();

    // Update the form data with therapeutic properties
    const updateFormDataEvent = new CustomEvent('updateFormData', {
      detail: mockFormData
    });
    window.dispatchEvent(updateFormDataEvent);

    // Now the properties should be rendered
    expect(screen.getByText('Anti-inflammatory')).toBeInTheDocument();
  });

  it('shows loading state when fetching oils', async () => {
    // Set up the initial state with loading
    const loadingFormData = {
      ...mockFormData,
      isLoading: true
    };

    render(
      <RecipeFormProvider>
        <PropertiesOilsStep t={mockT} />
      </RecipeFormProvider>
    );

    // Update the form data with loading state
    const updateFormDataEvent = new CustomEvent('updateFormData', {
      detail: loadingFormData
    });
    window.dispatchEvent(updateFormDataEvent);

    // Loading indicator should be visible
    expect(screen.getByText(/buscando óleos essenciais sugeridos/i)).toBeInTheDocument();
  });

  it('displays error when Generate Suggestions button is clicked with missing data', async () => {
    // Mock the setError function
    const setErrorMock = jest.fn();
    
    render(
      <RecipeFormProvider>
        <PropertiesOilsStep t={mockT} />
      </RecipeFormProvider>
    );

    // Find the Generate Suggestions button
    const generateButton = screen.getByText('Gerar Sugestões');
    
    // Click the button
    await userEvent.click(generateButton);
    
    // Expect error to be set
    await waitFor(() => {
      expect(setErrorMock).toHaveBeenCalled();
    });
  });

  it('successfully generates suggestions when all data is present', async () => {
    // Mock the API client and router
    const fetchRecipeChoicesMock = require('@/services/aromarx-api-client').fetchRecipeChoices;
    const routerPushMock = jest.fn();
    require('next/navigation').useRouter.mockImplementation(() => ({
      push: routerPushMock
    }));
    
    render(
      <RecipeFormProvider>
        <PropertiesOilsStep t={mockT} />
      </RecipeFormProvider>
    );

    // Update the form data with all required fields
    const updateFormDataEvent = new CustomEvent('updateFormData', {
      detail: mockFormData
    });
    window.dispatchEvent(updateFormDataEvent);

    // Find the Generate Suggestions button
    const generateButton = screen.getByText('Gerar Sugestões');
    
    // Click the button
    await userEvent.click(generateButton);
    
    // Expect the API to be called and router to navigate
    await waitFor(() => {
      expect(fetchRecipeChoicesMock).toHaveBeenCalled();
      expect(routerPushMock).toHaveBeenCalledWith('/recipe-choices');
    });
  });
});
