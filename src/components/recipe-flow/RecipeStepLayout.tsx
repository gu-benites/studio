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
  stepInstructions?: string;
}

const FLOW_STEPS = ['demographics', 'causes', 'symptoms', 'properties'];
const FOOTER_HEIGHT_CLASS = "h-[var(--footer-nav-height)]"; 
const CONTENT_PADDING_BOTTOM_CLASS = "pb-[calc(var(--footer-nav-height)+1rem)]"; 

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
  stepInstructions,
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
  const isAccordionStep = currentStep === 'causes' || currentStep === 'symptoms';

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
    <div className={cn(
      "flex flex-col flex-1 min-h-0", 
       "md:justify-center" 
      )}> 
      <div className={cn(
        "flex-grow", 
        CONTENT_PADDING_BOTTOM_CLASS, 
        "md:flex md:items-center md:justify-center md:flex-grow-0",
        isAccordionStep ? "overflow-y-auto md:overflow-visible" : "overflow-y-auto" // Ensure scroll for accordion steps, others as needed
        )}> 
        <div className={cn(
            "w-full", 
            "md:container md:mx-auto md:max-w-3xl md:my-8" 
        )}>
            <div>
                <Progress
                    value={progressPercentage}
                    className={cn(
                        "h-1.5 w-full",
                        "md:rounded-t-lg" 
                    )}
                    indicatorClassName="bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end"
                />
            </div>
            <div className={cn(
                "w-full",
                "md:bg-card md:rounded-b-lg md:shadow-lg md:border md:border-t-0",
                 // Padding:
                "pt-6 pb-4", // Consistent vertical padding
                isAccordionStep ? "px-0 md:px-6" : "px-4 sm:px-6", // Conditional horizontal padding for mobile
                "sm:pb-6" // Desktop bottom padding (sm:p-6 includes this but this ensures it if px-0 is active)
            )}>
                <h1 className={cn(
                  "text-2xl font-bold mb-2 text-center text-primary",
                  "sm:text-3xl", 
                  isAccordionStep ? "px-4 sm:px-0" : "" // Add horizontal padding back for title if step is accordion
                )}>{stepTitle}</h1>
                
                <p className={cn(
                    "text-muted-foreground text-center mb-4",
                    isAccordionStep ? "px-4 sm:px-0" : "" // Add horizontal padding back for subtitle if step is accordion
                    )}>
                    Preencha as informações abaixo para continuar.
                </p>
                
                {stepInstructions && (
                    <p className={cn(
                    "text-muted-foreground text-center mb-6 text-sm",
                    isAccordionStep ? "px-4 sm:px-0" : "" // Add horizontal padding back for instructions if step is accordion
                    )}>
                    {stepInstructions}
                    </p>
                )}
                
                {error && (
                    <div className={cn(
                    "mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm",
                    isAccordionStep ? "mx-4 sm:mx-0" : "" // Add horizontal margin if step is accordion (to mimic padding effect)
                    )}>
                    <p className="font-semibold">Erro:</p>
                    <p>{error}</p>
                    </div>
                )}
                <div className={cn(
                    "w-full" 
                )}>
                    {children}
                </div>
            </div>
        </div>
      </div>

      {hasMounted && (
        <footer 
          className={cn(
            "fixed bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border",
            FOOTER_HEIGHT_CLASS, 
            "flex items-center justify-between px-4 sm:px-6",
            "right-0", 
            isDesktopClientView 
              ? (desktopSidebarIsEffectivelyExpanded ? "md:left-[287px]" : "md:left-[48px]") 
              : "left-0"
             // Removed shadow-none sm:shadow-sm to let card handle shadow on desktop
          )}
        >
          <div className="flex gap-2 items-center">
            {!hidePreviousButton && currentStep !== FLOW_STEPS[0] && (
              <Button variant="outline" onClick={handlePrevious} disabled={globalIsLoading} className="h-full px-4 text-xs sm:text-sm max-h-[32px]"> 
                <ArrowLeft className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                Anterior
              </Button>
            )}
          </div>

          {showStartOverButton && (
              <Button variant="ghost" onClick={handleStartOverClick} disabled={globalIsLoading} className="h-full px-3 text-xs sm:text-sm max-h-[32px] text-muted-foreground hover:text-foreground">
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
              className="h-full px-4 text-xs sm:text-sm max-h-[32px]" 
            >
              {globalIsLoading && !onNext ? ( 
                <Loader2 className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              )}
              {nextButtonText}
            </Button>
          ) : <div className="h-full w-0 max-h-[32px]" /> }
        </footer>
      )}
    </div>
  );
};

export default RecipeStepLayout;
