
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Import Button
import { Loader2, FlaskConical, RotateCcw } from 'lucide-react'; // Added RotateCcw for start over
import { getSuggestedOils } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

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
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError, resetFormData } = useRecipeForm();
  
  const [isFetchingOils, setIsFetchingOils] = useState(false);
  const [oilsFetchedFor, setOilsFetchedFor] = useState<Record<string, boolean>>({});
  
  const therapeuticProperties = formData.medicalPropertiesResult?.therapeutic_properties || [];

  const fetchAllSuggestedOils = useCallback(async () => {
    if (therapeuticProperties.length === 0 || isFetchingOils) return;

    setIsFetchingOils(true);
    setError(null);
    const newSuggestedOilsByProperty: Record<string, SuggestedOilsForProperty> = { ...(formData.suggestedOilsByProperty || {}) };
    let anyError = false;

    for (const prop of therapeuticProperties) {
      if (oilsFetchedFor[prop.property_id] || newSuggestedOilsByProperty[prop.property_id]) continue; 

      try {
        const oilsData = await getSuggestedOils(
            { healthConcern: formData.healthConcern, gender: formData.gender, ageCategory: formData.ageCategory, ageSpecific: formData.ageSpecific, selectedCauses: formData.selectedCauses, selectedSymptoms: formData.selectedSymptoms },
            prop
        );
        newSuggestedOilsByProperty[prop.property_id] = oilsData;
        setOilsFetchedFor(prev => ({ ...prev, [prop.property_id]: true }));
      } catch (apiError: any) {
        console.error(`Error fetching oils for property ${prop.property_name}:`, apiError);
        setError(`Falha ao buscar óleos para ${prop.property_name}.`);
        anyError = true;
      }
    }
    updateFormData({ suggestedOilsByProperty: newSuggestedOilsByProperty });
    setIsFetchingOils(false);
  }, [therapeuticProperties, formData.healthConcern, formData.gender, formData.ageCategory, formData.ageSpecific, formData.selectedCauses, formData.selectedSymptoms, formData.suggestedOilsByProperty, updateFormData, setError, oilsFetchedFor, isFetchingOils]);

  useEffect(() => {
    // Only fetch if not already fetching and properties are available
    if (therapeuticProperties.length > 0 && !isFetchingOils && Object.keys(oilsFetchedFor).length < therapeuticProperties.length) {
        fetchAllSuggestedOils();
    }
  }, [therapeuticProperties, fetchAllSuggestedOils, isFetchingOils, oilsFetchedFor]);


  const handleSubmitNext = async () => {
    // Placeholder for future "Generate Recipe" step
    alert("Próxima etapa: Geração da Receita (Em Desenvolvimento)");
  };

  const handleStartOver = () => {
    resetFormData();
    router.push('/');
  };

  if (!formData.medicalPropertiesResult) {
    return <p>Carregando propriedades terapêuticas... Se demorar, volte e tente novamente.</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Revise as propriedades terapêuticas identificadas e os óleos essenciais sugeridos.
        {formData.medicalPropertiesResult.health_concern_in_english && (
            <span className="block mt-1 text-sm">Problema de saúde (em inglês para referência): <strong>{formData.medicalPropertiesResult.health_concern_in_english}</strong></span>
        )}
      </p>

      {isFetchingOils && Object.keys(oilsFetchedFor).length < therapeuticProperties.length && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
          <p>Buscando óleos essenciais sugeridos...</p>
        </div>
      )}

      <Accordion type="multiple" className="w-full space-y-2">
        {therapeuticProperties.map((prop) => (
          <AccordionItem value={prop.property_id} key={prop.property_id} className="border rounded-lg px-4 data-[state=open]:bg-muted/30">
            <AccordionTrigger className="hover:no-underline text-left">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">{prop.property_name}</h3>
                <p className="text-xs text-muted-foreground">({prop.property_name_in_english}) - Relevância: {prop.relevancy}/5</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              <p className="text-sm">{prop.description}</p>
              {prop.causes_addressed && <p className="text-xs"><strong>Causas Endereçadas:</strong> {prop.causes_addressed}</p>}
              {prop.symptoms_addressed && <p className="text-xs"><strong>Sintomas Endereçados:</strong> {prop.symptoms_addressed}</p>}
              
              <div className="mt-3 pt-3 border-t">
                <h4 className="text-md font-semibold mb-2">Óleos Sugeridos:</h4>
                {isFetchingOils && !oilsFetchedFor[prop.property_id] && (
                     <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Buscando...
                    </div>
                )}
                {!isFetchingOils && formData.suggestedOilsByProperty && formData.suggestedOilsByProperty[prop.property_id] ? (
                  formData.suggestedOilsByProperty[prop.property_id].suggested_oils.length > 0 ? (
                    <ul className="space-y-2">
                      {formData.suggestedOilsByProperty[prop.property_id].suggested_oils.map(oil => (
                        <li key={oil.name_english} className="p-2 border rounded-md bg-background">
                           <div className="font-medium">{oil.name_local_language} ({oil.name_english}) <Badge variant="secondary">Relevância: {oil.relevancy}/5</Badge></div>
                           <p className="text-xs text-muted-foreground">{oil.oil_description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">Nenhum óleo específico sugerido para esta propriedade.</p>
                ) : (
                  !isFetchingOils && oilsFetchedFor[prop.property_id] && <p className="text-sm text-muted-foreground">Nenhum óleo específico sugerido para esta propriedade.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* This button is now for explicit Next step for the layout if needed */}
      <button onClick={handleSubmitNext} className="hidden" aria-hidden="true" id="properties-oils-submit">
        Internal Submit Trigger for Layout
      </button>

      {/* Start Over Button */}
      <div className="mt-8 flex justify-center">
        <Button onClick={handleStartOver} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Iniciar Nova Consulta
        </Button>
      </div>
    </div>
  );
};

export default PropertiesOilsStep;
