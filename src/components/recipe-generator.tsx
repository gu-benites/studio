
"use client";

import { Search, ArrowRight, Zap, TriangleAlert, Loader2, Sparkles } from 'lucide-react';
import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation'; // Import useRouter

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { generateRecipeSuggestions, type GenerateRecipeSuggestionsOutput } from '@/ai/flows/generate-suggestions';
import { generateRecipe, type GenerateRecipeOutput, type GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import { cn } from '@/lib/utils';
import { useRecipeForm } from '@/contexts/RecipeFormContext'; // Import useRecipeForm

const healthConcernSchema = z.object({ // Renamed from recipeInputSchema
  healthConcern: z.string().min(3, { message: "Please enter at least 3 characters." }), // Renamed from recipeIdea
});
type HealthConcernFormData = z.infer<typeof healthConcernSchema>; // Renamed

const suggestionChips = [
  { label: "Relaxar", category: "comfort food" },
  { label: "Dormir melhor", category: "light dinner" },
  { label: "Energia", category: "high protein" },
  { label: "Rápido", category: "quick meals" },
];

export const RecipeGenerator: React.FC = () => {
  const [isFetchingSuggestions, setIsFetchingSuggestions] = React.useState(false);
  const [isGeneratingFullRecipe, setIsGeneratingFullRecipe] = React.useState(false); // For direct recipe generation if kept
  const [error, setError] = React.useState<string | null>(null);
  const [recipeSuggestions, setRecipeSuggestions] = React.useState<string[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = React.useState<GenerateRecipeOutput | null>(null);
  
  const router = useRouter(); // Initialize useRouter
  const { updateFormData, resetFormData, setCurrentStep } = useRecipeForm(); // Get context functions

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HealthConcernFormData>({ // Updated type
    resolver: zodResolver(healthConcernSchema), // Updated schema
  });

  const handleFetchSuggestions = async (category: string) => {
    setIsFetchingSuggestions(true);
    setError(null);
    setRecipeSuggestions([]);
    setGeneratedRecipe(null);
    try {
      const result: GenerateRecipeSuggestionsOutput = await generateRecipeSuggestions({ category });
      setRecipeSuggestions(result.suggestions);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("Failed to fetch recipe suggestions. Please try again.");
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // This handler is for the multi-step flow
  const handleStartRecipeFlow: SubmitHandler<HealthConcernFormData> = (data) => {
    setIsGeneratingFullRecipe(false); // Ensure this is false if we are starting the flow
    setIsFetchingSuggestions(false);
    setError(null);
    setGeneratedRecipe(null);
    setRecipeSuggestions([]);

    resetFormData(); // Clear any previous multi-step form data
    updateFormData({ healthConcern: data.healthConcern });
    setCurrentStep('demographics'); // Set current step in context
    router.push('/create-recipe/demographics'); // Navigate to the next step
  };
  
  // This handler is for the original direct recipe generation (if we want to keep it)
  const handleGenerateDirectRecipe = async (concern: string) => {
    setIsGeneratingFullRecipe(true);
    setError(null);
    setGeneratedRecipe(null);
    setRecipeSuggestions([]);
    try {
      const input: GenerateRecipeInput = {
        recipeIdea: concern, // The AI flow still expects recipeIdea
        dietaryRestrictions: "None", 
        availableIngredients: "Basic pantry staples",
      };
      const result: GenerateRecipeOutput = await generateRecipe(input);
      setGeneratedRecipe(result);
    } catch (err) {
      console.error("Error generating direct recipe:", err);
      setError("Failed to generate the recipe. Please try again.");
    } finally {
      setIsGeneratingFullRecipe(false);
    }
  };

  const handleSuggestionChipClick = (category: string, label: string) => {
    setValue("healthConcern", label); // Updated field name
    // Decide if chip click should fetch suggestions or start flow. For now, fetch suggestions.
    handleFetchSuggestions(category);
  };

  const handleSuggestedRecipeClick = (suggestion: string) => {
    setValue("healthConcern", suggestion); // Updated field name
    // This could either start the multi-step flow or directly generate.
    // For now, let's assume it directly generates if this feature is kept.
    // If not, it should populate the field and user clicks "Criar Receita" to start the flow.
    handleGenerateDirectRecipe(suggestion); 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 
            className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end bg-clip-text text-transparent"
            >
          Qual receita você quer criar hoje?
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Descreva sua ideia ou escolha uma categoria e deixe nossa IA te surpreender!
        </p>

        <form onSubmit={handleSubmit(handleStartRecipeFlow)} className="space-y-6">
          {/* Using the "Chat Input (New Style)" from design system */}
          <div className="group relative rounded-md border border-input p-px hover:border-transparent focus-within:border-transparent hover:bg-gradient-to-r focus-within:bg-gradient-to-r from-aroma-grad-start/50 to-aroma-grad-end/50 transition-all duration-200 ease-in-out focus-within:from-aroma-grad-start focus-within:to-aroma-grad-end">
            <div className="flex items-center w-full bg-card rounded-[calc(theme(borderRadius.md)-1px)] p-1 pr-1.5 shadow-sm">
              <Search className="h-5 w-5 text-muted-foreground mx-3 pointer-events-none" />
              <Separator orientation="vertical" className="h-6 mr-2 bg-border" />
              <Input
                {...register("healthConcern")} // Updated field name
                type="text"
                placeholder="Ex: dor de cabeça, insônia, ansiedade..."
                className="flex-grow py-2.5 px-2 bg-transparent border-none outline-none text-card-foreground placeholder:text-muted-foreground text-sm h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-invalid={errors.healthConcern ? "true" : "false"} // Updated field name
              />
              <Button 
                type="submit"
                size="icon"
                className="h-9 w-9 bg-aroma-secondary text-primary-foreground rounded-md hover:bg-aroma-secondary/90 focus:ring-aroma-secondary focus:ring-offset-card"
                aria-label="Criar Receita"
                disabled={isGeneratingFullRecipe || isFetchingSuggestions}
              >
                {isGeneratingFullRecipe || isFetchingSuggestions ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          {errors.healthConcern && ( // Updated field name
            <p className="text-sm text-destructive mt-1 text-left">{errors.healthConcern.message}</p> // Updated field name
          )}
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {suggestionChips.map((chip) => (
            <Badge
              key={chip.label}
              variant="outline"
              className="px-4 py-2 text-sm rounded-full cursor-pointer transition-colors shadow-sm 
                         bg-primary/10 text-primary border-primary/30 
                         hover:bg-primary/20 hover:text-primary"
              onClick={() => handleSuggestionChipClick(chip.category, chip.label)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSuggestionChipClick(chip.category, chip.label)}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              {chip.label}
            </Badge>
          ))}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-8 text-left">
            <TriangleAlert className="h-5 w-5" />
            <AlertTitle>Oops! Algo deu errado.</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isFetchingSuggestions && (
          <div className="mt-8 flex flex-col items-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <p>Buscando sugestões...</p>
          </div>
        )}
        
        {recipeSuggestions.length > 0 && (
          <Card className="mt-8 text-left shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Sugestões de Receitas</CardTitle>
              <CardDescription>Encontramos algumas ideias para você. Clique em uma para gerar a receita completa ou refinar sua busca.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recipeSuggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-base text-primary hover:underline"
                      onClick={() => handleSuggestedRecipeClick(suggestion)} // This may need to change if direct generation is removed
                    >
                      {suggestion}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {generatedRecipe && ( // This section is for direct recipe generation result
          <Card className="mt-8 text-left shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">{generatedRecipe.recipeName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Ingredientes:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground whitespace-pre-line">
                  {generatedRecipe.ingredients.split('\n').map((item, index) => item.trim() && <li key={index}>{item.trim().replace(/^- /, '')}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Instruções:</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground whitespace-pre-line">
                 {generatedRecipe.instructions.split('\n').map((step, index) => step.trim() && <li key={index}>{step.trim().replace(/^\d+\.\s*/, '')}</li>)}
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
