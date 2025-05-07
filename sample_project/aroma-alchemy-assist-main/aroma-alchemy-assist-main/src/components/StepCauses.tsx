import React, { useEffect, useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { getPotentialCauses } from '@/services/api';
import { Cause } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const StepCauses: React.FC = () => {
  const { 
    formData, 
    updateFormData, 
    nextStep, 
    isLoading, 
    setIsLoading, 
    error, 
    setError,
    potentialCauses,
    setPotentialCauses
  } = useFormContext();
  
  const [selectedCauses, setSelectedCauses] = useState<Cause[]>(
    formData.selected_causes || []
  );

  useEffect(() => {
    const fetchCauses = async () => {
      // Only fetch if we don't already have causes and we're not loading
      if (potentialCauses.length === 0 && !isLoading) {
        try {
          setIsLoading(true);
          console.log("Fetching potential causes with form data:", formData);
          const causes = await getPotentialCauses(formData);
          console.log("Received causes:", causes);
          setPotentialCauses(causes);
        } catch (err: any) {
          console.error('Error fetching causes:', err);
          setError(err.message || 'Falha ao buscar causas potenciais. Por favor, tente novamente.');
          toast({
            title: "Erro",
            description: "Falha ao buscar causas potenciais. Por favor, tente novamente.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCauses();
  }, [formData, potentialCauses.length, isLoading, setPotentialCauses, setError, setIsLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCauses.length === 0) {
      setError('Por favor, selecione pelo menos uma causa');
      return;
    }
    
    updateFormData({ selected_causes: selectedCauses });
    nextStep();
  };

  const toggleCauseSelection = (cause: Cause) => {
    const isSelected = selectedCauses.some(
      (selected) => selected.cause_name === cause.cause_name
    );
    
    if (isSelected) {
      setSelectedCauses(
        selectedCauses.filter(
          (selected) => selected.cause_name !== cause.cause_name
        )
      );
    } else {
      setSelectedCauses([...selectedCauses, cause]);
    }
  };

  const isCauseSelected = (cause: Cause): boolean => {
    return selectedCauses.some(
      (selected) => selected.cause_name === cause.cause_name
    );
  };

  return (
    <div className="step-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Baseado em sua preocupação de saúde "<strong>{formData.health_concern}</strong>", 
            selecione as causas potenciais que você acredita estarem relacionadas:
          </p>
          
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aroma-primary"></div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {!isLoading && potentialCauses.length > 0 ? (
              potentialCauses.map((cause, index) => (
                <Card 
                  key={`cause-${index}`} 
                  className={`p-4 cursor-pointer transition-all hover:border-aroma-primary
                    ${isCauseSelected(cause) ? 'border-2 border-aroma-primary bg-aroma-primary/5' : ''}`}
                  onClick={() => toggleCauseSelection(cause)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1
                      ${isCauseSelected(cause) ? 'bg-aroma-primary border-aroma-primary' : 'border-gray-300'}`}
                    >
                      {isCauseSelected(cause) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{cause.cause_name}</h3>
                      <p className="text-gray-600 text-sm">{cause.cause_suggestion}</p>
                      <p className="text-gray-500 text-xs mt-2 italic">{cause.explanation}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : !isLoading ? (
              <div className="col-span-2 text-center py-8">
                <p>Nenhuma causa potencial encontrada. Tente novamente ou entre em contato com o suporte.</p>
              </div>
            ) : null}
          </div>
          
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-gray-500">
            Selecionados: {selectedCauses.length} de {potentialCauses.length}
          </p>
          <Button 
            type="submit" 
            className="bg-aroma-primary hover:bg-aroma-primary/90"
            disabled={isLoading || selectedCauses.length === 0}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StepCauses;
