"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { fetchRecipeChoices } from '@/services/aromarx-api-client';
import { getSuggestedOils } from '@/services/aromarx-api-client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; 
import { Loader2, FlaskConical } from 'lucide-react'; 
import type { RecipeFormData } from '@/contexts/RecipeFormContext';
import type { SuggestedOil } from '@/services/aromarx-api-client';

interface SuggestedOilsForProperty {
  property_id: string;
  property_name: string; 
  property_name_in_english: string; 
  description: string; 
  suggested_oils: SuggestedOil[];
}
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

interface PropertiesOilsStepProps {
  t: (key: string) => string;
}

const PropertiesOilsStep: React.FC<PropertiesOilsStepProps> = ({ t }) => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError, resetFormData, isLoading: globalIsLoading } = useRecipeForm();
  
  const therapeuticProperties = formData.medicalPropertiesResult?.therapeutic_properties || [];

  const [fetchingStatus, setFetchingStatus] = useState<Record<string, boolean>>({});
  const fetchAllOilsInProgress = useRef(false); // Ref to track if fetching is in progress

  const fetchAllSuggestedOils = useCallback(async () => {
    console.log("[PropertiesOilsStep] fetchAllSuggestedOils attempt.", { 
      globalIsLoading, 
      refIsBusy: fetchAllOilsInProgress.current,
      therapeuticPropertiesCount: therapeuticProperties.length
    });

    // Safely handle potentially null suggestedOilsByProperty
    const suggestedOilsByProperty = formData.suggestedOilsByProperty || {};
    
    const propertiesToFetch = therapeuticProperties.filter(prop => {
      const isAlreadyFetchedWithData = suggestedOilsByProperty[prop.property_id] &&
                                   suggestedOilsByProperty[prop.property_id].suggested_oils.length > 0;
      const isMarkedAsFetchingInState = fetchingStatus[prop.property_id];
      return !isAlreadyFetchedWithData && !isMarkedAsFetchingInState;
    });

    if (propertiesToFetch.length === 0) {
      console.log("[PropertiesOilsStep] fetchAllSuggestedOils: No properties to fetch based on current data and fetchingStatus state.");
      return;
    }

    if (fetchAllOilsInProgress.current) {
      console.log("[PropertiesOilsStep] fetchAllSuggestedOils: Aborting, fetchAllOilsInProgress ref is TRUE.");
      return;
    }

    fetchAllOilsInProgress.current = true;
    setIsLoading(true);
    setError(null);
    console.log(`[PropertiesOilsStep] fetchAllSuggestedOils: Starting CONCURRENT batch for ${propertiesToFetch.length} properties. Ref set to true. Global loading true.`);
    console.log("[PropertiesOilsStep] Properties to fetch (IDs):", propertiesToFetch.map(p => p.property_id));

    const newFetchingStatusUpdates: Record<string, boolean> = {};
    propertiesToFetch.forEach(prop => newFetchingStatusUpdates[prop.property_id] = true);
    setFetchingStatus(prevStatus => ({ ...prevStatus, ...newFetchingStatusUpdates }));
    console.log("[PropertiesOilsStep] Updated fetchingStatus state (marked as true for batch):", newFetchingStatusUpdates);

    const newlyFetchedOilsByProperty: Record<string, SuggestedOilsForProperty> = {};
    
    try {
      console.log("[PropertiesOilsStep] Creating promises for concurrent API calls.");
      const oilPromises = propertiesToFetch.map(prop => {
        console.log(`[PropertiesOilsStep] ==> Creating promise for API call for property: ${prop.property_name} (ID: ${prop.property_id})`);
        return getSuggestedOils(
          { healthConcern: formData.healthConcern, gender: formData.gender, ageCategory: formData.ageCategory, ageSpecific: formData.ageSpecific, selectedCauses: formData.selectedCauses, selectedSymptoms: formData.selectedSymptoms },
          prop
        ).then(oilsData => ({
          status: 'fulfilled' as const,
          value: oilsData,
          property_id: prop.property_id, // Keep track of which property this result is for
          property_name: prop.property_name
        })).catch(error => ({
          status: 'rejected' as const,
          reason: error,
          property_id: prop.property_id,
          property_name: prop.property_name
        }));
      });

      console.log(`[PropertiesOilsStep] Awaiting ${oilPromises.length} promises with Promise.allSettled.`);
      const results = await Promise.allSettled(oilPromises);
      console.log("[PropertiesOilsStep] Promise.allSettled finished. Processing results.");

      results.forEach(result => {
        // The result from Promise.allSettled itself has a status and value/reason.
        // The value (if fulfilled) is our custom object with its own status, value, and property_id.
        if (result.status === 'fulfilled') {
          const promiseOutcome = result.value;
          if (promiseOutcome.status === 'fulfilled') {
            console.log(`[PropertiesOilsStep] <== Successfully fetched oils for property: ${promiseOutcome.property_name} (ID: ${promiseOutcome.property_id}). Data:`, promiseOutcome.value);
            newlyFetchedOilsByProperty[promiseOutcome.property_id] = promiseOutcome.value;
          } else { // Our custom catch block was hit
            console.error(`[PropertiesOilsStep] <== Error fetching oils for property ${promiseOutcome.property_name} (ID: ${promiseOutcome.property_id}) within promise:`, promiseOutcome.reason);
            // setError(`Falha ao buscar óleos para ${promiseOutcome.property_name}.`); // Optionally set error per property
          }
        } else {
          // This case should ideally not be hit if our inner .then/.catch handles everything,
          // but it's a fallback for unexpected errors in the promise creation/settling itself.
          console.error(`[PropertiesOilsStep] <== A promise in Promise.allSettled was rejected unexpectedly for an unknown property:`, result.reason);
        }
      });
      
      if(Object.keys(newlyFetchedOilsByProperty).length > 0){
          console.log("[PropertiesOilsStep] Updating formData with newly fetched oils (concurrently fetched):", newlyFetchedOilsByProperty);
          updateFormData({ 
              suggestedOilsByProperty: {
                  ...(formData.suggestedOilsByProperty || {}),
                  ...newlyFetchedOilsByProperty
              } 
          });
      }
    } catch (batchError: any) {
      console.error(`[PropertiesOilsStep] Critical error during concurrent batch fetching setup or Promise.allSettled:`, batchError);
      setError("Ocorreu um erro crítico ao buscar os óleos sugeridos.");
    } finally {
      const finalFetchingStatusUpdatesForBatch: Record<string, boolean> = {};
      propertiesToFetch.forEach(prop => {
          finalFetchingStatusUpdatesForBatch[prop.property_id] = false;
      });
      // Only update if there are actually properties in this batch
      if (propertiesToFetch.length > 0) {
        setFetchingStatus(prevStatus => ({ ...prevStatus, ...finalFetchingStatusUpdatesForBatch }));
        console.log("[PropertiesOilsStep] Updated fetchingStatus state (marked as false post-batch attempt):", finalFetchingStatusUpdatesForBatch);
      }
      
      setIsLoading(false);
      fetchAllOilsInProgress.current = false;
      console.log("[PropertiesOilsStep] fetchAllSuggestedOils finished execution. Ref set to false. Global loading false.");
    }
  }, [
      therapeuticProperties, 
      formData.healthConcern, 
      formData.gender, 
      formData.ageCategory, 
      formData.ageSpecific, 
      formData.selectedCauses, 
      formData.selectedSymptoms, 
      formData.suggestedOilsByProperty,
      fetchingStatus, 
      setFetchingStatus, 
      setIsLoading, 
      setError, 
      updateFormData
    ]);

  useEffect(() => {
    console.log("[PropertiesOilsStep] useEffect triggered.", {
        globalIsLoading,
        therapeuticPropertiesCount: therapeuticProperties.length,
        hasMedicalPropertiesResult: !!formData.medicalPropertiesResult,
        currentFormDataSuggestedOils: formData.suggestedOilsByProperty,
        currentFetchingStatusState: fetchingStatus,
        refIsBusy: fetchAllOilsInProgress.current
    });
    
    // Safely handle potentially null suggestedOilsByProperty
    const suggestedOilsByProperty = formData.suggestedOilsByProperty || {};
    
    const needsAnyFetching = therapeuticProperties.some(prop => 
        !(suggestedOilsByProperty[prop.property_id] &&
          suggestedOilsByProperty[prop.property_id].suggested_oils.length > 0
         ) && !fetchingStatus[prop.property_id]
    );
    
    console.log("[PropertiesOilsStep] useEffect - calculated needsAnyFetching:", needsAnyFetching);

    if (therapeuticProperties.length > 0 && !globalIsLoading && needsAnyFetching) {
        if (fetchAllOilsInProgress.current) {
            console.log("[PropertiesOilsStep] useEffect: Conditions met, but fetchAllOilsInProgress ref is TRUE. Not calling fetchAllSuggestedOils again.");
        } else {
            console.log("[PropertiesOilsStep] useEffect: Conditions met. Calling fetchAllSuggestedOils.");
            fetchAllSuggestedOils();
        }
    } else {
        let reason = "";
        if (therapeuticProperties.length === 0) reason += "No therapeutic properties. ";
        if (globalIsLoading) reason += "Global loading is active. ";
        if (!needsAnyFetching && therapeuticProperties.length > 0) reason += "No properties currently need fetching (checked against formData and fetchingStatus state). ";
        console.log(`[PropertiesOilsStep] useEffect: Conditions NOT met for calling fetchAllSuggestedOils. Reason: ${reason.trim()}`);
    }
  }, [
      therapeuticProperties, 
      fetchAllSuggestedOils, 
      globalIsLoading, 
      formData.medicalPropertiesResult,
      formData.suggestedOilsByProperty, 
      fetchingStatus 
    ]);

  const handleSubmitNext = async (): Promise<void> => {
    // Placeholder for future navigation to a final recipe display page
    // For now, this might just log or prepare data
    console.log("Final selected oils (to be implemented):", formData.suggestedOilsByProperty);
    // router.push('/create-recipe/final-recipe-summary'); // Example future route
    alert("Próxima etapa: Geração da Receita (Em Desenvolvimento)");
  };

  const handleGenerateSuggestions = async (): Promise<void> => {
    try {
      // Validate that all required data is present except for selectedTherapeuticProperties
      if (!formData.healthConcern || !formData.gender || !formData.ageCategory || !formData.ageSpecific || 
          !formData.selectedCauses || !formData.selectedSymptoms) {
        // Prepare a more specific error message
        const missingFields = [];
        if (!formData.healthConcern) missingFields.push('Health Concern');
        if (!formData.gender) missingFields.push('Gender');
        if (!formData.ageCategory) missingFields.push('Age Category');
        if (!formData.ageSpecific) missingFields.push('Specific Age');
        if (!formData.selectedCauses) missingFields.push('Selected Causes');
        if (!formData.selectedSymptoms) missingFields.push('Selected Symptoms');
        
        setError(`Please complete all previous steps. Missing information: ${missingFields.join(', ')}`);
        return;
      }
      
      // Also check if suggestedOilsByProperty is populated
      if (!formData.suggestedOilsByProperty || Object.keys(formData.suggestedOilsByProperty).length === 0) {
        setError('Please wait for suggested oils to load before generating recipe suggestions.');
        return;
      }
      
      setIsLoading(true);
      
      // Auto-select all therapeutic properties if they're not already selected
      if (!formData.selectedTherapeuticProperties && formData.medicalPropertiesResult?.therapeutic_properties) {
        // Use all therapeutic properties from the medical properties result
        updateFormData({ 
          ...formData, 
          selectedTherapeuticProperties: formData.medicalPropertiesResult.therapeutic_properties 
        });
      }
      
      // Use a local variable to ensure we have the updated data with selectedTherapeuticProperties
      const updatedFormData = {
        ...formData,
        selectedTherapeuticProperties: formData.selectedTherapeuticProperties || formData.medicalPropertiesResult?.therapeutic_properties || []
      };
      
      // Prepare suggestedOilsForProperties array if it doesn't exist
      if (!updatedFormData.suggestedOilsForProperties && updatedFormData.suggestedOilsByProperty) {
        const suggestedOilsArray = Object.values(updatedFormData.suggestedOilsByProperty);
        updatedFormData.suggestedOilsForProperties = suggestedOilsArray;
        updateFormData(updatedFormData);
      }
      
      const choices = await fetchRecipeChoices(updatedFormData);
      updateFormData({ ...updatedFormData, recipeChoices: choices });
      setCurrentStep('recipe-choices');
      router.push('/recipe-choices');
    } catch (error) {
      console.error('Failed to fetch recipe choices:', error);
      setError('Failed to fetch recipe choices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (prop: TherapeuticProperty, oil: SuggestedOil): void => {
    // ... implementation ...
  };

  const handleSelectAllForProperty = (prop: TherapeuticProperty): void => {
    // ... implementation ...
  };

  // Custom type that extends SuggestedOil with selected property
  interface ExtendedSuggestedOil extends SuggestedOil {
    selected?: boolean;
  }

  const filteredOils = useMemo(() => {
    // Safely handle potentially null suggestedOilsByProperty
    const suggestedOilsByProperty = formData.suggestedOilsByProperty || {};
    
    return therapeuticProperties.flatMap(prop => {
      const propertyOils = suggestedOilsByProperty[prop.property_id]?.suggested_oils || [];
      // Filter oils that are marked as selected (if the property exists)
      return (propertyOils as ExtendedSuggestedOil[]).filter(oil => oil.selected === true);
    });
  }, [therapeuticProperties, formData.suggestedOilsByProperty]);

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
                {globalIsLoading && (!(formData.suggestedOilsByProperty || {})[prop.property_id]) && (
                     <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Buscando...
                    </div>
                )}
                {!globalIsLoading && (formData.suggestedOilsByProperty || {})[prop.property_id] ? (
                  (formData.suggestedOilsByProperty || {})[prop.property_id].suggested_oils.length > 0 ? (
                    <ul className="space-y-2">
                      {(formData.suggestedOilsByProperty || {})[prop.property_id].suggested_oils.map(oil => (
                        <li key={oil.name_english} className="p-2 border rounded-md bg-background">
                           <div className="font-medium">{oil.name_local_language} ({oil.name_english}) <Badge variant="secondary" className="ml-1">Relevância: {oil.relevancy}/5</Badge></div>
                           <p className="text-xs text-muted-foreground">{oil.oil_description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">Nenhum óleo específico sugerido para esta propriedade.</p>
                ) : (
                  !globalIsLoading && <p className="text-sm text-muted-foreground">Nenhum óleo específico sugerido para esta propriedade.</p>
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
      <Button
        type="button"
        onClick={handleGenerateSuggestions}
      >
        Gerar Sugestões
      </Button>
    </div>
  );
};

export default PropertiesOilsStep;
