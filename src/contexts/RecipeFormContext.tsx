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
  isLoading: boolean; // Moved isLoading here to be part of formData for persistence if needed
}

interface RecipeFormContextType {
  formData: RecipeFormData;
  updateFormData: (data: Partial<RecipeFormData>) => void;
  resetFormData: () => void;
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  isLoading: boolean; // Global loading state for API calls
  setIsLoading: (loading: boolean) => void;
  isFetchingCauses: boolean; 
  setIsFetchingCauses: (fetching: boolean) => void; 
  isFetchingSymptoms: boolean; 
  setIsFetchingSymptoms: (fetching: boolean) => void; 
  isFetchingProperties: boolean; // New state for properties loading screen
  setIsFetchingProperties: (fetching: boolean) => void; // Setter for the new state
  error: string | null;
  setError: (error: string | null) => void;
  isFormValid: boolean; // Represents validity of the current step's form
  updateFormValidity: (isValid: boolean) => void;
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
  isLoading: false, // Initialize isLoading
};

const RecipeFormContext = createContext<RecipeFormContextType | undefined>(undefined);

export const RecipeFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormDataState] = useState<RecipeFormData>(initialFormData);
  const [currentStep, setCurrentStepState] = useState<string | null>(null);
  const [isLoading, setIsLoadingState] = useState<boolean>(false); // Global API loading
  const [isFetchingCauses, setIsFetchingCausesState] = useState<boolean>(false); 
  const [isFetchingSymptoms, setIsFetchingSymptomsState] = useState<boolean>(false); 
  const [isFetchingProperties, setIsFetchingPropertiesState] = useState<boolean>(false); // Initialize new state
  const [error, setErrorState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false); // Current step form validity

  useEffect(() => {
    const storedData = getItem<RecipeFormData>(SESSION_STORAGE_KEY);
    if (storedData) {
      setFormDataState(prev => ({...prev, ...storedData, isLoading: false})); // Ensure isLoading resets
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Do not persist isLoading state from formData to session storage
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
    setIsFetchingCausesState(false); 
    setIsFetchingSymptomsState(false); 
    setIsFetchingPropertiesState(false); // Reset new state
    setErrorState(null);
    setIsFormValid(false);
    removeItem(SESSION_STORAGE_KEY);
  }, []);

  const setCurrentStep = useCallback((step: string | null) => {
    setCurrentStepState(step);
    setIsFormValid(false); // Reset form validity when step changes
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
    // Update formData.isLoading if you want it persisted or reacted to elsewhere
    setFormDataState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setIsFetchingCauses = useCallback((fetching: boolean) => {
    setIsFetchingCausesState(fetching);
  }, []);

  const setIsFetchingSymptoms = useCallback((fetching: boolean) => { 
    setIsFetchingSymptomsState(fetching);
  }, []);

  const setIsFetchingProperties = useCallback((fetching: boolean) => { // Define setter for new state
    setIsFetchingPropertiesState(fetching);
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
        isFetchingCauses, 
        setIsFetchingCauses, 
        isFetchingSymptoms, 
        setIsFetchingSymptoms, 
        isFetchingProperties, // Provide new state
        setIsFetchingProperties, // Provide setter for new state
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
