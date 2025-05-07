
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

  const handleToggleCause = useCallback((cause: PotentialCause) => {
    setSelectedCausesState(prevSelected => {
      const isCurrentlySelected = prevSelected.some(c => c.cause_name === cause.cause_name);
      let newSelectedCauses;
      let newOpenItems = [...openAccordionItems];

      if (isCurrentlySelected) {
        newSelectedCauses = prevSelected.filter(c => c.cause_name !== cause.cause_name);
        // When deselecting, also close its accordion item
        newOpenItems = newOpenItems.filter(item => item !== cause.cause_name);
      } else {
        newSelectedCauses = [...prevSelected, cause];
        // When selecting, also open its accordion item if not already open
        if (!newOpenItems.includes(cause.cause_name)) {
          newOpenItems.push(cause.cause_name);
        }
      }
      setOpenAccordionItems(newOpenItems);
      return newSelectedCauses;
    });
  }, [openAccordionItems]);


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
        "bg-card rounded-lg border shadow-lg overflow-hidden",
        "-mx-4 sm:mx-0" // Negative margin for mobile to be edge-to-edge within px-4 container, mx-0 for sm+
      )}>
        <Accordion 
          type="multiple" 
          value={openAccordionItems} 
          onValueChange={setOpenAccordionItems} // Allows accordion to be controlled independently by user clicks on trigger
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
                  isChecked ? "bg-primary/5" : "bg-card", // Keep bg-card for non-checked
                  index === formData.potentialCausesResult!.length - 1 ? "border-b-0" : ""
                )}
              >
                <AccordionTrigger 
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card transition-colors",
                    isChecked ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50" 
                  )}
                  // AccordionTrigger now directly toggles its own open state
                  // Switch interaction is separate
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Switch
                      id={`cause-switch-${causeId}`}
                      checked={isChecked}
                      onCheckedChange={() => handleToggleCause(cause)} // Use unified toggle handler
                      className="shrink-0 h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-5 [&>span]:w-5 [&>span[data-state=checked]]:translate-x-5 [&>span[data-state=unchecked]]:translate-x-0"
                      aria-labelledby={`cause-label-${causeId}`}
                    />
                    <Label
                      htmlFor={`cause-switch-${causeId}`}
                      id={`cause-label-${causeId}`}
                      className="font-medium text-base cursor-pointer flex-1 truncate"
                      onClick={(e) => {
                        // Allow label click to toggle switch
                        // handleToggleCause(cause) is handled by onCheckedChange of Switch
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
