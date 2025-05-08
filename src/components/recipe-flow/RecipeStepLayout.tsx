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
        "flex-grow overflow-y-auto", 
        CONTENT_PADDING_BOTTOM_CLASS, 
        "md:flex md:items-center md:justify-center md:overflow-visible md:flex-grow-0" 
        )}> 
        {/* Wrapper for desktop card structure (progress bar + content box) */}
        <div className={cn(
            "w-full", // Full width on mobile
            "md:container md:mx-auto md:max-w-3xl md:my-8" // Desktop container for card
        )}>
            {/* Progress Bar: Full width on mobile, part of card structure on desktop */}
            <div>
                <Progress
                    value={progressPercentage}
                    className={cn(
                        "h-1.5 w-full",
                        "rounded-none md:rounded-t-lg" // No rounding for mobile, top rounding for desktop card
                    )}
                    indicatorClassName="bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end"
                />
            </div>

            {/* Content Area: Full bleed on mobile, card-like on desktop */}
            <div className={cn(
                "w-full",
                // Desktop card styles: bg, bottom rounding, shadow, border (no top border as progress is top)
                "md:bg-card md:rounded-b-lg md:shadow-lg md:border md:border-t-0",
                // Padding: Mobile and Desktop gets padding here. pt-6 because progress bar is flush on top.
                "p-4 pt-6 sm:p-6" 
            )}>
                <h1 className={cn(
                  "text-2xl font-bold mb-2 text-center text-primary",
                  "sm:text-3xl" // Responsive text size
                  // No specific px needed if parent has p-4/sm:p-6
                )}>{stepTitle}</h1>
                
                <p className={cn(
                    "text-muted-foreground text-center mb-4"
                    )}>
                    Preencha as informações abaixo para continuar.
                </p>
                
                {stepInstructions && (
                    <p className={cn(
                    "text-muted-foreground text-center mb-6 text-sm"
                    )}>
                    {stepInstructions}
                    </p>
                )}
                
                {error && (
                    <div className={cn(
                    "mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm"
                    // No specific mx needed if parent has p-4/sm:p-6
                    )}>
                    <p className="font-semibold">Erro:</p>
                    <p>{error}</p>
                    </div>
                )}

                {/* Children (step content) will be rendered here */}
                <div className={cn(
                    "w-full" // Children will manage their own internal layout/padding if necessary
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
              : "left-0",
            "shadow-none sm:shadow-sm" 
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
