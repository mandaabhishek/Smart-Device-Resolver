import React from 'react';
import { Step } from '../types';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: Step;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { id: Step.CATEGORY, label: 'Category' },
    { id: Step.SYMPTOMS, label: 'Symptoms' },
    { id: Step.SPECS, label: 'Specs' },
    { id: Step.RESULTS, label: 'Results' },
  ];

  // Don't show stepper on landing or admin or analyzing
  if (currentStep === Step.LANDING || currentStep === Step.ADMIN || currentStep === Step.ANALYZING) return null;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted ? 'bg-blue-600 border-blue-600' : isCurrent ? 'bg-white border-blue-600' : 'bg-white border-slate-300'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-xs font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
