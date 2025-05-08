// src/components/recipe-flow/SymptomsStep.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getMedicalProperties } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext';
import { cn } from '@/lib/utils';

interface PotentialSymptom {
  symptom_name: string;
  symptom_suggestion: string;
  explanation: string;
  id?: string;
}

const SymptomsStep: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError, updateFormValidity } = useRecipeForm();

  const [selectedSymptomsState, setSelectedSymptomsState] = useState<Pick<PotentialSymptom, 'symptom_name'>[]>(
    formData.selectedSymptoms || []
  );
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  useEffect(() => {
    if (formData.selectedSymptoms) {
      setSelectedSymptomsState(formData.selectedSymptoms);
    }
  }, [formData.selectedSymptoms]);

  // Synchronize accordion open state with selected symptoms
  useEffect(() => {
    const newOpenItems = selectedSymptomsState.map(symptom => symptom.symptom_name).filter(Boolean) as string[];
     // Basic check to prevent re-setting identical array
    if (JSON.stringify(openAccordionItems.sort()) !== JSON.stringify(newOpenItems.sort())) {
        setOpenAccordionItems(newOpenItems);
    }
  }, [selectedSymptomsState, openAccordionItems]);


  useEffect(() => {
    updateFormValidity(selectedSymptomsState.length > 0);
  }, [selectedSymptomsState, updateFormValidity]);


  const handleSelectionToggle = useCallback((toggledSymptom: PotentialSymptom, newCheckedState: boolean) => {
    setSelectedSymptomsState(prevSelected => {
      const symptomId = toggledSymptom.symptom_name;
      if (newCheckedState) { // If switch is now checked
        // Add if not already present
        if (prevSelected.some(s => s.symptom_name === symptomId)) return prevSelected;
        return [...prevSelected, { symptom_name: symptomId }];
      } else { // If switch is now unchecked
        // Remove if present
        return prevSelected.filter(s => s.symptom_name !== symptomId);
      }
    });
  }, []);


  const handleSubmitSymptoms = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    if (selectedSymptomsState.length === 0) {
        setError("Por favor, selecione ao menos um sintoma.");
        return;
    }
    updateFormData({ selectedSymptoms: selectedSymptomsState });

    setIsLoading(true);
    setError(null);
    try {
      if (!formData.healthConcern || !formData.gender || !formData.ageCategory || !formData.ageSpecific || !formData.selectedCauses) {
        throw new Error("Dados demográficos, problema de saúde ou causas selecionadas faltando.");
      }
      const apiPayload = {
        healthConcern: formData.healthConcern,
        gender: formData.gender,
        ageCategory: formData.ageCategory,
        ageSpecific: formData.ageSpecific,
        selectedCauses: formData.selectedCauses,
        selectedSymptoms: selectedSymptomsState,
      };
      const medicalProperties = await getMedicalProperties(apiPayload);
      updateFormData({ medicalPropertiesResult: medicalProperties });
      setCurrentStep('properties');
      router.push('/create-recipe/properties');
    } catch (apiError: any) {
      setError(apiError.message || "Falha ao buscar propriedades médicas.");
      console.error("API Error in SymptomsStep:", apiError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData.potentialSymptomsResult) {
    return <p className="px-4 sm:px-6 md:px-0">Carregando sintomas... Se demorar, volte e tente novamente.</p>;
  }

  return (
    <form id="current-step-form" onSubmit={handleSubmitSymptoms} className="space-y-0">
      <Accordion
        type="multiple"
        value={openAccordionItems}
        onValueChange={setOpenAccordionItems}
        className="w-full" 
      >
        {formData.potentialSymptomsResult.map((symptom) => {
          const symptomId = symptom.symptom_name;
          const isChecked = selectedSymptomsState.some(s => s.symptom_name === symptomId);
          return (
            <AccordionItem
              value={symptomId}
              key={symptomId}
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
                    id={`symptom-switch-${symptomId}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      handleSelectionToggle(symptom, checked);
                    }}
                    className="shrink-0 h-4 w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-3 [&>span]:w-3 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0"
                    aria-labelledby={`symptom-label-${symptomId}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={`symptom-switch-${symptomId}`}
                    id={`symptom-label-${symptomId}`}
                    className="font-medium text-base cursor-pointer flex-1 truncate"
                     onClick={(e) => {
                        e.stopPropagation(); 
                        handleSelectionToggle(symptom, !isChecked); 
                    }}
                  >
                    {symptom.symptom_name}
                  </Label>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-background/50 md:bg-card">
                <p className="text-sm text-muted-foreground">{symptom.symptom_suggestion}</p>
                <p className="text-xs text-muted-foreground/80">{symptom.explanation}</p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </form>
  );
};

export default SymptomsStep;
