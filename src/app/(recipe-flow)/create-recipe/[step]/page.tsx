
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import RecipeStepLayout from '@/components/recipe-flow/RecipeStepLayout';
import DemographicsStep from '@/components/recipe-flow/DemographicsStep';
import CausesStep from '@/components/recipe-flow/CausesStep';
import SymptomsStep from '@/components/recipe-flow/SymptomsStep';
import PropertiesOilsStep from '@/components/recipe-flow/PropertiesOilsStep';
// Import other step components here as they are created
import { useRecipeForm } from '@/contexts/RecipeFormContext';

const stepComponents: Record<string, React.ComponentType<any>> = {
  demographics: DemographicsStep,
  causes: CausesStep,
  symptoms: SymptomsStep,
  properties: PropertiesOilsStep,
  // Add other steps here
  // e.g. 'final-recipe': FinalRecipeComponent,
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
  const { formData, currentStep, setCurrentStep, healthConcern } = useRecipeForm();
  const step = Array.isArray(params.step) ? params.step[0] : params.step;

  useEffect(() => {
    if (step) {
      setCurrentStep(step);
    }
  }, [step, setCurrentStep]);
  
  // Redirect to first step if healthConcern is not set (e.g., direct navigation to a step URL)
  useEffect(() => {
    if (!formData.healthConcern && step !== 'demographics') {
        // Allow demographics step if health concern is missing, it might be set directly.
        // But for subsequent steps, health concern is a must.
        // A more robust check might be to ensure formData from previous steps is available.
        // For now, if healthConcern is missing and we're not on the first intended step (demographics), redirect.
        // router.push('/');
        // console.warn("Health concern not found, redirecting to home. This might change based on flow logic.");
    }
  }, [formData.healthConcern, router, step]);


  const StepComponent = step ? stepComponents[step] : null;
  const stepTitle = step ? stepTitles[step] || "Etapa Desconhecida" : "Carregando Etapa...";

  if (!step || !StepComponent) {
    // Handle invalid step, e.g., show a 404 or redirect
    // For now, just a simple message or redirect to home
    // useEffect(() => { router.push('/'); }, [router]); // Can cause infinite loop if not careful
    return <p className="text-center mt-10">Passo inválido ou não encontrado.</p>;
  }
  
  // Base path for navigation
  const basePath = "/create-recipe";

  // Define navigation logic for each step
  // This is a simplified example; actual logic might be more complex (e.g., based on API calls)
  const getNavProps = () => {
    switch(step) {
      case 'demographics':
        return {
          previousRoute: '/', // Back to health concern input (home)
          // nextRoute is handled by DemographicsStep's onNext
        };
      case 'causes':
        return {
          previousRoute: `${basePath}/demographics`,
          // nextRoute handled by CausesStep
        };
      case 'symptoms':
        return {
          previousRoute: `${basePath}/causes`,
          // nextRoute handled by SymptomsStep
        }
      case 'properties':
        return {
            previousRoute: `${basePath}/symptoms`,
            // nextRoute might be to a summary or final recipe page (not yet defined)
            // For now, hide next button or make it go to a placeholder
            nextButtonText: "Ver Resumo (Em Breve)",
            isNextDisabled: true, // Or implement next step
        }
      default:
        return {
            previousRoute: '/', // Fallback
        };
    }
  }

  const navProps = getNavProps();

  return (
    <RecipeStepLayout 
        stepTitle={stepTitle}
        previousRoute={navProps.previousRoute}
        // nextRoute={navProps.nextRoute} // Next is handled by individual step components
        // onNext will be defined in specific step components if they need async logic before nav
        nextButtonText={navProps.nextButtonText}
        isNextDisabled={navProps.isNextDisabled}
    >
      <StepComponent />
    </RecipeStepLayout>
  );
};

export default CreateRecipeStepPage;
