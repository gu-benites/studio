
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

const CreateRecipeStepPage = () => {
  const params = useParams();
  const router = useRouter();
  const { formData, currentStep, setCurrentStep, healthConcern, isFormValid, setIsLoading, setError } = useRecipeForm();
  const step = Array.isArray(params.step) ? params.step[0] : params.step;

  useEffect(() => {
    if (step) {
      setCurrentStep(step);
    }
  }, [step, setCurrentStep]);
  
  useEffect(() => {
    if (!formData.healthConcern && step && step !== 'demographics' && step !== 'properties') { // Allow properties to load if data exists
        // router.push('/');
        // console.warn("Health concern not found for this step, consider redirecting.");
    }
  }, [formData.healthConcern, router, step]);

  const StepComponent = step ? stepComponents[step] : null;
  const stepTitle = step ? stepTitles[step] || "Etapa Desconhecida" : "Carregando Etapa...";


  const onNextProperties = useCallback(async () => {
    // The PropertiesOilsStep now has an internal submit button for its "Next" action (if any)
    // and a "Start Over" button. This layout "Next" might not be needed or could trigger that internal submit.
    const internalSubmitButton = document.getElementById('properties-oils-submit') as HTMLButtonElement | null;
    if (internalSubmitButton) {
      internalSubmitButton.click();
    } else {
      alert("Ação para 'Próxima Etapa' não implementada em PropertiesOilsStep.");
    }
  }, []);


  const getNavProps = useCallback(() => {
    const basePath = "/create-recipe";
    switch(step) {
      case 'demographics':
        return {
          previousRoute: '/',
          onNext: undefined, 
          isNextDisabled: !isFormValid, 
        };
      case 'causes':
        return {
          previousRoute: `${basePath}/demographics`,
          onNext: undefined, 
          isNextDisabled: !isFormValid, 
        };
      case 'symptoms':
        return {
          previousRoute: `${basePath}/causes`,
          onNext: undefined, 
          isNextDisabled: !isFormValid, 
        }
      case 'properties':
        // The "Next" functionality is now handled by the "Start Over" button within PropertiesOilsStep
        // or a future "Generate Recipe" button also within that step.
        // So, the layout's next button can be hidden.
        return {
            previousRoute: `${basePath}/symptoms`,
            onNext: onNextProperties, // This will trigger the internal submit if it exists
            nextButtonText: "Gerar Receita (Em Breve)", // This button might not be used if Start Over is primary
            isNextDisabled: formData.isLoading || isFetchingOils, // Disable if oils are still being fetched or globally loading
            hideNextButton: true, // Hide the layout's next button for this step
        }
      default:
        return {
            previousRoute: '/',
            isNextDisabled: true,
            hideNextButton: false,
        };
    }
  }, [step, isFormValid, formData.isLoading, onNextProperties, formData.suggestedOilsByProperty]); // Added suggestedOilsByProperty dependencies

  // Determine if oils are still fetching for the properties step's next button disable logic
  const isFetchingOils = step === 'properties' && 
                        (!formData.suggestedOilsByProperty || 
                         (formData.medicalPropertiesResult?.therapeutic_properties && Object.keys(formData.suggestedOilsByProperty).length < formData.medicalPropertiesResult.therapeutic_properties.length));


  if (!step || !StepComponent) {
    return <p className="text-center mt-10">Passo inválido ou não encontrado.</p>;
  }
  
  const navProps = getNavProps();

  return (
    <RecipeStepLayout 
        stepTitle={stepTitle}
        previousRoute={navProps.previousRoute}
        onNext={navProps.onNext} 
        nextButtonText={navProps.nextButtonText}
        isNextDisabled={navProps.isNextDisabled} 
        hideNextButton={navProps.hideNextButton}
        formId={'current-step-form'} // Keep formId for steps that rely on layout's next button for submission
    >
      <StepComponent />
    </RecipeStepLayout>
  );
};

export default CreateRecipeStepPage;
