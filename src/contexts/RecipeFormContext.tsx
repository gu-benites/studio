
// src/contexts/RecipeFormContext.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getItem, setItem, removeItem } from '@/lib/session-storage';

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


export interface RecipeFormData {
  healthConcern: string | null;
  gender: string | null;
  ageCategory: string | null;
  ageSpecific: string | null; 
  
  potentialCausesResult: PotentialCause[] | null;
  selectedCauses: PotentialCause[] | null;
  
  potentialSymptomsResult: PotentialSymptom[] | null;
  selectedSymptoms: Pick<PotentialSymptom, 'symptom_name'>[] | null; 
  
  medicalPropertiesResult: {
    health_concern_in_english: string;
    therapeutic_properties: TherapeuticProperty[];
  } | null;
  selectedTherapeuticProperties: TherapeuticProperty[] | null; 
  
  suggestedOilsByProperty: Record<string, SuggestedOilsForProperty> | null; 
  
  finalSelectedOils: SuggestedOil[] | null; 
  isLoading: boolean; // General loading for form-wide operations, not step transitions
}

interface RecipeFormContextType {
  formData: RecipeFormData;
  updateFormData: (data: Partial<RecipeFormData>) => void;
  resetFormData: () => void;
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  
  // Replaces individual isFetching... states
  isFetchingNextStepData: boolean; 
  setIsFetchingNextStepData: (fetching: boolean) => void; 

  //isLoading and setIsLoading are for non-step-transition loading, e.g. propertiesOils internal oil fetching
  isLoading: boolean; 
  setIsLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  isFormValid: boolean; 
  updateFormValidity: (isValid: boolean) => void;

  // To inform LoadingScreen which set of messages to display
  loadingScreenTargetStepKey: 'causes' | 'symptoms' | 'properties' | null;
  setLoadingScreenTargetStepKey: (key: 'causes' | 'symptoms' | 'properties' | null) => void;
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
  isLoading: false,
};

const RecipeFormContext = createContext<RecipeFormContextType | undefined>(undefined);

export const RecipeFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormDataState] = useState<RecipeFormData>(initialFormData);
  const [currentStep, setCurrentStepState] = useState<string | null>(null);
  const [isLoading, setIsLoadingState] = useState<boolean>(false); // For general loading, not step transitions
  const [isFetchingNextStepData, setIsFetchingNextStepDataState] = useState<boolean>(false);
  const [loadingScreenTargetStepKey, setLoadingScreenTargetStepKeyState] = useState<'causes' | 'symptoms' | 'properties' | null>(null);
  const [error, setErrorState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    const storedData = getItem<RecipeFormData>(SESSION_STORAGE_KEY);
    if (storedData) {
      setFormDataState(prev => ({...prev, ...storedData, isLoading: false})); 
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const { isLoading: formIsLoading, ...dataToStore } = formData;
      setItem(SESSION_STORAGE_KEY, dataToStore);
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
    setIsFetchingNextStepDataState(false);
    setLoadingScreenTargetStepKeyState(null);
    setErrorState(null);
    setIsFormValid(false);
    removeItem(SESSION_STORAGE_KEY);
  }, []);

  const setCurrentStep = useCallback((step: string | null) => {
    setCurrentStepState(step);
    setIsFormValid(false); 
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
    setFormDataState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setIsFetchingNextStepData = useCallback((fetching: boolean) => {
    setIsFetchingNextStepDataState(fetching);
  }, []);

  const setLoadingScreenTargetStepKey = useCallback((key: 'causes' | 'symptoms' | 'properties' | null) => {
    setLoadingScreenTargetStepKeyState(key);
  }, []);

  const setError = useCallback((errorMsg: string | null) => {
    setErrorState(errorMsg);
  }, []);

  const updateFormValidity = useCallback((isValid: boolean) => {
    setIsFormValid(isValid);
  }, []);

  if (!isInitialized) {
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
        isFetchingNextStepData, 
        setIsFetchingNextStepData,
        loadingScreenTargetStepKey,
        setLoadingScreenTargetStepKey,
        error,
        setError,
        isFormValid,
        updateFormValidity
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
