'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { useShareHandContext } from './ShareHandProvider';
import { validateCurrentStep } from '@/utils/shareHandValidation';

interface ShareHandNavigationProps {
  onValidationError: () => void;
}

const ShareHandNavigation = ({ onValidationError }: ShareHandNavigationProps) => {
  const { currentStep, steps, prevStep, nextStep, handleSubmit, formData } = useShareHandContext();

  const handleNextStep = () => {
    // Check validation before attempting to advance
    const validation = validateCurrentStep(currentStep, formData);
    
    if (!validation.isValid) {
      // If validation fails, trigger the error state
      onValidationError();
      return;
    }
    
    // If validation passes, proceed to next step
    nextStep();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-2 pt-3">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={currentStep === 0}
        className="border-slate-700/50 text-slate-300 disabled:opacity-50 w-full sm:w-auto order-2 sm:order-1 h-9"
      >
        <ArrowLeft className="w-3 h-3 mr-2" />
        Previous
      </Button>
      
      <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <Button
            variant="outline"
            onClick={handleSubmit}
            className="border-slate-700/50 text-slate-300 w-full sm:w-auto h-9"
          >
            <Share2 className="w-3 h-3 mr-2" />
            Share Now
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNextStep}
            className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 w-full sm:w-auto h-9"
          >
            Next Step
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 w-full sm:w-auto h-9"
          >
            <Share2 className="w-3 h-3 mr-2" />
            Complete & Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShareHandNavigation;