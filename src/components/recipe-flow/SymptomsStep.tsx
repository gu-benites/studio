
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getMedicalProperties } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

interface PotentialSymptom {
  symptom_name: string;
  symptom_suggestion: string;
  explanation: string;
  id?: string; // Using symptom_name as ID if id is not present
}

const SymptomsStep: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError } = useRecipeForm();
  
  // API for MedicalProperties expects an array of objects like { symptom_name: "..." }
  const [selectedSymptomsState, setSelectedSymptomsState] = useState<Pick<PotentialSymptom, 'symptom_name'>[]>(
    formData.selectedSymptoms || []
  );

  useEffect(() => {
    if (formData.selectedSymptoms) {
      setSelectedSymptomsState(formData.selectedSymptoms);
    }
  }, [formData.selectedSymptoms]);

  const handleToggleSymptom = (symptom: PotentialSymptom) => {
    setSelectedSymptomsState((prevSelected) => {
      const isSelected = prevSelected.some(s => s.symptom_name === symptom.symptom_name);
      if (isSelected) {
        return prevSelected.filter(s => s.symptom_name !== symptom.symptom_name);
      } else {
        // Store only the name as per API requirement for the next step
        return [...prevSelected, { symptom_name: symptom.symptom_name }];
      }
    });
  };

  const handleSubmit = async () => {
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
        selectedSymptoms: selectedSymptomsState, // This is already in the format [{ symptom_name: "..." }]
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
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Selecione os sintomas que você está experienciando.
      </p>
      <div className="space-y-4">
        {formData.potentialSymptomsResult.map((symptom) => {
          const symptomId = symptom.id || symptom.symptom_name;
          const isChecked = selectedSymptomsState.some(s => s.symptom_name === symptom.symptom_name);
          return (
            <div key={symptomId} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`symptom-${symptomId}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggleSymptom(symptom)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`symptom-${symptomId}`}
                    className="text-base font-medium cursor-pointer"
                  >
                    {symptom.symptom_name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{symptom.symptom_suggestion}</p>
                  <p className="text-xs text-muted-foreground mt-1">{symptom.explanation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={handleSubmit} className="hidden" aria-hidden="true">
        Internal Submit Trigger
      </button>
    </div>
  );
};

export default SymptomsStep;
