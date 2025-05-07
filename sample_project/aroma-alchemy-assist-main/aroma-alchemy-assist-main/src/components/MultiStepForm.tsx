
import React, { useEffect, useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import StepHealthConcern from './StepHealthConcern';
import StepDemographics from './StepDemographics';
import StepCauses from './StepCauses';
import StepSymptoms from './StepSymptoms';
import StepReview from './StepReview';
import PropertiesView from './PropertiesView';
import OilsView from './OilsView';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import LoadingModal from './LoadingModal';
import './loading-modal.css';

const MultiStepForm: React.FC = () => {
  const {
    currentStep,
    prevStep,
    isLoading,
    setIsLoading,
    error,
    setError
  } = useFormContext();
  
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  useEffect(() => {
    // Clear errors when steps change
    setError(null);
    
    // Show loading modal when isLoading is true
    if (isLoading) {
      setShowLoadingModal(true);
    } else {
      setShowLoadingModal(false); // Explicitly hide modal when not loading
    }
  }, [currentStep, isLoading, setError]);

  // Handle loading modal completion
  const handleLoadingComplete = () => {
    console.log("Loading modal completed - hiding modal and setting isLoading to false");
    setShowLoadingModal(false);
    setIsLoading(false);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'health-concern':
        return <StepHealthConcern />;
      case 'demographics':
        return <StepDemographics />;
      case 'causes':
        return <StepCauses />;
      case 'symptoms':
        return <StepSymptoms />;
      case 'review':
        return <StepReview />;
      case 'properties':
        return <PropertiesView />;
      case 'oils':
        return <OilsView />;
      default:
        return <StepHealthConcern />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto rounded-xl p-6 md:p-8">
      <div className="mb-6">
        
        {/* Progress indicator - only show for steps after health-concern */}
        {currentStep !== 'health-concern' && (
          <div className="mt-6 mb-8">
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7a5cff] to-[#f649a3] transition-all duration-500" 
                style={{
                  width: `${(['health-concern', 'demographics', 'causes', 'symptoms', 'review', 'properties', 'oils'].indexOf(currentStep) + 1) / 7 * 100}%`
                }}
              />
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Form content */}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {renderCurrentStep()}
      </div>
      
      {/* Back button for steps after health concern */}
      {currentStep !== 'health-concern' && (
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={isLoading} 
            className="hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d1b3ff]"
          >
            Voltar
          </Button>
        </div>
      )}
      
      {/* Loading Modal */}
      <LoadingModal isOpen={showLoadingModal} onComplete={handleLoadingComplete} />
    </div>
  );
};

export default MultiStepForm;
