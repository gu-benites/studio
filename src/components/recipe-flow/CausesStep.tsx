"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getPotentialSymptoms } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext';
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
      const initiallyOpen = formData.selectedCauses.map(c => c.cause_name).filter(name => name != null) as string[];
      setOpenAccordionItems(Array.from(new Set(initiallyOpen)));
    }
  }, [formData.selectedCauses]);


  useEffect(() => {
    updateFormValidity(selectedCausesState.length > 0);
  }, [selectedCausesState, updateFormValidity]);

  const handleToggleCause = useCallback((toggledCause: PotentialCause) => {
    const causeId = toggledCause.cause_name;
    // Update selected causes
    setSelectedCausesState(prevSelected => {
        const isCurrentlySelected = prevSelected.some(c => c.cause_name === causeId);
        if (isCurrentlySelected) { // Means it's being turned OFF
            return prevSelected.filter(c => c.cause_name !== causeId);
        } else { // Means it's being turned ON
            return [...prevSelected, toggledCause];
        }
    });

    // Update open accordion items based on the new selection state
    setOpenAccordionItems(prevOpen => {
        const isNowSelected = !selectedCausesState.some(c => c.cause_name === causeId); // Check against previous state to determine new state
        if (isNowSelected) { // Turning ON
             // Open accordion: add if not present
            return [...new Set([...prevOpen, causeId])];
        } else { // Turning OFF
            // Close accordion: remove if present
            return prevOpen.filter(item => item !== causeId);
        }
    });
  }, [selectedCausesState]); // Depends on selectedCausesState to determine if it's turning on or off


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
    return <p className="px-4 sm:px-0">Carregando causas... Se demorar, volte e tente novamente.</p>;
  }

  return (
    <form id="current-step-form" onSubmit={handleSubmitCauses} className="space-y-3">
      <div className={cn(
        "bg-card rounded-lg border shadow-sm overflow-hidden",
        "-mx-4 sm:mx-0"
      )}>
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={setOpenAccordionItems}
          className="w-full"
        >
          {formData.potentialCausesResult.map((cause, index) => {
            const causeId = cause.cause_name;
            const isChecked = selectedCausesState.some(c => c.cause_name === causeId);
            return (
              <AccordionItem
                value={causeId}
                key={causeId}
                className={cn(
                  "transition-all",
                  isChecked ? "bg-primary/5" : "bg-card",
                  index === formData.potentialCausesResult!.length - 1 ? "border-b-0" : ""
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card transition-colors",
                    isChecked ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"
                  )}
                  onClick={(e) => {
                    // Prevent accordion toggle if click is on switch or label (handled by switch)
                    if ((e.target as HTMLElement).closest(`#cause-switch-${causeId}`) || (e.target as HTMLElement).closest(`#cause-label-${causeId}`)) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Switch
                      id={`cause-switch-${causeId}`}
                      checked={isChecked}
                      onCheckedChange={() => handleToggleCause(cause)}
                      className="shrink-0 h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-5 [&>span]:w-5 [&>span[data-state=checked]]:translate-x-5 [&>span[data-state=unchecked]]:translate-x-0"
                      aria-labelledby={`cause-label-${causeId}`}
                      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to AccordionTrigger
                    />
                    <Label
                      htmlFor={`cause-switch-${causeId}`}
                      id={`cause-label-${causeId}`}
                      className="font-medium text-base cursor-pointer flex-1 truncate"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling to AccordionTrigger
                        // Programmatically click the switch to ensure its onCheckedChange fires
                        document.getElementById(`cause-switch-${causeId}`)?.click();
                      }}
                    >
                      {cause.cause_name}
                    </Label>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-background/50">
                  <p className="text-sm text-muted-foreground">{cause.cause_suggestion}</p>
                  <p className="text-xs text-muted-foreground/80">{cause.explanation}</p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </form>
  );
};

export default CausesStep;
