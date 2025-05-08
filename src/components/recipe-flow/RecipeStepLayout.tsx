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
const CONTENT_PADDING_BOTTOM_CLASS = "pb-[calc(var(--footer-nav-height)+1rem)]"; // Add a bit more padding than just footer height for spacing

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
        CONTENT_PADDING_BOTTOM_CLASS, // This ensures content above footer is scrollable and padded
        "md:flex md:items-center md:justify-center md:overflow-visible md:flex-grow-0" 
        )}> 
        <div className={cn(
            "w-full", // Full width for mobile, container handles max-width on desktop
            // Desktop: card-like box with shadow, centered, and margin
            "md:container md:mx-auto md:max-w-3xl md:bg-card md:rounded-lg md:shadow-lg md:border md:my-8 md:p-6",
            // Mobile: full bleed, no top padding for the box itself
            "px-0 pt-0" 
        )}>
          {/* Progress bar container: full width on mobile, respects card padding on desktop */}
          <div className={cn(
            "mb-6", // Margin below progress bar
            "px-0 md:px-0" // No extra horizontal padding here if card has md:p-6
                           // Or "px-4 sm:px-6 md:px-0" if mobile needs padding for progress bar container
          )}>
            <Progress 
              value={progressPercentage} 
              className="h-1.5 w-full rounded-none md:rounded-t-md" // Full width, no rounding on mobile, rounded top on desktop
              indicatorClassName="bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end"
            />
          </div>
          
          <h1 className={cn(
            "text-2xl sm:text-3xl font-bold mb-2 text-center text-primary",
            "px-4 sm:px-6 md:px-0" // Horizontal padding for title on mobile/sm, none on md (card handles it)
          )}>{stepTitle}</h1>
          
          <p className={cn(
            "text-muted-foreground text-center mb-4",
            "px-4 sm:px-6 md:px-0"
            )}>
            Preencha as informações abaixo para continuar.
          </p>
          
          {stepInstructions && (
            <p className={cn(
              "text-muted-foreground text-center mb-6 text-sm",
              "px-4 sm:px-6 md:px-0"
              )}>
              {stepInstructions}
            </p>
          )}
          
          {error && (
            <div className={cn(
              "mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm",
              "mx-4 sm:mx-6 md:mx-0" // Margin for error message
              )}>
              <p className="font-semibold">Erro:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Children (step content) will be rendered here */}
          <div className={cn(
            "w-full",
            "px-0 md:px-0" // Children manage their own internal padding if needed (e.g. accordion items)
          )}>
            {children}
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
