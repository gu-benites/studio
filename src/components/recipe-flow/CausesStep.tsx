
// src/components/recipe-flow/CausesStep.tsx
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
  const { 
    formData, 
    updateFormData, 
    setCurrentStep, 
    setIsLoading, // General loading state
    setIsFetchingNextStepData, // Specific for step transitions
    setLoadingScreenTargetStepKey, // To specify messages for LoadingScreen
    setError, 
    updateFormValidity 
  } = useRecipeForm();
  
  const [selectedCausesState, setSelectedCausesState] = useState<PotentialCause[]>(formData.selectedCauses || []);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(formData.selectedCauses?.map(c => c.cause_name) || []);

  useEffect(() => {
    if (formData.selectedCauses) {
      const currentSelectedNames = selectedCausesState.map(c => c.cause_name).sort();
      const formSelectedNames = formData.selectedCauses.map(c => c.cause_name).sort();
      if (JSON.stringify(currentSelectedNames) !== JSON.stringify(formSelectedNames)) {
        setSelectedCausesState(formData.selectedCauses);
      }
      const newOpenItems = formData.selectedCauses.map(c => c.cause_name).filter(Boolean) as string[];
      if (JSON.stringify(openAccordionItems.sort()) !== JSON.stringify(newOpenItems.sort())) {
          setOpenAccordionItems(newOpenItems);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.selectedCauses]);


  useEffect(() => {
    updateFormValidity(selectedCausesState.length > 0);
  }, [selectedCausesState, updateFormValidity]);

  const handleSelectionToggle = useCallback((toggledCause: PotentialCause, newCheckedState: boolean) => {
    const causeId = toggledCause.cause_name;
    setSelectedCausesState(prevSelected => {
      if (newCheckedState) {
        if (prevSelected.some(c => c.cause_name === causeId)) return prevSelected;
        return [...prevSelected, toggledCause];
      } else {
        return prevSelected.filter(c => c.cause_name !== causeId);
      }
    });
    
    setOpenAccordionItems(prevOpen => {
      if (newCheckedState) {
        return [...new Set([...prevOpen, causeId])]; 
      } else {
        return prevOpen.filter(id => id !== causeId);
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

    setIsFetchingNextStepData(true); 
    setLoadingScreenTargetStepKey('symptoms');
    setError(null);

    // Navigate immediately
    router.push('/create-recipe/symptoms');
    setCurrentStep('symptoms'); 

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
    } catch (apiError: any) {
      setError(apiError.message || "Falha ao buscar sintomas potenciais.");
      console.error("API Error in CausesStep:", apiError);
    } finally {
      setIsFetchingNextStepData(false);
      // setLoadingScreenTargetStepKey(null); 
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
        className="w-full md:space-y-2"
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
                "md:border md:rounded-lg md:first:rounded-t-lg md:last:rounded-b-lg md:overflow-hidden",
                isChecked ? "bg-primary/10" : "bg-background md:bg-card"
              )}
            >
              <AccordionTrigger
                onClick={() => handleSelectionToggle(cause, !isChecked)}
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
                    onClick={(e) => e.stopPropagation()} 
                  />
                  <Label
                    htmlFor={`cause-switch-${causeId}`}
                    id={`cause-label-${causeId}`}
                    className="font-medium text-base cursor-pointer flex-1 truncate"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelectionToggle(cause, !isChecked);
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
