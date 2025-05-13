
// src/components/recipe-flow/SymptomsStep.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
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

  const [selectedSymptomsState, setSelectedSymptomsState] = useState<Pick<PotentialSymptom, 'symptom_name'>[]>(
    formData.selectedSymptoms || []
  );
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(
    formData.selectedSymptoms?.map(s => s.symptom_name).filter(Boolean) as string[] || []
  );

  useEffect(() => {
    if (formData.selectedSymptoms) {
      const currentSelectedNames = selectedSymptomsState.map(s => s.symptom_name).sort();
      const formSelectedNames = formData.selectedSymptoms.map(s => s.symptom_name).sort();
      if (JSON.stringify(currentSelectedNames) !== JSON.stringify(formSelectedNames)) {
        setSelectedSymptomsState(formData.selectedSymptoms);
      }
      
      const newOpenItems = formData.selectedSymptoms.map(s => s.symptom_name).filter(Boolean) as string[];
      if (JSON.stringify(openAccordionItems.sort()) !== JSON.stringify(newOpenItems.sort())) {
        setOpenAccordionItems(newOpenItems);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.selectedSymptoms]);


  useEffect(() => {
    updateFormValidity(selectedSymptomsState.length > 0);
  }, [selectedSymptomsState, updateFormValidity]);


  const handleSelectionToggle = useCallback((toggledSymptom: PotentialSymptom, newCheckedState: boolean) => {
    const symptomId = toggledSymptom.symptom_name;
    setSelectedSymptomsState(prevSelected => {
      if (newCheckedState) {
        if (prevSelected.some(s => s.symptom_name === symptomId)) return prevSelected;
        return [...prevSelected, { symptom_name: symptomId }];
      } else {
        return prevSelected.filter(s => s.symptom_name !== symptomId);
      }
    });
    setOpenAccordionItems(prevOpen => {
        if (newCheckedState) {
            return [...new Set([...prevOpen, symptomId])];
        } else {
            return prevOpen.filter(id => id !== symptomId);
        }
    });
  }, []);

  const handleTriggerClick = useCallback((symptomId: string) => {
    setOpenAccordionItems(prevOpen =>
      prevOpen.includes(symptomId) ? prevOpen.filter(id => id !== symptomId) : [...prevOpen, symptomId]
    );
  }, []);


  const handleSubmitSymptoms = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    if (selectedSymptomsState.length === 0) {
        setError("Por favor, selecione ao menos um sintoma.");
        return;
    }
    updateFormData({ selectedSymptoms: selectedSymptomsState });

    setIsFetchingNextStepData(true);
    setLoadingScreenTargetStepKey('properties');
    setError(null);

    router.push('/create-recipe/properties');
    setCurrentStep('properties');

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
    } catch (apiError: any) {
      setError(apiError.message || "Falha ao buscar propriedades médicas.");
      console.error("API Error in SymptomsStep:", apiError);
    } finally {
      setIsFetchingNextStepData(false);
      // setLoadingScreenTargetStepKey(null); 
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
        className="w-full rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
      >
        {formData.potentialSymptomsResult.map((symptom, index) => {
          const symptomId = symptom.symptom_name;
          const isChecked = selectedSymptomsState.some(s => s.symptom_name === symptomId);
          return (
            <AccordionItem
              value={symptomId}
              key={symptomId}
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
                      id={`symptom-switch-${symptomId}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleSelectionToggle(symptom, checked)}
                      className="shrink-0 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                      aria-labelledby={`symptom-label-${symptomId}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <AccordionTrigger
                      onClick={() => handleTriggerClick(symptomId)}
                      className={cn(
                        "p-0 flex-1 text-left hover:no-underline",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
                      )}
                      showChevron={false}
                    >
                      <Label
                        htmlFor={`symptom-switch-${symptomId}`}
                        id={`symptom-label-${symptomId}`}
                        className="font-medium text-base cursor-pointer flex-1 truncate"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent AccordionTrigger's onClick
                          handleSelectionToggle(symptom, !isChecked);
                        }}
                      >
                        {symptom.symptom_name}
                      </Label>
                    </AccordionTrigger>
                  </div>
                </div>
              </AccordionPrimitive.Header>
              <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-card/50">
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
