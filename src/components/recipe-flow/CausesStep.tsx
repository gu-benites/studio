// src/components/recipe-flow/CausesStep.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getPotentialSymptoms } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext'; // Assuming PotentialCause is defined here or imported
import { cn } from '@/lib/utils';

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
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  useEffect(() => {
    if (formData.selectedCauses) {
      setSelectedCausesState(formData.selectedCauses);
    }
  }, [formData.selectedCauses]);

  // Synchronize accordion open state with selected causes
  useEffect(() => {
    const newOpenItems = selectedCausesState.map(cause => cause.cause_name).filter(Boolean) as string[];
    // Basic check to prevent re-setting identical array (though sort makes it more robust for content check)
    if (JSON.stringify(openAccordionItems.sort()) !== JSON.stringify(newOpenItems.sort())) {
      setOpenAccordionItems(newOpenItems);
    }
  }, [selectedCausesState, openAccordionItems]); // openAccordionItems added to prevent stale closures if setOpenAccordionItems was directly called elsewhere based on old openAccordionItems


  useEffect(() => {
    updateFormValidity(selectedCausesState.length > 0);
  }, [selectedCausesState, updateFormValidity]);

  const handleSelectionToggle = useCallback((toggledCause: PotentialCause, newCheckedState: boolean) => {
    setSelectedCausesState(prevSelected => {
      const causeId = toggledCause.cause_name;
      if (newCheckedState) { // If switch is now checked (or should be)
        // Add if not already present
        if (prevSelected.some(c => c.cause_name === causeId)) return prevSelected;
        return [...prevSelected, toggledCause];
      } else { // If switch is now unchecked (or should be)
        // Remove if present
        return prevSelected.filter(c => c.cause_name !== causeId);
      }
    });
  }, []);


  const handleSubmitCauses = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

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
    return <p className="px-4 sm:px-6 md:px-0">Carregando causas... Se demorar, volte e tente novamente.</p>;
  }

  return (
    <form id="current-step-form" onSubmit={handleSubmitCauses} className="space-y-0">
      <Accordion
        type="multiple"
        value={openAccordionItems}
        onValueChange={setOpenAccordionItems}
        className="w-full"
      >
        {formData.potentialCausesResult.map((cause) => {
          const causeId = cause.cause_name;
          const isChecked = selectedCausesState.some(c => c.cause_name === causeId);
          return (
            <AccordionItem
              value={causeId}
              key={causeId}
              className={cn(
                "transition-colors",
                "border-b border-border last:border-b-0",
                isChecked ? "bg-primary/10" : "bg-background md:bg-card", 
                "md:first:rounded-t-lg md:last:rounded-b-lg"
              )}
            >
              <AccordionTrigger
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors",
                  isChecked ? "hover:bg-primary/15" : "hover:bg-muted/50",
                  "focus-visible:ring-offset-background md:focus-visible:ring-offset-card"
                )}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Switch
                    id={`cause-switch-${causeId}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      handleSelectionToggle(cause, checked);
                    }}
                    className="shrink-0 h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-5 [&>span]:w-5 [&>span[data-state=checked]]:translate-x-5 [&>span[data-state=unchecked]]:translate-x-0"
                    aria-labelledby={`cause-label-${causeId}`}
                    onClick={(e) => e.stopPropagation()} // Prevent accordion trigger from toggling switch again
                  />
                  <Label
                    htmlFor={`cause-switch-${causeId}`}
                    id={`cause-label-${causeId}`}
                    className="font-medium text-base cursor-pointer flex-1 truncate"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent accordion trigger
                        handleSelectionToggle(cause, !isChecked); // Manually toggle state
                    }}
                  >
                    {cause.cause_name}
                  </Label>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-background/50 md:bg-card">
                <p className="text-sm text-muted-foreground">{cause.cause_suggestion}</p>
                <p className="text-xs text-muted-foreground/80">{cause.explanation}</p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </form>
  );
};

export default CausesStep;
