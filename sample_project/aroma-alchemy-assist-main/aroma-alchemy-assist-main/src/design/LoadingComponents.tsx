
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import '../components/loading-modal.css';

export const LoadingCircle = () => {
  return (
    <div className="w-20 h-20 relative mx-auto">
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
  );
};

export const ProgressBar = () => {
  const [progress, setProgress] = useState(45);
  
  const handleIncrement = () => {
    setProgress(prev => Math.min(prev + 10, 100));
  };
  
  const handleDecrement = () => {
    setProgress(prev => Math.max(prev - 10, 0));
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-200 rounded-full h-2.5 w-full overflow-hidden">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-[#7a5cff] to-[#f649a3] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar" 
          aria-valuenow={progress} 
          aria-valuemin={0} 
          aria-valuemax={100}
        />
      </div>
      <div className="flex justify-between text-xs md:text-sm text-gray-600 mt-2 px-1">
        <span>{progress}% Complete</span>
        <span>Time elapsed: 00:45</span>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleDecrement} variant="outline" size="sm">-10%</Button>
        <Button onClick={handleIncrement} variant="outline" size="sm">+10%</Button>
      </div>
    </div>
  );
};

export const StepList = () => {
  const steps = [
    { id: 1, text: "Connecting to Server", status: "completed" },
    { id: 2, text: "Fetching User Data", status: "active" },
    { id: 3, text: "Initializing Components", status: "pending" },
    { id: 4, text: "Applying Preferences", status: "pending" },
  ];
  
  return (
    <ul id="step-list" className="space-y-2">
      {steps.map(step => (
        <li 
          key={step.id}
          data-step={step.id}
          className={`
            transition-all duration-400 ease-in-out 
            ${step.status === 'active' ? 'step-active ellipsis' : ''}
            ${step.status === 'completed' ? 'step-completed' : ''}
          `}
        >
          {step.text}
        </li>
      ))}
    </ul>
  );
};

const LoadingComponents: React.FC = () => {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Pulsing Loading Circle</h2>
        <Card>
          <CardContent className="pt-6">
            <LoadingCircle />
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Progress Bar</h2>
        <Card>
          <CardContent className="pt-6">
            <ProgressBar />
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Step List</h2>
        <Card>
          <CardContent className="pt-6">
            <StepList />
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default LoadingComponents;
