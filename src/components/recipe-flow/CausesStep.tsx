
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getPotentialSymptoms } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

interface PotentialCause {
  cause_name: string;
  cause_suggestion: string;
  explanation: string;
  id?: string; 
}

const CausesStep: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError, updateFormValidity } = useRecipeForm();
  const [selectedCausesState, setSelectedCausesState] = useState<PotentialCause[]>(formData.selectedCauses || []);

  useEffect(() => {
    if (formData.selectedCauses) {
      setSelectedCausesState(formData.selectedCauses);
    }
  }, [formData.selectedCauses]);

  useEffect(() => {
    // Update form validity in context based on whether at least one cause is selected
    updateFormValidity(selectedCausesState.length > 0);
  }, [selectedCausesState, updateFormValidity]);

  const handleToggleCause = (cause: PotentialCause) => {
    setSelectedCausesState((prevSelected) => {
      const causeId = cause.id || cause.cause_name;
      const isSelected = prevSelected.some(c => (c.id || c.cause_name) === causeId);
      if (isSelected) {
        return prevSelected.filter(c => (c.id || c.cause_name) !== causeId);
      } else {
        return [...prevSelected, cause];
      }
    });
  };

  const handleSubmitCauses = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault(); // Prevent default if called by form submission
    
    if (selectedCausesState.length === 0) {
        setError("Por favor, selecione ao menos uma causa.");
        return;
    }
    
    updateFormData({ selectedCauses: selectedCausesState });
    
    setIsLoading(true);
    setError(null);
    try {
       if (!formData.healthConcern || !formData.gender || !formData.ageCategory || !formData.ageSpecific) {
        throw new Error("Dados demográficos ou problema de saúde faltando.");
      }
      const apiPayload = {
        healthConcern: formData.healthConcern,
        gender: formData.gender,
        ageCategory: formData.ageCategory,
        ageSpecific: formData.ageSpecific,
        selectedCauses: selectedCausesState,
      };
      const potentialSymptoms = await getPotentialSymptoms(apiPayload);
      updateFormData({ potentialSymptomsResult: potentialSymptoms });
      setCurrentStep('symptoms');
      router.push('/create-recipe/symptoms');
    } catch (apiError: any) {
      setError(apiError.message || "Falha ao buscar sintomas potenciais.");
      console.error("API Error in CausesStep:", apiError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData.potentialCausesResult) {
    return <p>Carregando causas... Se demorar, volte e tente novamente.</p>;
  }
  
  return (
    <form id="current-step-form" onSubmit={handleSubmitCauses} className="space-y-6">
      <p className="text-muted-foreground">
        Selecione as causas que você acredita estarem relacionadas ao seu problema de saúde.
      </p>
      <div className="space-y-4">
        {formData.potentialCausesResult.map((cause) => {
          const causeId = cause.id || cause.cause_name;
          const isChecked = selectedCausesState.some(c => (c.id || c.cause_name) === causeId);
          return (
            <div key={causeId} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`cause-${causeId}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggleCause(cause)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`cause-${causeId}`}
                    className="text-base font-medium cursor-pointer"
                  >
                    {cause.cause_name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{cause.cause_suggestion}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cause.explanation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* The actual submit button is in RecipeStepLayout. This form will be submitted by it. */}
    </form>
  );
};

export default CausesStep;
