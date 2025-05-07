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
}

const FLOW_STEPS = ['demographics', 'causes', 'symptoms', 'properties'];
const FOOTER_HEIGHT_CLASS = "h-[60px]"; 
const FOOTER_PADDING_CLASS = "pb-[60px]"; 

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
    <div className={cn("flex flex-col min-h-0 flex-1")}>
      <div className={cn("flex-grow overflow-y-auto", FOOTER_PADDING_CLASS)}>
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2.5 w-full [&>div]:bg-gradient-to-r [&>div]:from-aroma-grad-start [&>div]:to-aroma-grad-end" />
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
          <div className="flex gap-2 items-center h-full">
            {!hidePreviousButton && currentStep !== FLOW_STEPS[0] && (
              <Button variant="outline" onClick={handlePrevious} disabled={globalIsLoading} className="h-full px-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}
          </div>

          {showStartOverButton && (
              <Button variant="ghost" onClick={handleStartOverClick} disabled={globalIsLoading} className="h-full px-4 text-muted-foreground hover:text-foreground">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Recomeçar
              </Button>
          )}
          
          {!hideNextButton ? (
            <div className="h-full">
              <Button 
                type="button" 
                form={onNext ? undefined : formId} 
                onClick={handleNextClick} 
                disabled={isNextDisabled || globalIsLoading}
                className="h-full px-4"
              >
                {globalIsLoading && !onNext ? ( 
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {nextButtonText}
              </Button>
            </div>
          ) : <div />} 
        </footer>
      )}
    </div>
  );
};

export default RecipeStepLayout;
