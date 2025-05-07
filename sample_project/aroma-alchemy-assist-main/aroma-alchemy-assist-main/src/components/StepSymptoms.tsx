
import React, { useEffect, useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { getPotentialSymptoms } from '@/services/api';
import { Symptom } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const StepSymptoms: React.FC = () => {
  const { 
    formData, 
    updateFormData, 
    nextStep, 
    isLoading, 
    setIsLoading, 
    error, 
    setError,
    potentialSymptoms,
    setPotentialSymptoms
  } = useFormContext();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>(
    formData.selected_symptoms || []
  );

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        if (potentialSymptoms.length === 0 && formData.selected_causes && formData.selected_causes.length > 0) {
          setIsLoading(true);
          const symptoms = await getPotentialSymptoms(formData);
          setPotentialSymptoms(symptoms);
        }
      } catch (err) {
        console.error('Error fetching symptoms:', err);
        setError('Falha ao buscar sintomas potenciais. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSymptoms();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSymptoms.length === 0) {
      setError('Por favor, selecione pelo menos um sintoma');
      return;
    }
    
    updateFormData({ selected_symptoms: selectedSymptoms });
    nextStep();
  };

  const toggleSymptomSelection = (symptom: Symptom) => {
    const isSelected = selectedSymptoms.some(
      (selected) => selected.symptom_name === symptom.symptom_name
    );
    
    if (isSelected) {
      setSelectedSymptoms(
        selectedSymptoms.filter(
          (selected) => selected.symptom_name !== symptom.symptom_name
        )
      );
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const isSymptomSelected = (symptom: Symptom): boolean => {
    return selectedSymptoms.some(
      (selected) => selected.symptom_name === symptom.symptom_name
    );
  };

  return (
    <div className="step-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Baseado nas causas selecionadas para "<strong>{formData.health_concern}</strong>", 
            selecione os sintomas que você está experimentando:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {potentialSymptoms.map((symptom, index) => (
              <Card 
                key={`symptom-${index}`} 
                className={`p-4 cursor-pointer transition-all hover:border-aroma-primary
                  ${isSymptomSelected(symptom) ? 'border-2 border-aroma-primary bg-aroma-primary/5' : ''}`}
                onClick={() => toggleSymptomSelection(symptom)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1
                    ${isSymptomSelected(symptom) ? 'bg-aroma-primary border-aroma-primary' : 'border-gray-300'}`}
                  >
                    {isSymptomSelected(symptom) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{symptom.symptom_name}</h3>
                    <p className="text-gray-600 text-sm">{symptom.symptom_suggestion}</p>
                    {symptom.explanation && (
                      <p className="text-gray-500 text-xs mt-2 italic">{symptom.explanation}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-gray-500">
            Selecionados: {selectedSymptoms.length} de {potentialSymptoms.length}
          </p>
          <Button 
            type="submit" 
            className="bg-aroma-primary hover:bg-aroma-primary/90"
            disabled={isLoading || selectedSymptoms.length === 0}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StepSymptoms;
