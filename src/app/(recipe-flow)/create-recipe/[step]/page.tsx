// src/app/(recipe-flow)/create-recipe/[step]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useCallback } from 'react';
import RecipeStepLayout from '@/components/recipe-flow/RecipeStepLayout';
import DemographicsStep from '@/components/recipe-flow/DemographicsStep';
import CausesStep from '@/components/recipe-flow/CausesStep';
import SymptomsStep from '@/components/recipe-flow/SymptomsStep';
import PropertiesOilsStep from '@/components/recipe-flow/PropertiesOilsStep';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import LoadingCausesScreen from '@/components/recipe-flow/LoadingCausesScreen'; 
import LoadingSymptomsScreen from '@/components/recipe-flow/LoadingSymptomsScreen';
import LoadingPropertiesScreen from '@/components/recipe-flow/LoadingPropertiesScreen'; // Import the new loading screen

const stepComponents: Record<string, React.ComponentType<any>> = {
  demographics: DemographicsStep,
  causes: CausesStep,
  symptoms: SymptomsStep,
  properties: PropertiesOilsStep,
};

const stepTitles: Record<string, string> = {
  demographics: "Informações Demográficas",
  causes: "Seleção de Causas Potenciais",
  symptoms: "Seleção de Sintomas",
  properties: "Propriedades Terapêuticas e Óleos",
};

const stepInstructions: Record<string, string> = {
  causes: "Selecione as causas que você acredita estarem relacionadas ao seu problema de saúde.",
  symptoms: "Selecione os sintomas que você está experienciando.",
  properties: "Revise as propriedades terapêuticas e os óleos sugeridos.",
};

const CreateRecipeStepPage = () => {
  const params = useParams();
  const router = useRouter();
  const { 
    formData, 
    currentStep, 
    setCurrentStep, 
    isFormValid, 
    isLoading, 
    isFetchingCauses, 
    isFetchingSymptoms, 
    isFetchingProperties, // Destructure isFetchingProperties
    setError 
  } = useRecipeForm();
  const step = Array.isArray(params.step) ? params.step[0] : params.step;

  useEffect(() => {
    if (step) {
      setCurrentStep(step);
    }
  }, [step, setCurrentStep]);
  
  useEffect(() => {
    if (!formData.healthConcern && step && step !== 'demographics' && step !== 'properties') {
      // Consider redirecting if essential data is missing
    }
  }, [formData.healthConcern, router, step]);

  const StepComponent = step ? stepComponents[step] : null;
  const pageTitle = step ? stepTitles[step] || "Etapa Desconhecida" : "Carregando Etapa...";
  const currentInstructions = step ? stepInstructions[step] : undefined;

  const onNextProperties = useCallback(async () => {
    const internalSubmitButton = document.getElementById('properties-oils-submit') as HTMLButtonElement | null;
    if (internalSubmitButton) {
      internalSubmitButton.click();
    } else {
      console.warn("Ação para 'Próxima Etapa' não encontrada ou não implementada em PropertiesOilsStep.");
    }
  }, []);

  const isFetchingOilsForPropertiesStep = step === 'properties' && 
                        isLoading && 
                        (!formData.suggestedOilsByProperty || 
                         (formData.medicalPropertiesResult?.therapeutic_properties && Object.keys(formData.suggestedOilsByProperty || {}).length < formData.medicalPropertiesResult.therapeutic_properties.length));

  const getNavProps = useCallback(() => {
    const basePath = "/create-recipe";
    switch(step) {
      case 'demographics':
        return {
          previousRoute: '/',
          onNext: undefined, 
          isNextDisabled: !isFormValid || isLoading, 
        };
      case 'causes':
        return {
          previousRoute: `${basePath}/demographics`,
          onNext: undefined, 
          isNextDisabled: isFetchingCauses || !isFormValid || isLoading, 
        };
      case 'symptoms':
        return {
          previousRoute: `${basePath}/causes`,
          onNext: undefined, 
          isNextDisabled: isFetchingSymptoms || !isFormValid || isLoading, 
        }
      case 'properties':
        return {
            previousRoute: `${basePath}/symptoms`,
            onNext: onNextProperties, 
            nextButtonText: "Gerar Receita (Em Breve)",
            isNextDisabled: isLoading || isFetchingProperties || isFetchingOilsForPropertiesStep, // Added isFetchingProperties
            hideNextButton: true, 
        }
      default:
        return { 
            previousRoute: '/',
            isNextDisabled: true,
            hideNextButton: true, 
        };
    }
  }, [step, isFormValid, isLoading, isFetchingCauses, isFetchingSymptoms, isFetchingProperties, onNextProperties, isFetchingOilsForPropertiesStep]); 

  if (!step || !StepComponent) {
    return <p className="text-center mt-10">Passo inválido ou não encontrado.</p>;
  }
  
  const navProps = getNavProps();

  if (step === 'causes' && isFetchingCauses) {
    return <LoadingCausesScreen />;
  }
  
  if (step === 'symptoms' && isFetchingSymptoms) { 
    return <LoadingSymptomsScreen />;
  }

  if (step === 'properties' && isFetchingProperties) { // Conditional render for properties loading
    return <LoadingPropertiesScreen />;
  }

  return (
    <RecipeStepLayout 
        stepTitle={pageTitle}
        previousRoute={navProps.previousRoute}
        onNext={navProps.onNext} 
        nextButtonText={navProps.nextButtonText}
        isNextDisabled={navProps.isNextDisabled} 
        hideNextButton={navProps.hideNextButton}
        formId={'current-step-form'} 
        stepInstructions={currentInstructions} 
    >
      <StepComponent />
    </RecipeStepLayout>
  );
};

export default CreateRecipeStepPage;
