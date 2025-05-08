"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useCallback } from 'react';
import RecipeStepLayout from '@/components/recipe-flow/RecipeStepLayout';
import DemographicsStep from '@/components/recipe-flow/DemographicsStep';
import CausesStep from '@/components/recipe-flow/CausesStep';
import SymptomsStep from '@/components/recipe-flow/SymptomsStep';
import PropertiesOilsStep from '@/components/recipe-flow/PropertiesOilsStep';
import { useRecipeForm } from '@/contexts/RecipeFormContext';

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

// Define instructions for each step
const stepInstructions: Record<string, string> = {
  causes: "Selecione as causas que você acredita estarem relacionadas ao seu problema de saúde. A descrição aparecerá ao selecionar cada item.",
  symptoms: "Selecione os sintomas que você está experienciando. A descrição aparecerá ao selecionar cada item.",
  // Add other instructions as needed
};


const CreateRecipeStepPage = () => {
  const params = useParams();
  const router = useRouter();
  const { formData, currentStep, setCurrentStep, isFormValid, setIsLoading, setError } = useRecipeForm();
  const step = Array.isArray(params.step) ? params.step[0] : params.step;

  useEffect(() => {
    if (step) {
      setCurrentStep(step);
    }
  }, [step, setCurrentStep]);
  
  useEffect(() => {
    if (!formData.healthConcern && step && step !== 'demographics' && step !== 'properties') {
        // console.warn("Health concern not found for this step, consider redirecting.");
        // router.push('/'); // Uncomment if strict redirection is needed
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
      console.warn("Ação para 'Próxima Etapa' não encontrada em PropertiesOilsStep.");
    }
  }, []);

  const isFetchingOils = step === 'properties' && 
                        (!formData.suggestedOilsByProperty || 
                         (formData.medicalPropertiesResult?.therapeutic_properties && Object.keys(formData.suggestedOilsByProperty || {}).length < formData.medicalPropertiesResult.therapeutic_properties.length));


  const getNavProps = useCallback(() => {
    const basePath = "/create-recipe";
    switch(step) {
      case 'demographics':
        return {
          previousRoute: '/',
          onNext: undefined, 
          isNextDisabled: !isFormValid || formData.isLoading, 
        };
      case 'causes':
        return {
          previousRoute: `${basePath}/demographics`,
          onNext: undefined, 
          isNextDisabled: !isFormValid || formData.isLoading, 
        };
      case 'symptoms':
        return {
          previousRoute: `${basePath}/causes`,
          onNext: undefined, 
          isNextDisabled: !isFormValid || formData.isLoading, 
        }
      case 'properties':
        return {
            previousRoute: `${basePath}/symptoms`,
            onNext: onNextProperties, 
            nextButtonText: "Gerar Receita (Em Breve)", 
            isNextDisabled: formData.isLoading || isFetchingOils, 
            hideNextButton: true, 
        }
      default:
        return {
            previousRoute: '/',
            isNextDisabled: true,
            hideNextButton: false,
        };
    }
  }, [step, isFormValid, formData.isLoading, onNextProperties, isFetchingOils]); 


  if (!step || !StepComponent) {
    return <p className="text-center mt-10">Passo inválido ou não encontrado.</p>;
  }
  
  const navProps = getNavProps();

  return (
    <RecipeStepLayout 
        stepTitle={pageTitle}
        previousRoute={navProps.previousRoute}
        onNext={navProps.onNext} 
        nextButtonText={navProps.nextButtonText}
        isNextDisabled={navProps.isNextDisabled} 
        hideNextButton={navProps.hideNextButton}
        formId={'current-step-form'} 
        stepInstructions={currentInstructions} // Pass instructions here
    >
      <StepComponent />
    </RecipeStepLayout>
  );
};

export default CreateRecipeStepPage;
