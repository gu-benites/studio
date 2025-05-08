
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
  causes: "Selecione as causas que você acredita estarem relacionadas ao seu problema de saúde. Clique no título para ver mais detalhes.",
  symptoms: "Selecione os sintomas que você está experienciando. Clique no título para ver mais detalhes.",
  properties: "Revise as propriedades terapêuticas e os óleos sugeridos. Clique no título para ver mais detalhes.",
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
    // Allow direct access to 'properties' for now, but ensure required data exists or handle gracefully within the component.
    // For other steps, if healthConcern is missing, it might indicate an improper flow entry.
    if (!formData.healthConcern && step && step !== 'demographics' && step !== 'properties') {
        // console.warn("Health concern not found for this step, consider redirecting.");
        // router.push('/'); // Uncomment if strict redirection is needed
    }
  }, [formData.healthConcern, router, step]);

  const StepComponent = step ? stepComponents[step] : null;
  const pageTitle = step ? stepTitles[step] || "Etapa Desconhecida" : "Carregando Etapa...";
  const currentInstructions = step ? stepInstructions[step] : undefined;


  const onNextProperties = useCallback(async () => {
    // This function is specifically for the "PropertiesOilsStep"
    // It might trigger a final API call or navigate to a results page.
    // For now, it's a placeholder for "Gerar Receita (Em Breve)"
    const internalSubmitButton = document.getElementById('properties-oils-submit') as HTMLButtonElement | null;
    if (internalSubmitButton) {
      internalSubmitButton.click(); // This assumes PropertiesOilsStep has a hidden submit button
    } else {
      // If PropertiesOilsStep doesn't have its own internal submit, handle next action here
      // e.g., router.push('/create-recipe/final-recipe'); // Or whatever the next step is
      console.warn("Ação para 'Próxima Etapa' não encontrada ou não implementada em PropertiesOilsStep.");
      // Potentially navigate to a placeholder for the final recipe page
      // router.push('/recipe-summary-placeholder'); // Example
    }
  }, []);

  // Determine if oils are still being fetched for the properties step
  const isFetchingOils = step === 'properties' && 
                        formData.isLoading && // Use the global isLoading from context
                        (!formData.suggestedOilsByProperty || 
                         (formData.medicalPropertiesResult?.therapeutic_properties && Object.keys(formData.suggestedOilsByProperty || {}).length < formData.medicalPropertiesResult.therapeutic_properties.length));


  const getNavProps = useCallback(() => {
    const basePath = "/create-recipe";
    switch(step) {
      case 'demographics':
        return {
          previousRoute: '/', // Previous is the main page where health concern is entered
          onNext: undefined,  // Will use form submission from DemographicsStep
          isNextDisabled: !isFormValid || formData.isLoading, 
        };
      case 'causes':
        return {
          previousRoute: `${basePath}/demographics`,
          onNext: undefined, // Will use form submission from CausesStep
          isNextDisabled: !isFormValid || formData.isLoading, 
        };
      case 'symptoms':
        return {
          previousRoute: `${basePath}/causes`,
          onNext: undefined, // Will use form submission from SymptomsStep
          isNextDisabled: !isFormValid || formData.isLoading, 
        }
      case 'properties':
        return {
            previousRoute: `${basePath}/symptoms`,
            onNext: onNextProperties, // Custom handler for properties step if needed
            nextButtonText: "Gerar Receita (Em Breve)", // Placeholder text
            // Disable next if global loading, or if oils are fetching, or if form is invalid (though properties step might not have its own "form")
            isNextDisabled: formData.isLoading || isFetchingOils, 
            hideNextButton: true, // As per current design, this step doesn't have a "Next" button in the footer
        }
      default:
        return { // Fallback for unknown steps
            previousRoute: '/',
            isNextDisabled: true,
            hideNextButton: true, // Typically hide next if step is unknown
        };
    }
  }, [step, isFormValid, formData.isLoading, onNextProperties, isFetchingOils]); 


  if (!step || !StepComponent) {
    // TODO: Add a more user-friendly loading/error state here
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
        stepInstructions={currentInstructions} 
    >
      <StepComponent />
    </RecipeStepLayout>
  );
};

export default CreateRecipeStepPage;
