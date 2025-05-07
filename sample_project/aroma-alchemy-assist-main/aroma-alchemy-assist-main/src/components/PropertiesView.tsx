
import React, { useState, useEffect } from 'react';
import { useFormContext } from '@/context/FormContext';
import { getOilsForProperty } from '@/services/api';
import { SuggestedOil, TherapeuticProperty } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MobileAccordion, MobileAccordionGroup } from '@/components/ui/mobile-accordion';
import { MobileInfoCard, MobileInfoCardGroup } from '@/components/ui/mobile-info-card';
import { cn } from '@/lib/utils';

interface PropertyOilsMap {
  [propertyId: string]: {
    oils: SuggestedOil[];
    isLoading: boolean;
    error: string | null;
  };
}

const PropertiesView: React.FC = () => {
  const { 
    formData, 
    nextStep
  } = useFormContext();

  const properties = formData.therapeutic_properties || [];
  const [propertyOilsMap, setPropertyOilsMap] = useState<PropertyOilsMap>({});
  const [isFetchingStarted, setIsFetchingStarted] = useState(false);

  // Automatically fetch oils when component mounts and properties are available
  useEffect(() => {
    if (properties.length > 0 && !isFetchingStarted) {
      handleFetchOils();
    }
  }, [properties]);

  const handleFetchOils = async () => {
    if (isFetchingStarted) return;
    setIsFetchingStarted(true);
    
    // Initialize the map with loading states
    const initialMap: PropertyOilsMap = {};
    properties.forEach(property => {
      initialMap[property.property_id] = {
        oils: [],
        isLoading: true,
        error: null
      };
    });
    
    setPropertyOilsMap(initialMap);
    
    // Fetch oils for each property
    properties.forEach(async (property) => {
      try {
        // Pass the complete property object instead of just the ID
        const oils = await getOilsForProperty(formData, property);
        
        setPropertyOilsMap(prevMap => ({
          ...prevMap,
          [property.property_id]: {
            ...prevMap[property.property_id],
            oils,
            isLoading: false
          }
        }));
      } catch (error: any) {
        console.error(`Error fetching oils for property ${property.property_id}:`, error);
        
        setPropertyOilsMap(prevMap => ({
          ...prevMap,
          [property.property_id]: {
            ...prevMap[property.property_id],
            isLoading: false,
            error: error.message || 'Falha ao buscar óleos para esta propriedade'
          }
        }));
        
        toast({
          title: "Erro",
          description: `Falha ao buscar óleos para ${property.property_name}`,
          variant: "destructive",
        });
      }
    });
  };

  // Function to go to next step after viewing all oils
  const handleContinueToNextStep = () => {
    nextStep();
  };

  // Function to get the badge color based on relevancy
  const getRelevancyColor = (relevancy: number) => {
    switch (relevancy) {
      case 5:
        return 'bg-green-600';
      case 4:
        return 'bg-green-500';
      case 3:
        return 'bg-yellow-500';
      case 2:
        return 'bg-orange-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="step-container">
      <div className="mb-6">
        <div className="mb-6">
          <h3 className="font-medium text-xl text-aroma-dark mb-2">
            Propriedades Terapêuticas para: {formData.health_concern}
          </h3>
          <p className="text-gray-600 text-sm">
            Com base nas informações fornecidas, identificamos as seguintes propriedades terapêuticas que podem ser benéficas:
          </p>
        </div>
        
        <div className="bg-aroma-secondary/30 p-4 rounded-md mb-6">
          <h4 className="font-medium text-sm mb-2">O que é o Índice de Relevância?</h4>
          <p className="text-xs text-gray-700">
            O Índice de Relevância (1-5) indica o quão adequada é a propriedade para tratar sua preocupação de saúde e sintomas específicos. 
            Quanto maior o índice, mais relevante é a propriedade para o seu caso.
          </p>
        </div>
        
        <MobileAccordionGroup>
          {properties.length > 0 ? (
            properties
              .sort((a, b) => b.relevancy - a.relevancy)
              .map((property, index) => (
                <MobileAccordion
                  key={`property-${index}`}
                  title={property.property_name}
                  description={property.description}
                  badge={{
                    text: `Relevância: ${property.relevancy}/5`,
                    color: getRelevancyColor(property.relevancy)
                  }}
                  defaultOpen={index === 0}
                >
                  {/* Property details */}
                  <div className="mt-4">
                    <MobileInfoCardGroup 
                      colorScheme={property.relevancy >= 4 ? 'purple' : 'default'}
                    >
                      {property.causes_addressed && (
                        <MobileInfoCard
                          title="Causas Tratadas"
                          content={property.causes_addressed}
                        />
                      )}
                      
                      {property.symptoms_addressed && (
                        <MobileInfoCard
                          title="Sintomas Tratados"
                          content={property.symptoms_addressed}
                        />
                      )}
                    </MobileInfoCardGroup>
                  </div>
                  
                  {/* Recommended oils section */}
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-md font-medium mb-3">Óleos Essenciais Recomendados</h4>
                    
                    {propertyOilsMap[property.property_id]?.isLoading ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aroma-primary"></div>
                          <p className="text-sm">Carregando óleos recomendados...</p>
                        </div>
                        <div className="space-y-1">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Skeleton className="h-4 w-4 rounded-full" />
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : propertyOilsMap[property.property_id]?.error ? (
                      <div className="text-red-500 text-sm">
                        {propertyOilsMap[property.property_id].error}
                        <Button
                          onClick={() => handleFetchOils()}
                          size="sm"
                          variant="outline"
                          className="ml-2 text-xs"
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    ) : propertyOilsMap[property.property_id]?.oils.length > 0 ? (
                      <div className="bg-white rounded-md border border-gray-100">
                        {propertyOilsMap[property.property_id].oils.map((oil, oilIndex) => (
                          <div 
                            key={`oil-${oilIndex}`} 
                            className={cn(
                              "p-4 flex flex-col gap-1",
                              oilIndex < propertyOilsMap[property.property_id].oils.length - 1 ? "border-b border-gray-100" : ""
                            )}
                          >
                            <div className="flex justify-between items-center">
                              <h5 className="font-medium">{oil.name_local_language}</h5>
                              <Badge className={getRelevancyColor(oil.relevancy)}>
                                {oil.relevancy}/5
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{oil.oil_description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Nenhum óleo encontrado para esta propriedade.</p>
                    )}
                  </div>
                </MobileAccordion>
              ))
          ) : (
            <div className="text-center py-8">
              <p>Nenhuma propriedade terapêutica encontrada.</p>
            </div>
          )}
        </MobileAccordionGroup>
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        {isFetchingStarted && Object.values(propertyOilsMap).every(item => !item.isLoading) && (
          <Button 
            onClick={handleContinueToNextStep} 
            className="w-full bg-aroma-secondary hover:bg-aroma-secondary/90 text-aroma-dark"
          >
            Avançar
          </Button>
        )}
      </div>
    </div>
  );
};

export default PropertiesView;
