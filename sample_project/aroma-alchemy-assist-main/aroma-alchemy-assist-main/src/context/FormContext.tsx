
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FormData, FormStep, Cause, Symptom, TherapeuticProperty, SuggestedOil } from '@/types';

interface FormContextType {
  formData: Partial<FormData>;
  updateFormData: (data: Partial<FormData>) => void;
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  potentialCauses: Cause[];
  setPotentialCauses: (causes: Cause[]) => void;
  potentialSymptoms: Symptom[];
  setPotentialSymptoms: (symptoms: Symptom[]) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const STORAGE_KEY = 'aroma-chat-form-data';

const STEPS: FormStep[] = [
  'health-concern',
  'demographics',
  'causes',
  'symptoms',
  'review',
  'properties',
  'oils'
];

interface FormProviderProps {
  children: React.ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<Partial<FormData>>({
    health_concern: '',
    gender: 'female' as const,
    age_category: 'adult' as const,
    age_specific: '',
    selected_causes: [],
    selected_symptoms: [],
    therapeutic_properties: [],
    suggested_oils: []
  });
  
  const [currentStep, setCurrentStep] = useState<FormStep>('health-concern');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [potentialCauses, setPotentialCauses] = useState<Cause[]>([]);
  const [potentialSymptoms, setPotentialSymptoms] = useState<Symptom[]>([]);

  // Load form data from sessionStorage on initial render
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        
        // If we have data, try to determine the appropriate step
        if (parsedData.suggested_oils && parsedData.suggested_oils.length > 0) {
          setCurrentStep('oils');
        } else if (parsedData.therapeutic_properties && parsedData.therapeutic_properties.length > 0) {
          setCurrentStep('properties');
        } else if (parsedData.selected_symptoms && parsedData.selected_symptoms.length > 0) {
          setCurrentStep('review');
        }
      }
    } catch (error) {
      console.error('Error loading form data from session storage', error);
    }
  }, []);

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving form data to session storage', error);
    }
  }, [formData]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const resetForm = () => {
    setFormData({
      health_concern: '',
      gender: 'female',
      age_category: 'adult',
      age_specific: '',
      selected_causes: [],
      selected_symptoms: [],
      therapeutic_properties: [],
      suggested_oils: []
    });
    setCurrentStep('health-concern');
    setPotentialCauses([]);
    setPotentialSymptoms([]);
    setError(null);
    
    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FormContext.Provider 
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        isLoading,
        setIsLoading,
        error,
        setError,
        potentialCauses,
        setPotentialCauses,
        potentialSymptoms,
        setPotentialSymptoms,
        resetForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
