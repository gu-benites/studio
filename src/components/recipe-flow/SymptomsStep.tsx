"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
      // Open accordions for already selected symptoms when the component mounts or formData.selectedSymptoms changes
      const preSelectedSymptomNames = formData.selectedSymptoms.map(s => s.symptom_name);
      setOpenAccordionItems(prevOpen => {
        const newOpen = new Set([...prevOpen, ...preSelectedSymptomNames]);
        return Array.from(newOpen);
      });
    }
  }, [formData.selectedSymptoms]);

  useEffect(() => {
    updateFormValidity(selectedSymptomsState.length > 0);
  }, [selectedSymptomsState, updateFormValidity]);

  const handleToggleSymptomSelection = (symptom: PotentialSymptom) => {
    const symptomId = symptom.symptom_name;
    const isCurrentlySelected = selectedSymptomsState.some(s => s.symptom_name === symptomId);

    let newSelectedSymptoms: Pick<PotentialSymptom, 'symptom_name'>[];
    if (isCurrentlySelected) {
      newSelectedSymptoms = selectedSymptomsState.filter(s => s.symptom_name !== symptomId);
      // If item is being deselected, close its accordion
      setOpenAccordionItems(prev => prev.filter(item => item !== symptomId));
    } else {
      newSelectedSymptoms = [...selectedSymptomsState, { symptom_name: symptom.symptom_name }];
      // If item is being selected and its accordion is closed, open it
      if (!openAccordionItems.includes(symptomId)) {
        setOpenAccordionItems(prev => [...prev, symptomId]);
      }
    }
    setSelectedSymptomsState(newSelectedSymptoms);
  };

  const handleAccordionToggle = (value: string[]) => {
    setOpenAccordionItems(value);
  };

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
    return <p>Carregando sintomas... Se demorar, volte e tente novamente.</p>;
  }

  return (
    <form id="current-step-form" onSubmit={handleSubmitSymptoms} className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Selecione os sintomas que você está experienciando. Clique no título para ver mais detalhes.
      </p>
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <Accordion 
          type="multiple" 
          value={openAccordionItems} 
          onValueChange={handleAccordionToggle}
          className="w-full"
        >
          {formData.potentialSymptomsResult.map((symptom, index) => {
            const symptomId = symptom.symptom_name; 
            const isChecked = selectedSymptomsState.some(s => s.symptom_name === symptomId);
            return (
              <AccordionItem 
                value={symptomId} 
                key={symptomId} 
                className={cn(
                  "transition-all",
                  isChecked ? "bg-primary/5" : "bg-card",
                  openAccordionItems.includes(symptomId) && !isChecked ? "bg-muted/5" : "",
                   index === formData.potentialSymptomsResult!.length - 1 ? "border-b-0" : ""
                )}
              >
                <AccordionTrigger 
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card transition-colors",
                    openAccordionItems.includes(symptomId) ? "hover:bg-muted/10" : "hover:bg-muted/5",
                    isChecked && openAccordionItems.includes(symptomId) ? "bg-primary/10 hover:bg-primary/15" : "",
                    isChecked && !openAccordionItems.includes(symptomId) ? "hover:bg-primary/10" : ""
                  )}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Checkbox
                      id={`symptom-checkbox-${symptomId}`}
                      checked={isChecked}
                      onCheckedChange={() => handleToggleSymptomSelection(symptom)}
                      onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                      className="shrink-0 border-muted-foreground data-[state=checked]:border-primary"
                      aria-labelledby={`symptom-label-${symptomId}`}
                    />
                    <Label
                      htmlFor={`symptom-checkbox-${symptomId}`}
                      id={`symptom-label-${symptomId}`}
                      className="font-medium text-base cursor-pointer flex-1 truncate"
                      onClick={(e) => {
                          e.stopPropagation(); // Prevent accordion toggle
                          handleToggleSymptomSelection(symptom);
                      }}
                    >
                      {symptom.symptom_name}
                    </Label>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-background">
                  <p className="text-sm text-muted-foreground">{symptom.symptom_suggestion}</p>
                  <p className="text-xs text-muted-foreground/80">{symptom.explanation}</p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </form>
  );
};

export default SymptomsStep;
