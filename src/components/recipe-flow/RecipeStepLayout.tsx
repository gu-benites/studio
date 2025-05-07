
"use client";

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRecipeForm } from '@/contexts/RecipeFormContext';

interface RecipeStepLayoutProps {
  stepTitle: string;
  children: ReactNode;
  onNext?: () => Promise<void> | void; // Optional: if next action is complex (e.g. API call)
  nextButtonText?: string;
  nextRoute?: string; // Optional: if simple navigation
  onPrevious?: () => void;
  previousRoute?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean; // Added for loading state on Next button
  hideNextButton?: boolean;
  hidePreviousButton?: boolean;
}

const RecipeStepLayout: React.FC<RecipeStepLayoutProps> = ({
  stepTitle,
  children,
  onNext,
  nextButtonText = "Próximo",
  nextRoute,
  onPrevious,
  previousRoute,
  isNextDisabled = false,
  isNextLoading = false,
  hideNextButton = false,
  hidePreviousButton = false,
}) => {
  const router = useRouter();
  const { isLoading: isFormLoading, error } = useRecipeForm(); // Get global loading state

  const handleNext = async () => {
    if (onNext) {
      await onNext();
    } else if (nextRoute) {
      router.push(nextRoute);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else if (previousRoute) {
      router.push(previousRoute);
    } else {
      router.back(); // Default previous action
    }
  };

  const effectiveIsLoading = isFormLoading || isNextLoading;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2 text-center text-primary">{stepTitle}</h1>
      <p className="text-muted-foreground text-center mb-8">
        Preencha as informações abaixo para continuar.
      </p>
      
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          <p className="font-semibold">Erro:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg border">
        {children}
      </div>

      <div className="mt-8 flex justify-between items-center">
        {!hidePreviousButton ? (
          <Button variant="outline" onClick={handlePrevious} disabled={effectiveIsLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        ) : <div />}
        
        {!hideNextButton ? (
          <Button onClick={handleNext} disabled={isNextDisabled || effectiveIsLoading}>
            {effectiveIsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {nextButtonText}
          </Button>
        ) : <div />}
      </div>
    </div>
  );
};

export default RecipeStepLayout;
