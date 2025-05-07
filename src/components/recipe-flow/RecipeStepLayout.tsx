"use client";

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Progress } from '@/components/ui/progress'; 
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
const FOOTER_HEIGHT_CLASS = "h-[80px]"; // Approx 80px, adjust as needed
const FOOTER_PADDING_CLASS = "pb-[80px]"; // Match footer height for content padding

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
  const { isLoading: globalIsLoading, error, currentStep, resetFormData } = useRecipeForm(); 

  const handleNextClick = async () => {
    if (onNext) {
      await onNext();
    } else {
      const formElement = document.getElementById(formId) as HTMLFormElement | null;
      if (formElement && typeof formElement.requestSubmit === 'function') {
        formElement.requestSubmit();
      } else if (formElement && typeof formElement.submit === 'function') {
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

  const handleStartOverClick = () => {
    // Consider adding a confirmation dialog here if destructive
    // For now, directly resets as per previous implementation.
    resetFormData();
    router.push('/');
  };

  const currentStepIndex = currentStep ? FLOW_STEPS.indexOf(currentStep) : -1;
  const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / FLOW_STEPS.length) * 100 : 0;

  const showStartOverButton = currentStep && FLOW_STEPS.includes(currentStep);

  return (
    // The main container for the step, with padding at the bottom to account for the fixed footer
    <div className={cn("container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl", FOOTER_PADDING_CLASS)}>
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

      {/* Fixed Footer Navigation */}
      <footer 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-border",
          FOOTER_HEIGHT_CLASS,
          "flex items-center justify-between px-4 sm:px-6 lg:px-8" // Standard padding
        )}
        // The `left` and `right` properties need to adjust based on the sidebar's state
        // This will be handled by the parent (`AppLayoutClient`) applying margin to the scrollable content area
      >
        <div className="flex gap-2 items-center">
          {!hidePreviousButton && currentStep !== FLOW_STEPS[0] && (
            <Button variant="outline" onClick={handlePrevious} disabled={globalIsLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
          )}
        </div>

        {showStartOverButton && (
            <Button variant="ghost" onClick={handleStartOverClick} disabled={globalIsLoading} className="text-muted-foreground hover:text-foreground">
                <RotateCcw className="mr-2 h-4 w-4" />
                Recomeçar
            </Button>
        )}
        
        {!hideNextButton ? (
          <Button 
            type="button" 
            form={onNext ? undefined : formId} 
            onClick={handleNextClick} 
            disabled={isNextDisabled || globalIsLoading}
          >
            {globalIsLoading && !onNext ? ( 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {nextButtonText}
          </Button>
        ) : <div />} 
      </footer>
    </div>
  );
};

export default RecipeStepLayout;
