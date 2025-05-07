"use client";

import { Search, ArrowRight, Zap, TriangleAlert, Loader2, Sparkles } from 'lucide-react';
import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import { useRecipeForm } from '@/contexts/RecipeFormContext'; 

const healthConcernSchema = z.object({ 
  healthConcern: z.string().min(3, { message: "Please enter at least 3 characters." }), 
});
type HealthConcernFormData = z.infer<typeof healthConcernSchema>; 

const suggestionChips = [
  { label: "Relaxar" },
  { label: "Dormir melhor" },
  { label: "Energia" },
  { label: "Rápido" },
];

export const RecipeGenerator: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false); // Generic loading for the main action
  const [error, setError] = React.useState<string | null>(null);
  
  const router = useRouter(); 
  const { updateFormData, resetFormData, setCurrentStep } = useRecipeForm(); 

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HealthConcernFormData>({ 
    resolver: zodResolver(healthConcernSchema), 
  });

  const handleStartRecipeFlow: SubmitHandler<HealthConcernFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate a brief delay if needed, or directly proceed
      // await new Promise(resolve => setTimeout(resolve, 300)); 

      resetFormData(); 
      updateFormData({ healthConcern: data.healthConcern });
      setCurrentStep('demographics'); 
      router.push('/create-recipe/demographics'); 
    } catch (err: any) {
      console.error("Error starting recipe flow:", err);
      setError(err.message || "Failed to start the recipe creation process. Please try again.");
      setIsLoading(false);
    }
    // setIsLoading(false); // isLoading will be managed by the context in subsequent steps
  };
  
  const handleSuggestionChipClick = (label: string) => {
    setValue("healthConcern", label); 
    handleSubmit(handleStartRecipeFlow)(); // Programmatically submit the form
  };

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
          <div className="group relative rounded-md border border-input p-px hover:border-transparent focus-within:border-transparent hover:bg-gradient-to-r focus-within:bg-gradient-to-r from-aroma-grad-start/50 to-aroma-grad-end/50 transition-all duration-200 ease-in-out focus-within:from-aroma-grad-start focus-within:to-aroma-grad-end hover:shadow-[0_0_0_1px_hsl(var(--aroma-grad-start)_/_0.5),_0_0_0_1px_hsl(var(--aroma-grad-end)_/_0.5)] focus-within:shadow-[0_0_0_1px_hsl(var(--aroma-grad-start)),_0_0_0_1px_hsl(var(--aroma-grad-end))]">
            <div className="flex items-center w-full bg-card rounded-[calc(theme(borderRadius.md)-1px)] p-1 pr-1.5 shadow-sm">
              <Search className="h-5 w-5 text-muted-foreground mx-3 pointer-events-none" />
              <Separator orientation="vertical" className="h-6 mr-2 bg-border" />
              <Input
                {...register("healthConcern")} 
                type="text"
                placeholder="Ex: dor de cabeça, insônia, ansiedade..."
                className="flex-grow py-2.5 px-2 bg-transparent border-none outline-none text-card-foreground placeholder:text-muted-foreground text-sm h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-invalid={errors.healthConcern ? "true" : "false"} 
              />
              <Button 
                type="submit"
                size="icon"
                className="h-9 w-9 bg-aroma-secondary text-primary-foreground rounded-md hover:bg-aroma-secondary/90 focus:ring-aroma-secondary focus:ring-offset-card"
                aria-label="Criar Receita"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          {errors.healthConcern && ( 
            <p className="text-sm text-destructive mt-1 text-left">{errors.healthConcern.message}</p> 
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
              onClick={() => handleSuggestionChipClick(chip.label)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSuggestionChipClick(chip.label)}
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

        {/* Removed UI for displaying recipe suggestions and directly generated recipe */}

      </div>
    </div>
  );
};