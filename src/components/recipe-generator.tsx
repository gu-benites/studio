
"use client";

import { Search, SendHorizonal, Zap, TriangleAlert, Loader2, Sparkles, ArrowRight } from 'lucide-react'; // Added ArrowRight
import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { generateRecipeSuggestions, type GenerateRecipeSuggestionsOutput } from '@/ai/flows/generate-suggestions';
import { generateRecipe, type GenerateRecipeOutput, type GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import { cn } from '@/lib/utils';

const recipeInputSchema = z.object({
  recipeIdea: z.string().min(3, { message: "Please enter at least 3 characters." }),
});
type RecipeInputFormData = z.infer<typeof recipeInputSchema>;

const suggestionChips = [
  { label: "Relaxar", category: "comfort food" },
  { label: "Dormir melhor", category: "light dinner" },
  { label: "Energia", category: "high protein" },
  { label: "Rápido", category: "quick meals" },
];

export const RecipeGenerator: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [recipeSuggestions, setRecipeSuggestions] = React.useState<string[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = React.useState<GenerateRecipeOutput | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RecipeInputFormData>({
    resolver: zodResolver(recipeInputSchema),
  });

  const handleFetchSuggestions = async (category: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleGenerateRecipe: SubmitHandler<RecipeInputFormData> = async (data) => {
    setIsGeneratingRecipe(true);
    setError(null);
    setGeneratedRecipe(null);
    setRecipeSuggestions([]); // Clear suggestions when generating specific recipe
    try {
      const input: GenerateRecipeInput = {
        recipeIdea: data.recipeIdea,
        dietaryRestrictions: "None", 
        availableIngredients: "Basic pantry staples",
      };
      const result: GenerateRecipeOutput = await generateRecipe(input);
      setGeneratedRecipe(result);
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError("Failed to generate the recipe. Please try again.");
    } finally {
      setIsGeneratingRecipe(false);
    }
  };
  
  const handleSuggestionChipClick = (category: string, label: string) => {
    setValue("recipeIdea", label); 
    handleFetchSuggestions(category);
  };

  const handleSuggestedRecipeClick = (suggestion: string) => {
    setValue("recipeIdea", suggestion);
    handleSubmit(handleGenerateRecipe)(); 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 
            className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end bg-clip-text text-transparent"
            style={{WebkitTextFillColor: 'transparent', MozTextFillColor: 'transparent'}}
            >
          Qual receita você quer criar hoje?
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Descreva sua ideia ou escolha uma categoria e deixe nossa IA te surpreender!
        </p>

        <form onSubmit={handleSubmit(handleGenerateRecipe)} className="space-y-6">
          <div className="relative group rounded-xl border border-input p-px hover:border-transparent focus-within:border-transparent hover:bg-gradient-to-r focus-within:bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end transition-all duration-200 ease-in-out">
            <div className="relative flex items-center bg-card rounded-[calc(theme(borderRadius.xl)-1px)] shadow-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                {...register("recipeIdea")}
                type="text"
                placeholder="Ex: Bolo de chocolate fofinho, macarrão rápido para o jantar..."
                className="w-full pl-10 pr-4 py-3 h-14 text-base border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-foreground"
                aria-invalid={errors.recipeIdea ? "true" : "false"}
              />
            </div>
          </div>
            {errors.recipeIdea && (
              <p className="text-sm text-destructive mt-1 text-left">{errors.recipeIdea.message}</p>
            )}

          <Button 
            type="submit" 
            className={cn(
              "w-full sm:w-auto h-auto py-3.5 px-8 text-base font-semibold rounded-3xl text-primary-foreground",
              "bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end",
              "shadow-button-normal hover:shadow-button-focus hover:-translate-y-0.5",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aroma-primary",
              "transition-all duration-300 ease-in-out"
            )}
            disabled={isGeneratingRecipe || isLoading}
          >
            {isGeneratingRecipe ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              // Using ArrowRight to match design system main button
              <ArrowRight strokeWidth={2.5} className="mr-2 h-4 w-4" /> 
            )}
            Criar Receita
          </Button>
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

        {isLoading && (
          <div className="mt-8 flex flex-col items-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <p>Buscando sugestões...</p>
          </div>
        )}
        
        {recipeSuggestions.length > 0 && (
          <Card className="mt-8 text-left shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Sugestões de Receitas</CardTitle>
              <CardDescription>Encontramos algumas ideias para você:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recipeSuggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-base text-primary hover:underline"
                      onClick={() => handleSuggestedRecipeClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {generatedRecipe && (
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

