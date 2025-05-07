
import React from 'react';
import { useFormContext } from '@/context/FormContext';
import { getTherapeuticProperties } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const StepReview: React.FC = () => {
  const { 
    formData, 
    updateFormData, 
    nextStep,
    isLoading, 
    setIsLoading, 
    setError
  } = useFormContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const properties = await getTherapeuticProperties(formData);
      updateFormData({ therapeutic_properties: properties });
      nextStep();
    } catch (err) {
      console.error('Error fetching therapeutic properties:', err);
      setError('Falha ao buscar propriedades terapêuticas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="step-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Dados Selecionados:</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-aroma-dark">Preocupação de Saúde:</h4>
              <p className="text-gray-700">{formData.health_concern}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-aroma-dark">Dados Demográficos:</h4>
              <p className="text-gray-700">
                {formData.gender === 'male' ? 'Masculino' : 
                 formData.gender === 'female' ? 'Feminino' : 'Outro'}
                , {formData.age_specific} anos
                ({formData.age_category === 'child' ? 'Criança' :
                  formData.age_category === 'teen' ? 'Adolescente' :
                  formData.age_category === 'adult' ? 'Adulto' : 'Idoso'})
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-4">
              <h4 className="font-medium text-aroma-dark mb-2">Causas Selecionadas:</h4>
              <ScrollArea className="h-[120px] rounded border p-2">
                <ul className="space-y-2">
                  {formData.selected_causes?.map((cause, index) => (
                    <li key={`cause-review-${index}`} className="text-gray-700">
                      <span className="font-medium">{cause.cause_name}</span>
                      <p className="text-sm text-gray-600">{cause.cause_suggestion}</p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-aroma-dark mb-2">Sintomas Selecionados:</h4>
              <ScrollArea className="h-[120px] rounded border p-2">
                <ul className="space-y-2">
                  {formData.selected_symptoms?.map((symptom, index) => (
                    <li key={`symptom-review-${index}`} className="text-gray-700">
                      <span className="font-medium">{symptom.symptom_name}</span>
                      {symptom.symptom_suggestion && (
                        <p className="text-sm text-gray-600">{symptom.symptom_suggestion}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-aroma-primary hover:bg-aroma-primary/90"
            disabled={isLoading}
          >
            Gerar Propriedades Terapêuticas
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StepReview;
