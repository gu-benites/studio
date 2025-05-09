
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
import LoadingScreen from '@/components/recipe-flow/LoadingScreen'; // Import the new reusable loading screen

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
  demographics: "Para começar, precisamos de algumas informações sobre você.",
  causes: "Selecione as causas que você acredita estarem relacionadas ao seu problema de saúde. Clique no título para ver mais detalhes.",
  symptoms: "Selecione os sintomas que você está experienciando. Clique no título para ver mais detalhes.",
  properties: "Revise as propriedades terapêuticas e os óleos sugeridos para cada uma. Clique no título para ver os óleos.",
};

const CreateRecipeStepPage = () => {
  const params = useParams();
  const router = useRouter();
  const { 
    formData, 
    currentStep, 
    setCurrentStep, 
    isFormValid, 
    isLoading, // General loading, not for step transitions specifically managed by isFetchingNextStepData
    isFetchingNextStepData, // Use this for loading screen visibility
    loadingScreenTargetStepKey, // To tell LoadingScreen which messages to show
    setError 
  } = useRecipeForm();
  const step = Array.isArray(params.step) ? params.step[0] : params.step;

  useEffect(() => {
    if (step) {
      setCurrentStep(step);
    }
  }, [step, setCurrentStep]);
  
  useEffect(() => {
    // Basic guard for direct access to later steps without initial data
    if (!formData.healthConcern && step && step !== 'demographics' && currentStep !== 'demographics' ) {
       // router.push('/'); // Consider redirecting if essential data is missing
       console.warn("Health concern not set, user might have jumped steps.");
    }
  }, [formData.healthConcern, router, step, currentStep]);

  const StepComponent = step ? stepComponents[step] : null;
  const pageTitle = step ? stepTitles[step] || "Etapa Desconhecida" : "Carregando Etapa...";
  const currentInstructions = step ? stepInstructions[step] : undefined;

  const onNextProperties = useCallback(async () => {
    const internalSubmitButton = document.getElementById('properties-oils-submit') as HTMLButtonElement | null;
    if (internalSubmitButton) {
      internalSubmitButton.click();
    } else {
      console.warn("Ação para 'Próxima Etapa' não encontrada ou não implementada em PropertiesOilsStep.");
      // Potentially navigate to a summary or final step if applicable
      // router.push('/create-recipe/summary'); 
    }
  }, []);

  // This isLoading is the general one, mainly for PropertiesOilsStep internal fetching
  const isPropertiesOilsStepInternallyLoading = step === 'properties' && isLoading;

  const getNavProps = useCallback(() => {
    const basePath = "/create-recipe";
    let nextDisabled = !isFormValid || isFetchingNextStepData || isLoading; // isLoading for general loading like properties oils fetching
    
    switch(step) {
      case 'demographics':
        return { previousRoute: '/', onNext: undefined, isNextDisabled: nextDisabled };
      case 'causes':
        return { previousRoute: `${basePath}/demographics`, onNext: undefined, isNextDisabled: nextDisabled };
      case 'symptoms':
        return { previousRoute: `${basePath}/causes`, onNext: undefined, isNextDisabled: nextDisabled };
      case 'properties':
        return {
            previousRoute: `${basePath}/symptoms`,
            onNext: onNextProperties, 
            nextButtonText: "Gerar Receita (Em Breve)",
            isNextDisabled: nextDisabled || isPropertiesOilsStepInternallyLoading,
            hideNextButton: true, 
        };
      default:
        return { previousRoute: '/', isNextDisabled: true, hideNextButton: true };
    }
  }, [step, isFormValid, isLoading, isFetchingNextStepData, onNextProperties, isPropertiesOilsStepInternallyLoading]); 

  if (!step || !StepComponent) {
    return <p className="text-center mt-10">Passo inválido ou não encontrado.</p>;
  }
  
  const navProps = getNavProps();

  // Use the single isFetchingNextStepData and loadingScreenTargetStepKey
  if (isFetchingNextStepData && loadingScreenTargetStepKey) {
    return <LoadingScreen targetStepKey={loadingScreenTargetStepKey} />;
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
