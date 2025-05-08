
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; 
import { Loader2, FlaskConical } from 'lucide-react'; 
import { getSuggestedOils } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext';
import { cn } from '@/lib/utils';

interface TherapeuticProperty {
  property_id: string;
  property_name: string;
  property_name_in_english: string;
  description: string;
  causes_addressed: string;
  symptoms_addressed: string;
  relevancy: number;
}

interface SuggestedOil {
  name_english: string;
  name_local_language: string;
  oil_description: string;
  relevancy: number;
}

interface SuggestedOilsForProperty {
  property_id: string;
  property_name: string; 
  property_name_in_english: string; 
  description: string; 
  suggested_oils: SuggestedOil[];
}


const PropertiesOilsStep: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError, resetFormData, isLoading: globalIsLoading } = useRecipeForm();
  
  // Local state to track which properties have had their oils fetched to avoid re-fetching
  const [oilsFetchedFor, setOilsFetchedFor] = useState<Record<string, boolean>>({});
  
  const therapeuticProperties = formData.medicalPropertiesResult?.therapeutic_properties || [];

  const fetchAllSuggestedOils = useCallback(async () => {
    if (therapeuticProperties.length === 0 || globalIsLoading) return;

    setIsLoading(true); // Use context's setIsLoading
    setError(null);
    const newSuggestedOilsByProperty: Record<string, SuggestedOilsForProperty> = { ...(formData.suggestedOilsByProperty || {}) };
    let anyError = false;
    let fetchOccurred = false;

    for (const prop of therapeuticProperties) {
      // Check if oils for this property are already fetched or if the property_id is already in newSuggestedOilsByProperty
      if (oilsFetchedFor[prop.property_id] || (newSuggestedOilsByProperty[prop.property_id] && newSuggestedOilsByProperty[prop.property_id].suggested_oils.length > 0)) {
        continue; 
      }
      fetchOccurred = true;

      try {
        const oilsData = await getSuggestedOils(
            { healthConcern: formData.healthConcern, gender: formData.gender, ageCategory: formData.ageCategory, ageSpecific: formData.ageSpecific, selectedCauses: formData.selectedCauses, selectedSymptoms: formData.selectedSymptoms },
            prop
        );
        newSuggestedOilsByProperty[prop.property_id] = oilsData;
        setOilsFetchedFor(prev => ({ ...prev, [prop.property_id]: true }));
      } catch (apiError: any) {
        console.error(`Error fetching oils for property ${prop.property_name}:`, apiError);
        // Set a more general error if multiple fetches fail, or handle per-property errors if needed
        setError(`Falha ao buscar óleos para ${prop.property_name}.`);
        anyError = true;
      }
    }
    
    if(fetchOccurred){
        updateFormData({ suggestedOilsByProperty: newSuggestedOilsByProperty });
    }
    setIsLoading(false); // Use context's setIsLoading
  }, [
      therapeuticProperties, 
      globalIsLoading, 
      setIsLoading, 
      setError, 
      formData.healthConcern, 
      formData.gender, 
      formData.ageCategory, 
      formData.ageSpecific, 
      formData.selectedCauses, 
      formData.selectedSymptoms, 
      formData.suggestedOilsByProperty, 
      updateFormData, 
      oilsFetchedFor
    ]);

  useEffect(() => {
    // Fetch oils only if properties exist, not globally loading, and not all oils fetched
    const allOilsFetched = therapeuticProperties.every(prop => oilsFetchedFor[prop.property_id] || (formData.suggestedOilsByProperty && formData.suggestedOilsByProperty[prop.property_id]));
    if (therapeuticProperties.length > 0 && !globalIsLoading && !allOilsFetched) {
        fetchAllSuggestedOils();
    }
  }, [therapeuticProperties, fetchAllSuggestedOils, globalIsLoading, oilsFetchedFor, formData.suggestedOilsByProperty]);


  const handleSubmitNext = async () => {
    // Placeholder for future navigation to a final recipe display page
    // For now, this might just log or prepare data
    console.log("Final selected oils (to be implemented):", formData.suggestedOilsByProperty);
    // router.push('/create-recipe/final-recipe-summary'); // Example future route
    alert("Próxima etapa: Geração da Receita (Em Desenvolvimento)");
  };

  if (!formData.medicalPropertiesResult && !globalIsLoading) {
    return <p className="px-4 sm:px-6 md:px-0">Carregando propriedades terapêuticas... Se demorar, volte e tente novamente.</p>;
  }
  if (globalIsLoading && !formData.medicalPropertiesResult){
     return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3">Carregando dados das propriedades...</p>
      </div>
    );
  }


  return (
    <div className="space-y-0">
      {/* Instruction text is now part of RecipeStepLayout */}
      
      {formData.medicalPropertiesResult?.health_concern_in_english && (
        <p className={cn(
          "mt-1 text-sm text-muted-foreground mb-6",
          "px-4 sm:px-6 md:px-0" 
        )}>
          Problema de saúde (referência): <strong>{formData.medicalPropertiesResult.health_concern_in_english}</strong>
        </p>
      )}


      {globalIsLoading && therapeuticProperties.length > 0 && (!formData.suggestedOilsByProperty || Object.keys(formData.suggestedOilsByProperty).length < therapeuticProperties.length) && (
        <div className={cn(
          "flex items-center justify-center py-4",
          "px-4 sm:px-6 md:px-0" 
        )}>
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
          <p>Buscando óleos essenciais sugeridos...</p>
        </div>
      )}

      <Accordion type="multiple" className="w-full space-y-2">
        {therapeuticProperties.map((prop) => (
          <AccordionItem 
            value={prop.property_id} 
            key={prop.property_id} 
            className={cn(
              "border-b border-border last:border-b-0 data-[state=open]:bg-muted/30",
              "md:border md:rounded-lg md:first:rounded-t-lg md:last:rounded-b-lg md:overflow-hidden" // Desktop specific card-like styling
            )}
          >
            <AccordionTrigger className="hover:no-underline text-left px-4 py-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">{prop.property_name}</h3>
                <p className="text-xs text-muted-foreground">({prop.property_name_in_english}) - Relevância: {prop.relevancy}/5</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-4 space-y-3 bg-background/50 md:bg-card">
              <p className="text-sm">{prop.description}</p>
              {prop.causes_addressed && <p className="text-xs"><strong>Causas Endereçadas:</strong> {prop.causes_addressed}</p>}
              {prop.symptoms_addressed && <p className="text-xs"><strong>Sintomas Endereçados:</strong> {prop.symptoms_addressed}</p>}
              
              <div className="mt-3 pt-3 border-t">
                <h4 className="text-md font-semibold mb-2">Óleos Sugeridos:</h4>
                {globalIsLoading && !oilsFetchedFor[prop.property_id] && (!formData.suggestedOilsByProperty || !formData.suggestedOilsByProperty[prop.property_id]) && (
                     <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Buscando...
                    </div>
                )}
                {!globalIsLoading && formData.suggestedOilsByProperty && formData.suggestedOilsByProperty[prop.property_id] ? (
                  formData.suggestedOilsByProperty[prop.property_id].suggested_oils.length > 0 ? (
                    <ul className="space-y-2">
                      {formData.suggestedOilsByProperty[prop.property_id].suggested_oils.map(oil => (
                        <li key={oil.name_english} className="p-2 border rounded-md bg-background">
                           <div className="font-medium">{oil.name_local_language} ({oil.name_english}) <Badge variant="secondary" className="ml-1">Relevância: {oil.relevancy}/5</Badge></div>
                           <p className="text-xs text-muted-foreground">{oil.oil_description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">Nenhum óleo específico sugerido para esta propriedade.</p>
                ) : (
                  !globalIsLoading && oilsFetchedFor[prop.property_id] && <p className="text-sm text-muted-foreground">Nenhum óleo específico sugerido para esta propriedade.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* This button is intended to be clicked by RecipeStepLayout's "Next" button */}
      <button onClick={handleSubmitNext} className="hidden" aria-hidden="true" id="properties-oils-submit">
        Internal Submit Trigger for Layout
      </button>
    </div>
  );
};

export default PropertiesOilsStep;
