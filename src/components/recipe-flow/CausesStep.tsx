
// src/components/recipe-flow/CausesStep.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
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
  
  const [selectedCausesState, setSelectedCausesState] = useState<string[]>(formData.selectedCauses?.map(c => c.cause_name) || []);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(formData.selectedCauses?.map(c => c.cause_name) || []);
  
  // Ensure potentialCausesResult is not null
  const potentialCauses = formData.potentialCausesResult || [];

  useEffect(() => {
    if (formData.selectedCauses) {
      const currentSelectedNames = selectedCausesState.sort();
      const formSelectedNames = formData.selectedCauses.map(c => c.cause_name).sort();
      if (JSON.stringify(currentSelectedNames) !== JSON.stringify(formSelectedNames)) {
        setSelectedCausesState(formData.selectedCauses.map(c => c.cause_name));
      }
      const newOpenItems = formData.selectedCauses.map(c => c.cause_name).filter(Boolean);
      if (JSON.stringify(openAccordionItems.sort()) !== JSON.stringify(newOpenItems.sort())) {
          setOpenAccordionItems(newOpenItems);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.selectedCauses]);


  useEffect(() => {
    updateFormValidity(selectedCausesState.length > 0);
  }, [selectedCausesState, updateFormValidity]);

  const handleSelectionToggle = useCallback((toggledCause: PotentialCause, isChecked: boolean) => {
    const causeId = toggledCause.cause_name;
    setSelectedCausesState(prevSelected =>
      isChecked ? [...prevSelected, causeId] : prevSelected.filter(id => id !== causeId)
    );
    
    if (isChecked) {
      setOpenAccordionItems(prevOpen => [...new Set([...prevOpen, causeId])]);  
    } else {
      // Only close if it was open due to this item
      setOpenAccordionItems(prevOpen => prevOpen.filter(id => id !== causeId)); 
    }
  }, []);

  const handleTriggerClick = useCallback((causeId: string) => {
    setOpenAccordionItems(prevOpen =>
      prevOpen.includes(causeId) ? prevOpen.filter(id => id !== causeId) : [...prevOpen, causeId]
    );
  }, []);


  const handleSubmitCauses = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    if (selectedCausesState.length === 0) {
        setError("Por favor, selecione ao menos uma causa.");
        return;
    }
    
    // Ensure potentialCausesResult is not null
    const potentialCauses = formData.potentialCausesResult || [];
    const selectedCauses = potentialCauses.filter(cause => selectedCausesState.includes(cause.cause_name));
    updateFormData({ selectedCauses });

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
        selectedCauses: selectedCauses,
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

  if (!formData.potentialCausesResult || formData.potentialCausesResult.length === 0) {
    return <p className="px-4 sm:px-6 md:px-0">Carregando causas... Se demorar, volte e tente novamente.</p>;
  }

  return (
    <form id="current-step-form" onSubmit={handleSubmitCauses} className="space-y-0">
      <div className="w-full md:space-y-2">
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={setOpenAccordionItems}
          className="w-full rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
        >
          {potentialCauses.map((cause, index) => {
            const causeId = cause.cause_name;
            const isChecked = selectedCausesState.includes(causeId);
            return (
              <AccordionItem
                value={causeId}
                key={causeId}
                className={cn(
                  "transition-colors",
                  index !== 0 && "border-t", 
                  isChecked ? "bg-primary/10" : "bg-card"
                )}
              >
                {/* Custom header layout */}
                <AccordionPrimitive.Header className="flex">
                  <div className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                    isChecked ? "hover:bg-primary/15" : "hover:bg-muted/50"
                  )}>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Switch
                        id={`cause-switch-${causeId}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleSelectionToggle(cause, checked)}
                        className="shrink-0 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        aria-labelledby={`cause-label-${causeId}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <AccordionTrigger
                        onClick={() => handleTriggerClick(causeId)}
                        className={cn(
                          "p-0 flex-1 text-left hover:no-underline",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
                        )}
                        showChevron={false}
                      >
                        <Label
                          htmlFor={`cause-switch-${causeId}`}
                          id={`cause-label-${causeId}`}
                          className="font-medium text-base cursor-pointer flex-1 truncate"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent AccordionTrigger's onClick
                            handleSelectionToggle(cause, !isChecked);
                          }}
                        >
                          {cause.cause_name}
                        </Label>
                      </AccordionTrigger>
                    </div>
                  </div>
                </AccordionPrimitive.Header>
                <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-card/50">
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
