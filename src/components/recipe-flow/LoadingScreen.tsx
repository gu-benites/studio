
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRecipeForm } from '@/contexts/RecipeFormContext';
import type { RecipeFormData } from '@/contexts/RecipeFormContext'; // Ensure this is correctly typed

interface LoadingStepMessage {
  id: string;
  text: (formData: RecipeFormData) => string;
  duration: number;
}

interface LoadingScreenProps {
  targetStepKey: 'causes' | 'symptoms' | 'properties' | 'recipe-choices'; // To determine which set of messages to use
}

const ageCategoriesMap: Record<string, string> = {
  baby: "Bebê",
  child: "Criança",
  teen: "Adolescente",
  adult: "Adulto",
  senior: "Idoso",
};
const genderMap: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
};

const getLoadingStepsConfig = (targetStepKey: LoadingScreenProps['targetStepKey'], formData: RecipeFormData): LoadingStepMessage[] => {
  const ageCategoryLabel = formData.ageCategory ? ageCategoriesMap[formData.ageCategory] || formData.ageCategory : 'N/A';
  const genderLabel = formData.gender ? genderMap[formData.gender] || formData.gender : 'N/A';

  switch (targetStepKey) {
    case 'causes':
      return [
        { id: 'connect_server_causes', text: () => "Conectando ao Servidor...", duration: 1500 },
        { id: 'send_concern_causes', text: (data) => `Analisando Problema de Saúde: ${data.healthConcern || 'N/A'}`, duration: 2500 },
        { id: 'search_causes', text: () => "Buscando Causas Potenciais...", duration: 3000 },
        { id: 'match_gender_age_causes', text: () => `Considerando Demografia (Gênero: ${genderLabel}, Idade: ${ageCategoryLabel})`, duration: 2000 },
        { id: 'finalize_causes', text: () => "Finalizando Lista de Causas...", duration: 1000 },
      ];
    case 'symptoms':
      return [
        { id: 'connect_server_symptoms', text: () => "Conectando ao Servidor...", duration: 1200 },
        {
          id: 'analyze_causes_symptoms',
          text: (data) => {
            const causeNames = data.selectedCauses?.map(c => c.cause_name).slice(0, 2).join(', ');
            const remainingCount = data.selectedCauses ? Math.max(0, data.selectedCauses.length - 2) : 0;
            const displayCauses = causeNames ? `${causeNames}${remainingCount > 0 ? ` e mais ${remainingCount}` : ''}` : 'Nenhuma causa selecionada';
            return `Analisando Causas Selecionadas: ${displayCauses}`;
          },
          duration: 2800,
        },
        { id: 'search_symptoms', text: () => "Buscando Sintomas Potenciais...", duration: 3500 },
        { id: 'correlate_symptoms', text: () => "Correlacionando Sintomas com Causas...", duration: 2500 },
        { id: 'finalize_symptom_list', text: () => "Finalizando Lista de Sintomas...", duration: 1000 },
      ];
    case 'properties':
      return [
        { id: 'connect_server_properties', text: () => "Conectando ao Servidor...", duration: 1200 },
        {
          id: 'analyze_symptoms_properties',
          text: (data) => {
            const symptomNames = data.selectedSymptoms?.map(s => s.symptom_name).slice(0, 2).join(', ');
            const remainingCount = data.selectedSymptoms ? Math.max(0, data.selectedSymptoms.length - 2) : 0;
            const displaySymptoms = symptomNames ? `${symptomNames}${remainingCount > 0 ? ` e mais ${remainingCount}` : ''}` : 'Nenhum sintoma selecionado';
            return `Analisando Sintomas Selecionados: ${displaySymptoms}`;
          },
          duration: 2800,
        },
        { id: 'search_properties', text: () => "Buscando Propriedades Terapêuticas...", duration: 3500 },
        { id: 'match_properties', text: () => "Combinando Propriedades com Sintomas e Causas...", duration: 2500 },
        { id: 'finalize_property_list', text: () => "Finalizando Lista de Propriedades...", duration: 1000 },
      ];
    default:
      return [{ id: 'default_loading', text: () => "Carregando...", duration: 1000 }];
  }
};


const LoadingScreen: React.FC<LoadingScreenProps> = ({ targetStepKey }) => {
  const { formData } = useRecipeForm();

  const loadingStepsConfig = useMemo(() => getLoadingStepsConfig(targetStepKey, formData), [targetStepKey, formData]);
  const totalDuration = useMemo(() => loadingStepsConfig.reduce((sum, step) => sum + step.duration, 0), [loadingStepsConfig]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);

  const startTimeRef = useRef(Date.now());
  const stepTimerRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const isLoadingCompleteRef = useRef(false);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    setCurrentStepIndex(0);
    stepTimerRef.current = 0;
    setOverallProgress(0);
    setDisplayedProgress(0);
    setElapsedTime(0);
    isLoadingCompleteRef.current = false;

    const loop = () => {
      const now = Date.now();
      const currentElapsedTime = now - startTimeRef.current;
      setElapsedTime(currentElapsedTime);

      let stepChanged = false;

      if (!isLoadingCompleteRef.current && currentStepIndex < loadingStepsConfig.length) {
        stepTimerRef.current += 16.67; // Approximate time per frame
        const currentStepDuration = loadingStepsConfig[currentStepIndex].duration;

        if (stepTimerRef.current >= currentStepDuration) {
          if (currentStepIndex === loadingStepsConfig.length - 1) {
            isLoadingCompleteRef.current = true;
          } else {
            setCurrentStepIndex(prevIndex => prevIndex + 1);
            stepTimerRef.current = 0;
            stepChanged = true;
          }
        }
      }

      let completedDuration = 0;
      for (let i = 0; i < currentStepIndex; i++) {
        completedDuration += loadingStepsConfig[i].duration;
      }
      const currentStepProgressTime = (currentStepIndex < loadingStepsConfig.length)
        ? Math.min(stepTimerRef.current, loadingStepsConfig[currentStepIndex].duration)
        : (loadingStepsConfig.length > 0 ? loadingStepsConfig[loadingStepsConfig.length - 1].duration : 0);
      
      const totalProgressTime = completedDuration + currentStepProgressTime;
      const calculatedOverallProgress = totalDuration > 0 ? Math.min(100, (totalProgressTime / totalDuration) * 100) : 0;
      setOverallProgress(calculatedOverallProgress);

      setDisplayedProgress(prevDisplayedProgress => {
        let newDisplayedProgress = prevDisplayedProgress;
        const diff = calculatedOverallProgress - newDisplayedProgress;
        let increment = diff * 0.08; 
        if (Math.abs(diff) > 1) {
          increment += (Math.random() - 0.4) * 0.6; 
        }
        if (stepChanged && calculatedOverallProgress < 99) {
          increment += Math.random() * 2.5;
        }
        newDisplayedProgress += increment;
        newDisplayedProgress = Math.max(0, Math.min(100, newDisplayedProgress));
        newDisplayedProgress = Math.max(newDisplayedProgress, calculatedOverallProgress - 10);
        newDisplayedProgress = Math.min(newDisplayedProgress, calculatedOverallProgress + 5);

        if (calculatedOverallProgress >= 100) {
            newDisplayedProgress += (100 - newDisplayedProgress) * 0.2;
             if (100 - newDisplayedProgress < 0.1) {
                newDisplayedProgress = 100;
             }
        }
        return newDisplayedProgress;
      });
      
      if (!(isLoadingCompleteRef.current && displayedProgress >= 100)) {
        animationFrameIdRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [formData, loadingStepsConfig, totalDuration]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-out font-inter p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center transform transition-all duration-300 ease-out scale-100 opacity-100">
        
        <div className="mx-auto mb-8 h-16 w-16 md:h-20 md:w-20 relative">
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-ring"
                style={{
                  width: `${100 - i * 7.5}%`,
                  height: `${100 - i * 7.5}%`,
                  backgroundColor: `rgba(122, 92, 255, ${0.15 + i * 0.1})`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <ul className="space-y-2 mb-6 min-h-[140px]">
          {loadingStepsConfig.map((stepConfig, index) => {
            const stepText = stepConfig.text(formData);
            let statusClass = "text-gray-400 text-base font-normal opacity-90";
            if (index < currentStepIndex) {
              statusClass = "text-gray-500 text-base font-normal line-through opacity-70";
            }
            if (index === currentStepIndex && !isLoadingCompleteRef.current) {
              statusClass = "text-gray-800 text-lg font-bold opacity-100 ellipsis";
            }
            if (index === currentStepIndex && isLoadingCompleteRef.current) {
              statusClass = "text-gray-800 text-lg font-bold opacity-100";
            }
            return (
              <li key={stepConfig.id} className={`transition-all duration-400 ease-in-out min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center ${statusClass}`}>
                {index < currentStepIndex && <span className="font-bold mr-1">✓ </span>}
                {stepText}
              </li>
            );
          })}
        </ul>
        
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2.5 w-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-width duration-300 ease-out"
              style={{
                width: `${displayedProgress}%`,
                background: 'linear-gradient(to right, hsl(var(--aroma-grad-start-hsl)), hsl(var(--aroma-grad-end-hsl)))', 
              }}
              role="progressbar"
              aria-valuenow={Math.floor(displayedProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
          <div className="flex justify-between text-xs md:text-sm text-gray-600 mt-2 px-1">
            <span>{Math.floor(displayedProgress)}% Complete</span>
            <span>Time elapsed: {formatTime(elapsedTime)}</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-gray-500">
          Este processo leva em média {Math.ceil(totalDuration / 1000 / 60)} minuto(s). Por favor, mantenha esta janela aberta.
        </p>
      </div>
      <style jsx global>{`
        @keyframes pulseRing {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-pulse-ring {
          animation: pulseRing 2.5s infinite ease-in-out;
        }
        .ellipsis::after {
            display: inline-block;
            animation: ellipsis 1.6s infinite;
            content: "\\00a0"; /* Non-breaking space */
            width: 1.5em; 
            text-align: left;
            vertical-align: bottom;
        }
        @keyframes ellipsis {
            0%   { content: "\\00a0"; } 
            25%  { content: "."; }
            50%  { content: ".."; }
            75%  { content: "..."; }
            100% { content: "\\00a0"; } 
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
