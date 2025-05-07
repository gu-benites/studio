
import React from 'react';
import { useFormContext } from '@/context/FormContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';
import { SuggestedOil } from '@/types';

const OilsView: React.FC = () => {
  const { formData, resetForm } = useFormContext();
  
  const oils = formData.suggested_oils || [];

  const getOilCardColor = (relevancy: number) => {
    switch (relevancy) {
      case 5:
        return 'border-l-4 border-l-green-600';
      case 4:
        return 'border-l-4 border-l-green-500';
      case 3:
        return 'border-l-4 border-l-yellow-500';
      case 2:
        return 'border-l-4 border-l-orange-500';
      default:
        return 'border-l-4 border-l-red-500';
    }
  };

  // Group oils by relevancy for better display
  const groupedOils: Record<number, SuggestedOil[]> = {};
  
  oils.forEach((oil) => {
    if (!groupedOils[oil.relevancy]) {
      groupedOils[oil.relevancy] = [];
    }
    groupedOils[oil.relevancy].push(oil);
  });

  // Sort by relevancy (descending)
  const relevancyLevels = Object.keys(groupedOils)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="step-container">
      <div className="mb-6">
        <div className="mb-6">
          <h3 className="font-medium text-xl text-aroma-dark mb-2">
            Óleos Essenciais Sugeridos para: {formData.health_concern}
          </h3>
          <p className="text-gray-600">
            Baseado nas propriedades terapêuticas identificadas, recomendamos os seguintes óleos essenciais:
          </p>
        </div>
        
        <div className="space-y-6">
          {relevancyLevels.length > 0 ? (
            relevancyLevels.map((relevancy) => (
              <div key={`relevancy-${relevancy}`} className="mb-8">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Relevância {relevancy}/5
                  </h3>
                  <Badge className="ml-3" variant="outline">
                    {groupedOils[relevancy].length} {groupedOils[relevancy].length === 1 ? 'óleo' : 'óleos'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedOils[relevancy].map((oil, index) => (
                    <Card 
                      key={`oil-${relevancy}-${index}`} 
                      className={`p-5 ${getOilCardColor(relevancy)} bg-white`}
                    >
                      <h4 className="font-semibold text-lg mb-2">{oil.name_local_language}</h4>
                      {oil.name_english !== oil.name_local_language && (
                        <p className="text-sm text-gray-500 mb-2">
                          Nome em inglês: {oil.name_english}
                        </p>
                      )}
                      <ScrollArea className="h-[100px] pr-4">
                        <p className="text-gray-700">{oil.oil_description}</p>
                      </ScrollArea>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p>Nenhum óleo essencial encontrado.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 p-4 bg-aroma-secondary/30 rounded-lg">
          <h4 className="font-medium text-lg mb-3">Como usar esta receita de óleo essencial:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Escolha os óleos essenciais da lista com maior relevância para sua condição.</li>
            <li>Use de 1-3 gotas de cada óleo escolhido, diluídas em um óleo carreador como amêndoas doces, jojoba ou coco fracionado.</li>
            <li>Para adultos, dilua em proporção de 2-3% (6-15 gotas de óleo essencial para cada 30ml de óleo carreador).</li>
            <li>Para crianças e idosos, use uma diluição mais baixa de 1% (3-5 gotas para cada 30ml).</li>
            <li>Aplique na área afetada até 3 vezes ao dia, ou conforme necessário.</li>
          </ol>
          
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
            <h5 className="font-medium mb-1">Precauções de Segurança:</h5>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Sempre faça um teste de sensibilidade antes de usar um novo óleo essencial.</li>
              <li>Evite o contato com os olhos, interior do nariz e áreas sensíveis.</li>
              <li>Se estiver grávida, amamentando ou sob cuidados médicos, consulte um profissional de saúde.</li>
              <li>Mantenha os óleos essenciais fora do alcance de crianças.</li>
              <li>Alguns óleos essenciais podem causar sensibilidade à luz solar (fotossensibilidade).</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={resetForm}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Iniciar Nova Consulta
        </Button>
      </div>
    </div>
  );
};

export default OilsView;
