
import React, { useEffect, useState, useRef } from 'react';
import { useFormContext } from '@/context/FormContext';

type StepInfo = {
  id: number;
  text: string;
  duration: number;
};

interface LoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, onComplete }) => {
  const { currentStep, formData } = useFormContext();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimer, setStepTimer] = useState(0);
  
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const activeListItemRef = useRef<HTMLLIElement | null>(null);
  
  // Dynamic steps based on current form step
  const getStepsForCurrentStep = (): StepInfo[] => {
    switch (currentStep) {
      case 'causes':
        return [
          { id: 1, text: "Analisando preocupação de saúde", duration: 1500 },
          { id: 2, text: `Pesquisando causas para "${formData.health_concern}"`, duration: 2500 },
          { id: 3, text: "Coletando informações médicas", duration: 2500 },
          { id: 4, text: "Preparando resultados", duration: 1500 },
        ];
      case 'symptoms':
        return [
          { id: 1, text: "Processando causas selecionadas", duration: 1500 },
          { id: 2, text: "Identificando sintomas relacionados", duration: 2500 },
          { id: 3, text: "Analisando correlações", duration: 2000 },
          { id: 4, text: "Preparando lista de sintomas", duration: 1500 },
        ];
      case 'properties':
        return [
          { id: 1, text: "Analisando informações coletadas", duration: 2000 },
          { id: 2, text: "Identificando propriedades terapêuticas", duration: 2500 },
          { id: 3, text: "Calculando relevância e eficácia", duration: 2000 },
          { id: 4, text: "Preparando recomendações", duration: 1500 },
        ];
      case 'oils':
        return [
          { id: 1, text: "Processando propriedades selecionadas", duration: 1800 },
          { id: 2, text: "Pesquisando óleos essenciais compatíveis", duration: 2500 },
          { id: 3, text: "Avaliando sinergias e combinações", duration: 2200 },
          { id: 4, text: "Formulando receita personalizada", duration: 2000 },
          { id: 5, text: "Finalizando recomendações", duration: 1500 },
        ];
      default:
        return [
          { id: 1, text: "Processando sua solicitação", duration: 1800 },
          { id: 2, text: "Analisando dados", duration: 2000 },
          { id: 3, text: "Preparando próxima etapa", duration: 2200 },
        ];
    }
  };
  
  const steps = getStepsForCurrentStep();
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
  const completionDelay = 1000;

  // Format time in milliseconds to MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Updates step list styling
  const updateStepHighlighting = () => {
    const listItems = document.querySelectorAll('#step-list li[data-step]');
    
    if (activeListItemRef.current) {
      activeListItemRef.current.classList.remove('step-active', 'ellipsis');
      activeListItemRef.current.classList.add('step-completed');
    }
    
    if (currentStepIndex < steps.length) {
      activeListItemRef.current = document.querySelector(`#step-list li[data-step="${steps[currentStepIndex].id}"]`) as HTMLLIElement;
      if (activeListItemRef.current) {
        activeListItemRef.current.classList.remove('step-completed');
        activeListItemRef.current.classList.add('step-active', 'ellipsis');
      }
      setStepTimer(0);
    } else {
      activeListItemRef.current = null;
    }
  };

  // Main animation loop
  const animationLoop = () => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    setElapsedTime(elapsed);

    // Step Progression Logic
    let stepChanged = false;
    if (currentStepIndex < steps.length) {
      setStepTimer(prev => {
        const newTimer = prev + 16.67;
        const currentStepDuration = steps[currentStepIndex].duration;
        if (newTimer >= currentStepDuration) {
          setCurrentStepIndex(prevIndex => {
            const newIndex = prevIndex + 1;
            setTimeout(() => updateStepHighlighting(), 0);
            return newIndex;
          });
          stepChanged = true;
          return 0;
        }
        return newTimer;
      });
    }

    // Overall Progress Calculation (Actual Time-Based)
    let completedDuration = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      completedDuration += steps[i].duration;
    }
    const currentStepProgressTime = (currentStepIndex < steps.length) ? Math.min(stepTimer, steps[currentStepIndex].duration) : 0;
    const totalProgressTime = completedDuration + currentStepProgressTime;
    
    // Calculate the actual target progress based purely on time
    const newOverallProgress = Math.min(100, (totalProgressTime / totalDuration) * 100);
    setOverallProgress(newOverallProgress);

    // Displayed Progress Calculation (With Randomness)
    setDisplayedProgress(prev => {
      // Calculate the difference between displayed and actual progress
      const diff = newOverallProgress - prev;

      // Calculate the base increment to move towards the target
      let increment = diff * 0.08; // Move 8% towards the target each frame

      // Add some randomness, especially when not close to the target
      if (Math.abs(diff) > 1) {
        increment += (Math.random() - 0.4) * 0.6;
      }

      // If a step just changed, give a slightly larger random boost forward
      if (stepChanged && newOverallProgress < 99) {
        increment += Math.random() * 2.5; // Add a jump of 0 to 2.5%
      }

      // Update displayed progress
      let newDisplayedProgress = prev + increment;

      // Clamp displayed progress: 0 to 100
      newDisplayedProgress = Math.max(0, Math.min(100, newDisplayedProgress));

      // Ensure displayed progress doesn't fall too far behind actual progress
      newDisplayedProgress = Math.max(newDisplayedProgress, newOverallProgress - 10);

      // Ensure displayed progress doesn't jump unreasonably far ahead
      newDisplayedProgress = Math.min(newDisplayedProgress, newOverallProgress + 5);

      // Final Catch-up
      if (newOverallProgress >= 100) {
        newDisplayedProgress += (100 - newDisplayedProgress) * 0.2;
        if (100 - newDisplayedProgress < 0.1) {
          newDisplayedProgress = 100; // Snap to 100 when very close
        }
      }
      
      return newDisplayedProgress;
    });

    // Loop Control
    if (overallProgress < 100) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else {
      // Loading complete
      if (activeListItemRef.current) {
        activeListItemRef.current.classList.remove('step-active', 'ellipsis');
        activeListItemRef.current.classList.add('step-completed');
      }
      
      // Hide modal after delay
      setTimeout(() => {
        onComplete();
      }, completionDelay);
    }
  };

  // Initialize and start the loading modal
  const startLoading = () => {
    startTimeRef.current = Date.now();
    setCurrentStepIndex(0);
    setStepTimer(0);
    setOverallProgress(0);
    setDisplayedProgress(0);
    setElapsedTime(0);
    activeListItemRef.current = null;

    const listItems = document.querySelectorAll('#step-list li');
    listItems.forEach(li => {
      li.classList.remove('step-active', 'step-completed', 'ellipsis');
    });

    setTimeout(() => {
      updateStepHighlighting();
    }, 100);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(animationLoop);
  };

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      startLoading();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, currentStep]);

  // Force modal to close after a reasonable timeout as a failsafe
  useEffect(() => {
    let timeoutId: number | null = null;
    
    if (isOpen) {
      // Set a maximum time the modal can stay open (30 seconds)
      timeoutId = window.setTimeout(() => {
        console.log('Loading modal safety timeout reached - forcing completion');
        onComplete();
      }, 30000);
    }
    
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center transform transition-all duration-300 ease-out">
        <div className="mx-auto mb-8 h-16 w-16 md:h-20 md:w-20 relative">
          <div className="pulse-container">
            {[...Array(8)].map((_, index) => (
              <div 
                key={index} 
                className={`pulse-circle pulse-circle-${8 - index}`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  width: `${100 - index * 7.5}%`,
                  height: `${100 - index * 7.5}%`,
                  backgroundColor: `rgba(122, 92, 255, ${0.15 + index * 0.1})`,
                  animation: 'pulseRing 2.5s infinite ease-in-out',
                  animationDelay: `${0.7 - index * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        <ul id="step-list" className="space-y-2 mb-6">
          {steps.map(step => (
            <li 
              key={step.id}
              data-step={step.id}
              className="transition-all duration-400 ease-in-out text-gray-300 text-base font-normal opacity-90 min-h-7 leading-7 flex items-center justify-center"
            >
              {step.text}
            </li>
          ))}
        </ul>

        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2.5 w-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#7a5cff] to-[#f649a3] transition-all duration-300 ease-out"
              style={{ width: `${Math.floor(displayedProgress)}%` }}
              role="progressbar" 
              aria-valuenow={Math.floor(displayedProgress)} 
              aria-valuemin={0} 
              aria-valuemax={100}
            />
          </div>
          <div className="flex justify-between text-xs md:text-sm text-gray-600 mt-2 px-1">
            <span>{Math.floor(displayedProgress)}% Complete</span>
            <span>Time elapsed: {formatTime(elapsedTime)}</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-gray-500">
          Este processo geralmente leva cerca de 1 minuto. Por favor, aguarde.
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
