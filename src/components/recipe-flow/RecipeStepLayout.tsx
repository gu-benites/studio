
"use client";

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Progress } from '@/components/ui/progress'; // ShadCN progress component
import { cn } from '@/lib/utils';

interface RecipeStepLayoutProps {
  stepTitle: string;
  children: ReactNode;
  formId?: string; 
  onNext?: () => Promise<void> | void; 
  nextButtonText?: string;
  onPrevious?: () => void;
  previousRoute?: string;
  isNextDisabled?: boolean;
  hideNextButton?: boolean;
  hidePreviousButton?: boolean;
}

const FLOW_STEPS = ['demographics', 'causes', 'symptoms', 'properties'];


const RecipeStepLayout: React.FC<RecipeStepLayoutProps> = ({
  stepTitle,
  children,
  formId = "current-step-form",
  onNext,
  nextButtonText = "Próximo",
  onPrevious,
  previousRoute,
  isNextDisabled = false,
  hideNextButton = false,
  hidePreviousButton = false,
}) => {
  const router = useRouter();
  const { isLoading: globalIsLoading, error, currentStep } = useRecipeForm(); 

  const handleNextClick = async () => {
    if (onNext) {
      await onNext();
    } else {
      // If onNext is not provided, try to submit the form
      const formElement = document.getElementById(formId) as HTMLFormElement | null;
      if (formElement && typeof formElement.requestSubmit === 'function') {
        formElement.requestSubmit();
      } else if (formElement && typeof formElement.submit === 'function') {
        // Fallback for older browsers or if requestSubmit is not available
        formElement.submit();
      }
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else if (previousRoute) {
      router.push(previousRoute);
    } else {
      router.back(); 
    }
  };

  const currentStepIndex = currentStep ? FLOW_STEPS.indexOf(currentStep) : -1;
  const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / FLOW_STEPS.length) * 100 : 0;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <div className="mb-6">
        <div className="bg-muted rounded-full h-2.5 w-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
      
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
          <Button variant="outline" onClick={handlePrevious} disabled={globalIsLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        ) : <div />}
        
        {!hideNextButton ? (
          <Button 
            type="button" // Changed to button to prevent accidental form submission if formId is present but onNext is used.
            form={onNext ? undefined : formId} // Only associate with form if onNext is NOT provided
            onClick={handleNextClick} // Always use this handler
            disabled={isNextDisabled || globalIsLoading}
          >
            {globalIsLoading && !onNext ? ( // Show loader only if it's a form submit driven by layout and globalIsLoading
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

