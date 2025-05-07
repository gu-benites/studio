
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
      // If there are pre-selected causes, open their accordions
      const preSelectedCauseNames = formData.selectedCauses.map(c => c.cause_name);
      setOpenAccordionItems(prevOpen => {
        const newOpen = new Set([...prevOpen, ...preSelectedCauseNames]);
        return Array.from(newOpen);
      });
    }
  }, [formData.selectedCauses]);

  useEffect(() => {
    updateFormValidity(selectedCausesState.length > 0);
  }, [selectedCausesState, updateFormValidity]);

  const handleToggleCauseSelection = (cause: PotentialCause) => {
    const causeId = cause.cause_name;
    const isCurrentlySelected = selectedCausesState.some(c => c.cause_name === causeId);

    let newSelectedCauses: PotentialCause[];
    if (isCurrentlySelected) {
      newSelectedCauses = selectedCausesState.filter(c => c.cause_name !== causeId);
    } else {
      newSelectedCauses = [...selectedCausesState, cause];
    }
    setSelectedCausesState(newSelectedCauses);

    // If item is being selected and its accordion is closed, open it
    if (!isCurrentlySelected && !openAccordionItems.includes(causeId)) {
      setOpenAccordionItems(prev => [...prev, causeId]);
    }
  };

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
    return <p>Carregando causas... Se demorar, volte e tente novamente.</p>;
  }
  
  return (
    <form id="current-step-form" onSubmit={handleSubmitCauses} className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Selecione as causas que você acredita estarem relacionadas ao seu problema de saúde. Clique no título para ver mais detalhes.
      </p>
      <Accordion 
        type="multiple" 
        value={openAccordionItems} 
        onValueChange={setOpenAccordionItems} 
        className="w-full space-y-2"
      >
        {formData.potentialCausesResult.map((cause) => {
          const causeId = cause.cause_name; // Using cause_name as unique ID
          const isChecked = selectedCausesState.some(c => c.cause_name === causeId);
          return (
            <AccordionItem 
              value={causeId} 
              key={causeId} 
              className={cn(
                "border rounded-lg overflow-hidden shadow-sm transition-all",
                isChecked ? "border-primary bg-primary/5" : "bg-card",
                openAccordionItems.includes(causeId) && !isChecked ? "bg-muted/20" : ""
              )}
            >
              <AccordionTrigger 
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card transition-colors",
                  openAccordionItems.includes(causeId) ? "hover:bg-muted/30" : "hover:bg-muted/20",
                  isChecked && openAccordionItems.includes(causeId) ? "bg-primary/10 hover:bg-primary/15" : "",
                  isChecked && !openAccordionItems.includes(causeId) ? "hover:bg-primary/10" : ""
                )}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Checkbox
                    id={`cause-checkbox-${causeId}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleCauseSelection(cause)}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 border-muted-foreground data-[state=checked]:border-primary"
                    aria-labelledby={`cause-label-${causeId}`}
                  />
                  <Label
                    htmlFor={`cause-checkbox-${causeId}`}
                    id={`cause-label-${causeId}`}
                    className="font-medium text-base cursor-pointer flex-1 truncate"
                    onClick={(e) => {
                        e.stopPropagation();
                        const checkbox = document.getElementById(`cause-checkbox-${causeId}`) as HTMLButtonElement | null;
                        if (checkbox) {
                            checkbox.click(); // Toggles checkbox
                             // If selecting and accordion is closed, open it.
                            if (!isChecked && !openAccordionItems.includes(causeId)) {
                                setOpenAccordionItems(prev => [...prev, causeId]);
                            }
                        }
                    }}
                  >
                    {cause.cause_name}
                  </Label>
                </div>
                {/* Chevron is part of AccordionTrigger */}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-1 space-y-1">
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

