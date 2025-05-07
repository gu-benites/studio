
// src/app/loading-state/page.tsx
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

const stepsConfig = [
  { id: 1, text: "Connecting to Server", duration: 1500 },
  { id: 2, text: "Fetching User Data", duration: 2500 },
  { id: 3, text: "Initializing Components", duration: 3000 },
  { id: 4, text: "Applying Preferences", duration: 2000 },
  { id: 5, text: "Finalizing Setup", duration: 1000 },
];
const totalDuration = stepsConfig.reduce((sum, step) => sum + step.duration, 0);

const LoadingStatePage: React.FC = () => {
  const [startTime, setStartTime] = React.useState(0);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [stepTimer, setStepTimer] = React.useState(0);
  const [isLoadingComplete, setIsLoadingComplete] = React.useState(false);
  const [overallProgress, setOverallProgress] = React.useState(0);
  const [displayedProgress, setDisplayedProgress] = React.useState(0);
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const animationFrameIdRef = React.useRef<number | null>(null);
  
  const stateRefs = React.useRef({
    startTime: 0,
    isLoadingComplete: false,
    currentStepIndex: 0,
    stepTimer: 0,
    overallProgress: 0,
    // Add other state variables that are read in the animation loop
    displayedProgress: 0, 
    elapsedTime: 0,
  });

  // Update refs whenever state changes
  React.useEffect(() => {
    stateRefs.current.startTime = startTime;
    stateRefs.current.isLoadingComplete = isLoadingComplete;
    stateRefs.current.currentStepIndex = currentStepIndex;
    stateRefs.current.stepTimer = stepTimer;
    stateRefs.current.overallProgress = overallProgress;
    stateRefs.current.displayedProgress = displayedProgress;
    stateRefs.current.elapsedTime = elapsedTime;
  }, [startTime, isLoadingComplete, currentStepIndex, stepTimer, overallProgress, displayedProgress, elapsedTime]);


  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const startLoading = React.useCallback(() => {
    const initialStartTime = Date.now();
    // Set initial states directly
    setStartTime(initialStartTime);
    setCurrentStepIndex(0);
    setStepTimer(0);
    setIsLoadingComplete(false);
    setOverallProgress(0);
    setDisplayedProgress(0);
    setElapsedTime(0);
    setIsModalVisible(true); // Make modal visible once setup
    
    // Update refs for the first frame
    stateRefs.current.startTime = initialStartTime;
    stateRefs.current.isLoadingComplete = false;
    stateRefs.current.currentStepIndex = 0;
    stateRefs.current.stepTimer = 0;
    stateRefs.current.overallProgress = 0;
    stateRefs.current.displayedProgress = 0;
    stateRefs.current.elapsedTime = 0;

    let stepChangedInFrame = false;

    const animationLoop = (timestamp: number) => {
      stepChangedInFrame = false; 

      const newElapsedTime = Date.now() - stateRefs.current.startTime;
      setElapsedTime(newElapsedTime); // Update state for UI

      let newStepTimer = stateRefs.current.stepTimer;
      let newCurrentStepIndex = stateRefs.current.currentStepIndex;
      let newIsLoadingComplete = stateRefs.current.isLoadingComplete;

      if (!newIsLoadingComplete && newCurrentStepIndex < stepsConfig.length) {
        newStepTimer += 16.67; // Approximate time per frame
        const currentStepConfig = stepsConfig[newCurrentStepIndex];
        
        if (currentStepConfig && newStepTimer >= currentStepConfig.duration) {
          if (newCurrentStepIndex === stepsConfig.length - 1) {
            newIsLoadingComplete = true;
            setIsLoadingComplete(true); // Update state
          } else {
            newCurrentStepIndex++;
            setCurrentStepIndex(i => i + 1); // Update state
            stepChangedInFrame = true;
            newStepTimer = 0; // Reset timer for the new step
          }
        }
      }
      setStepTimer(newStepTimer); // Update state

      let completedDuration = 0;
      for (let i = 0; i < newCurrentStepIndex; i++) {
          completedDuration += stepsConfig[i].duration;
      }
      const currentStepProgressTime = (newCurrentStepIndex < stepsConfig.length)
          ? Math.min(newStepTimer, stepsConfig[newCurrentStepIndex]?.duration || 0)
          : (stepsConfig[stepsConfig.length - 1]?.duration || 0);
      const totalProgressTime = completedDuration + currentStepProgressTime;
      const newOverallProgress = Math.min(100, (totalProgressTime / totalDuration) * 100);
      setOverallProgress(newOverallProgress); // Update state
      
      if (!newIsLoadingComplete || stateRefs.current.displayedProgress < 100) {
        const diff = newOverallProgress - stateRefs.current.displayedProgress;
        let increment = diff * 0.08;
        if (Math.abs(diff) > 1) {
          increment += (Math.random() - 0.4) * 0.6;
        }
        if (stepChangedInFrame && newOverallProgress < 99) {
          increment += Math.random() * 2.5;
        }
        let newDisplayed = stateRefs.current.displayedProgress + increment;
        newDisplayed = Math.max(0, Math.min(100, newDisplayed));
        newDisplayed = Math.max(newDisplayed, newOverallProgress - 10);
        newDisplayed = Math.min(newDisplayed, newOverallProgress + 5);

        if (newOverallProgress >= 100) {
          newDisplayed += (100 - newDisplayed) * 0.2;
          if (100 - newDisplayed < 0.1) {
            newDisplayed = 100;
          }
        }
        setDisplayedProgress(newDisplayed); // Update state
      }
      
      animationFrameIdRef.current = requestAnimationFrame(animationLoop);
    };
    
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(animationLoop);

  }, []); // Removed dependencies to ensure it runs once


  React.useEffect(() => {
    startLoading();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [startLoading]);

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ease-out",
      isModalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "bg-background rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center transform transition-all duration-300 ease-out",
        isModalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        <div className="mx-auto mb-8 h-16 w-16 md:h-20 md:w-20 relative">
          {/* Pulse Circles */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/15" style={{ width: '100%', height: '100%', animationDelay: '0.7s' }}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/20" style={{ width: '92.5%', height: '92.5%', animationDelay: '0.6s' }}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/25" style={{ width: '85%', height: '85%', animationDelay: '0.5s' }}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/35" style={{ width: '77.5%', height: '77.5%', animationDelay: '0.4s' }}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/45" style={{ width: '70%', height: '70%', animationDelay: '0.3s' }}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/55" style={{ width: '62.5%', height: '62.5%', animationDelay: '0.2s' }}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/70" style={{ width: '55%', height: '55%', animationDelay: '0.1s' }}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-primary/85" style={{ width: '47.5%', height: '47.5%', animationDelay: '0s' }}></div>
        </div>

        <ul className="space-y-2 mb-6">
          {stepsConfig.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "transition-all duration-400 ease-in-out text-base min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center relative",
                index < currentStepIndex && "text-muted-foreground line-through opacity-70 font-normal text-sm",
                index === currentStepIndex && !isLoadingComplete && "text-foreground font-bold text-lg opacity-100 after:inline-block after:ml-1 after:w-[1.5em] after:text-left after:align-bottom after:content-[''] after:animate-ellipsis",
                (index === currentStepIndex && isLoadingComplete) && "text-foreground font-bold text-lg opacity-100", 
                index > currentStepIndex && "text-muted-foreground opacity-90 font-normal text-sm"
              )}
            >
              {index < currentStepIndex && <span className="font-bold mr-1">✓ </span>}
              {step.text}
            </li>
          ))}
        </ul>
        
        <div className="mb-4">
          <div className="bg-muted rounded-full h-2.5 w-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-primary to-pink-500"
              style={{ width: `${displayedProgress}%` }}
              role="progressbar" 
              aria-valuenow={Math.floor(displayedProgress)} 
              aria-valuemin={0} 
              aria-valuemax={100}
            ></div>
          </div>
          <div className="flex justify-between text-xs md:text-sm text-muted-foreground mt-2 px-1">
            <span>{Math.floor(displayedProgress)}% Complete</span>
            <span>Time elapsed: {formatTime(elapsedTime)}</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground">
          This process usually takes about 1 minute. Please keep this window open.
        </p>
      </div>
    </div>
  );
};

export default LoadingStatePage;
