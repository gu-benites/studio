
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
    if (!formData.healthConcern && step && step !== 'demographics') {
        // Redirect if healthConcern is missing for steps after demographics
        // router.push('/');
        // console.warn("Health concern not found, redirecting to home.");
    }
  }, [formData.healthConcern, router, step]);

  const StepComponent = step ? stepComponents[step] : null;
  const stepTitle = step ? stepTitles[step] || "Etapa Desconhecida" : "Carregando Etapa...";

  // Define onNext handlers for each step that needs custom logic (like API calls)
  // These will be triggered by the RecipeStepLayout's "Next" button

  const onNextDemographics = useCallback(async () => {
    // The form submission is handled by DemographicsStep's internal onSubmit
    // This onNext is for RecipeStepLayout to potentially trigger that submit
    // We can achieve this by ensuring the Next button in RecipeStepLayout
    // has type="submit" and targets the form in DemographicsStep.
    // Or, DemographicsStep can expose a submit function to be called here.
    // For now, assuming RecipeStepLayout's button can submit the form.
    // No direct navigation here; DemographicsStep handles it after successful API call.
  }, []);


  const onNextCauses = useCallback(async () => {
    // Logic from CausesStep's handleSubmit will be invoked by its form being submitted.
    // CausesStep handles navigation after successful API call.
  }, []);

  const onNextSymptoms = useCallback(async () => {
    // Logic from SymptomsStep's handleSubmit.
    // SymptomsStep handles navigation after successful API call.
  }, []);
  
  const onNextProperties = useCallback(async () => {
    // Logic from PropertiesOilsStep's handleSubmit.
    alert("Próxima etapa: Geração da Receita (Em Desenvolvimento)");
  }, []);


  const getNavProps = useCallback(() => {
    const basePath = "/create-recipe";
    switch(step) {
      case 'demographics':
        return {
          previousRoute: '/',
          onNext: undefined, // Form submission handled by DemographicsStep itself
          isNextDisabled: !isFormValid, // Disable if form in DemographicsStep is invalid
        };
      case 'causes':
        return {
          previousRoute: `${basePath}/demographics`,
          onNext: undefined, // Form submission handled by CausesStep
          isNextDisabled: !isFormValid, // Use isFormValid from context
        };
      case 'symptoms':
        return {
          previousRoute: `${basePath}/causes`,
          onNext: undefined, // Form submission handled by SymptomsStep
          isNextDisabled: !isFormValid, // Use isFormValid from context
        }
      case 'properties':
        return {
            previousRoute: `${basePath}/symptoms`,
            onNext: onNextProperties,
            nextButtonText: "Gerar Receita (Em Breve)", // Updated text
            isNextDisabled: formData.isLoading, // Disable if oils are still being fetched
        }
      default:
        return {
            previousRoute: '/',
            isNextDisabled: true,
        };
    }
  }, [step, isFormValid, formData.isLoading, onNextProperties]);

  if (!step || !StepComponent) {
    return <p className="text-center mt-10">Passo inválido ou não encontrado.</p>;
  }
  
  const navProps = getNavProps();

  return (
    <RecipeStepLayout 
        stepTitle={stepTitle}
        previousRoute={navProps.previousRoute}
        onNext={navProps.onNext} // Pass the onNext handler
        nextButtonText={navProps.nextButtonText}
        isNextDisabled={navProps.isNextDisabled} // Control button state
        formId={step === 'demographics' || step === 'causes' || step === 'symptoms' ? 'current-step-form' : undefined} // Link button to form
    >
      <StepComponent />
    </RecipeStepLayout>
  );
};

export default CreateRecipeStepPage;
