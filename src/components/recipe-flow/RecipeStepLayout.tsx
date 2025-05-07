"use client";

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Progress } from '@/components/ui/progress'; 
import { cn } from '@/lib/utils';
import { useUIState } from '@/contexts/UIStateContext';
import React from 'react';

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
  stepInstructions?: string; // New prop for step-specific instructions
}

const FLOW_STEPS = ['demographics', 'causes', 'symptoms', 'properties'];
const FOOTER_HEIGHT_CLASS = "h-[60px]"; 
const CONTENT_PADDING_BOTTOM_CLASS = "pb-[76px]";

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
  stepInstructions, // Destructure new prop
}) => {
  const router = useRouter();
  const { isLoading: globalIsLoading, error, currentStep, resetFormData } = useRecipeForm(); 
  const { isSidebarPinned, isUserAccountMenuExpanded } = useUIState();
  const [isDesktopClientView, setIsDesktopClientView] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
    const checkDesktop = () => {
      setIsDesktopClientView(window.innerWidth >= 768); 
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const desktopSidebarIsEffectivelyExpanded = isDesktopClientView && (isSidebarPinned || isUserAccountMenuExpanded);


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
    resetFormData();
    router.push('/');
  };

  const currentStepIndex = currentStep ? FLOW_STEPS.indexOf(currentStep) : -1;
  const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / FLOW_STEPS.length) * 100 : 0;

  const showStartOverButton = currentStep && FLOW_STEPS.includes(currentStep);

  return (
    <div className="flex flex-col flex-1 min-h-0"> 
      <div className={cn("flex-grow overflow-y-auto", CONTENT_PADDING_BOTTOM_CLASS)}> 
        <div className={cn(
            "container mx-auto py-8 max-w-3xl",
            "px-0 sm:px-4 md:px-6 lg:px-8",
        )}>
          <div className="mb-6 px-4 sm:px-0">
            <Progress 
              value={progressPercentage} 
              className="h-1.5 w-full bg-muted [&>div]:bg-gradient-to-r [&>div]:from-aroma-grad-start [&>div]:to-aroma-grad-end"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-center text-primary px-4 sm:px-0">{stepTitle}</h1>
          <p className="text-muted-foreground text-center mb-4 px-4 sm:px-0">
            Preencha as informações abaixo para continuar.
          </p>
          
          {stepInstructions && (
            <p className="text-muted-foreground text-center mb-6 px-4 sm:px-0 text-sm">
              {stepInstructions}
            </p>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md mx-4 sm:mx-0">
              <p className="font-semibold">Erro:</p>
              <p>{error}</p>
            </div>
          )}

          <div className={cn(
            "bg-card shadow-lg border",
            "p-0 sm:p-6 md:p-8", 
            "rounded-none sm:rounded-lg"
            )}>
            {children}
          </div>
        </div>
      </div>

      {hasMounted && (
        <footer 
          className={cn(
            "fixed bottom-0 z-10 bg-background border-t border-border",
            FOOTER_HEIGHT_CLASS, 
            "flex items-center justify-between px-4 sm:px-6",
            "right-0", 
            isDesktopClientView 
              ? (desktopSidebarIsEffectivelyExpanded ? "md:left-[287px]" : "md:left-[48px]") 
              : "left-0"
          )}
        >
          <div className="flex gap-2 items-center">
            {!hidePreviousButton && currentStep !== FLOW_STEPS[0] && (
              <Button variant="outline" onClick={handlePrevious} disabled={globalIsLoading} className="h-8 px-3 text-xs sm:text-sm sm:h-auto sm:px-4"> 
                <ArrowLeft className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                Anterior
              </Button>
            )}
          </div>

          {showStartOverButton && (
              <Button variant="ghost" onClick={handleStartOverClick} disabled={globalIsLoading} className="h-8 px-3 text-xs sm:text-sm sm:h-auto sm:px-4 text-muted-foreground hover:text-foreground">
                  <RotateCcw className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                  Recomeçar
              </Button>
          )}
          
          {!hideNextButton ? (
            <Button 
              type="button" 
              form={onNext ? undefined : formId} 
              onClick={handleNextClick} 
              disabled={isNextDisabled || globalIsLoading}
              className="h-8 px-3 text-xs sm:text-sm sm:h-auto sm:px-4" 
            >
              {globalIsLoading && !onNext ? ( 
                <Loader2 className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              )}
              {nextButtonText}
            </Button>
          ) : <div className="h-8 w-0 sm:h-auto" /> }
        </footer>
      )}
    </div>
  );
};

export default RecipeStepLayout;
