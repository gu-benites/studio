"use client";

import React from 'react';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListChecks, Pill, AlertTriangle } from 'lucide-react';
import { RecipeChoice, RecipeChoices, SuggestedOil } from '@/services/aromarx-api-client';

const RecipeChoicesStep: React.FC = () => {
  const { formData, error: globalError, isFetchingRecipeChoices } = useRecipeForm();
  const { recipeChoices } = formData;

  if (isFetchingRecipeChoices) {
    // This state should ideally be handled by the global LoadingScreen 
    // based on isFetchingRecipeChoices and currentStep === 'recipe-choices'
    // in the main page.tsx. So, this is a fallback or for direct component rendering if needed.
    return <p>Loading recipe choices...</p>; 
  }

  if (globalError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Houve um erro ao buscar as sugestões de receitas: {globalError}
        </AlertDescription>
      </Alert>
    );
  }

  if (!recipeChoices || recipeChoices.choices.length === 0) {
    return (
      <Alert>
        <ListChecks className="h-4 w-4" />
        <AlertTitle>No Suggestions Available</AlertTitle>
        <AlertDescription>
          Nenhuma sugestão de receita foi encontrada com base nas suas seleções. Tente ajustar suas escolhas anteriores.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {recipeChoices.choices.map((choice: RecipeChoice, index: number) => (
        <Card key={index} className={`border-l-4 ${getTimeOfDayColor(choice.time_of_day)}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{choice.title || `Sugestão ${index + 1}`}</CardTitle>
              {choice.time_of_day && (
                <Badge variant="outline" className="ml-2">
                  {getTimeOfDayLabel(choice.time_of_day)}
                </Badge>
              )}
            </div>
            {choice.description && (
              <CardDescription className="mt-2">{choice.description}</CardDescription>
            )}
            {choice.oils && choice.oils.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                    {choice.oils.map((oil: SuggestedOil | string, oilIndex: number) => (
                        <Badge key={oilIndex} variant="secondary" className="flex items-center">
                           <Pill size={12} className="mr-1.5" /> {typeof oil === 'string' ? oil : oil.name_local_language}
                        </Badge>
                    ))}
                </div>
            )}
          </CardHeader>
          <CardContent>
            {choice.steps && choice.steps.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-sm">Ver Detalhes / Modo de Preparo</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {choice.steps.map((step: string, stepIndex: number) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground">Mais detalhes sobre esta sugestão estarão disponíveis em breve.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to get time of day label
function getTimeOfDayLabel(timeOfDay: string | undefined): string {
  switch (timeOfDay) {
    case 'morning':
      return 'Manhã';
    case 'afternoon':
      return 'Tarde';
    case 'evening':
      return 'Fim de tarde';
    case 'night':
      return 'Noite';
    default:
      return 'Qualquer hora';
  }
}

// Helper function to get border color based on time of day
function getTimeOfDayColor(timeOfDay: string | undefined): string {
  switch (timeOfDay) {
    case 'morning':
      return 'border-yellow-400';
    case 'afternoon':
      return 'border-orange-400';
    case 'evening':
      return 'border-purple-400';
    case 'night':
      return 'border-blue-800';
    default:
      return 'border-gray-300';
  }
}

export default RecipeChoicesStep;
