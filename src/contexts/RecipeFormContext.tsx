
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getItem, setItem, removeItem } from '@/lib/session-storage';

// Define types for API responses based on 01_api_calls_n_responses.txt
interface PotentialCause {
  cause_name: string;
  cause_suggestion: string;
  explanation: string;
  // Add id if necessary for selection, or use cause_name as key
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
  property_name: string; // from API response
  property_name_in_english: string; // from API response
  description: string; // from API response
  suggested_oils: SuggestedOil[];
}


export interface RecipeFormData {
  healthConcern: string | null;
  gender: string | null;
  ageCategory: string | null;
  ageSpecific: string | null; // Stored as string, validated as number
  
  potentialCausesResult: PotentialCause[] | null;
  selectedCauses: PotentialCause[] | null;
  
  potentialSymptomsResult: PotentialSymptom[] | null;
  selectedSymptoms: Pick<PotentialSymptom, 'symptom_name'>[] | null; // API expects only symptom_name for MedicalProperties step
  
  medicalPropertiesResult: {
    health_concern_in_english: string;
    therapeutic_properties: TherapeuticProperty[];
  } | null;
  // For SuggestedOils, we need to store oils for each therapeutic property selected.
  // The API is called iteratively for each property.
  selectedTherapeuticProperties: TherapeuticProperty[] | null; // Properties for which oils will be fetched/displayed
  
  suggestedOilsByProperty: Record<string, SuggestedOilsForProperty> | null; // property_id -> SuggestedOilsForProperty
  
  // Final selections for recipe creation (if user can select specific oils)
  finalSelectedOils: SuggestedOil[] | null; 
}

interface RecipeFormContextType {
  formData: RecipeFormData;
  updateFormData: (data: Partial<RecipeFormData>) => void;
  resetFormData: () => void;
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const SESSION_STORAGE_KEY = 'recipeFormData';

const initialFormData: RecipeFormData = {
  healthConcern: null,
  gender: null,
  ageCategory: null,
  ageSpecific: null,
  potentialCausesResult: null,
  selectedCauses: null,
  potentialSymptomsResult: null,
  selectedSymptoms: null,
  medicalPropertiesResult: null,
  selectedTherapeuticProperties: null,
  suggestedOilsByProperty: null,
  finalSelectedOils: null,
};

const RecipeFormContext = createContext<RecipeFormContextType | undefined>(undefined);

export const RecipeFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormDataState] = useState<RecipeFormData>(initialFormData);
  const [currentStep, setCurrentStepState] = useState<string | null>(null);
  const [isLoading, setIsLoadingState] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedData = getItem<RecipeFormData>(SESSION_STORAGE_KEY);
    if (storedData) {
      setFormDataState(storedData);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      setItem(SESSION_STORAGE_KEY, formData);
    }
  }, [formData, isInitialized]);

  const updateFormData = useCallback((data: Partial<RecipeFormData>) => {
    setFormDataState((prevData) => ({
      ...prevData,
      ...data,
    }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormDataState(initialFormData);
    setCurrentStepState(null);
    setIsLoadingState(false);
    setErrorState(null);
    removeItem(SESSION_STORAGE_KEY);
  }, []);

  const setCurrentStep = useCallback((step: string | null) => {
    setCurrentStepState(step);
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
  }, []);
  
  const setError = useCallback((errorMsg: string | null) => {
    setErrorState(errorMsg);
  }, []);


  if (!isInitialized) {
    // Optionally render a loading state or null until session storage is checked
    return null; 
  }

  return (
    <RecipeFormContext.Provider value={{ 
        formData, 
        updateFormData, 
        resetFormData,
        currentStep,
        setCurrentStep,
        isLoading,
        setIsLoading,
        error,
        setError
         }}>
      {children}
    </RecipeFormContext.Provider>
  );
};

export const useRecipeForm = (): RecipeFormContextType => {
  const context = useContext(RecipeFormContext);
  if (!context) {
    throw new Error('useRecipeForm must be used within a RecipeFormProvider');
  }
  return context;
};
