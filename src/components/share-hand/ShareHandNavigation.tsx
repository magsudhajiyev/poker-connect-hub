
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { useShareHandContext } from './ShareHandProvider';

const ShareHandNavigation = () => {
  const { currentStep, steps, prevStep, nextStep, handleSubmit } = useShareHandContext();

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={currentStep === 0}
        className="border-slate-700/50 text-slate-300 disabled:opacity-50 w-full sm:w-auto order-2 sm:order-1"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <Button
            variant="outline"
            onClick={handleSubmit}
            className="border-slate-700/50 text-slate-300 w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Now
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={nextStep}
            className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 w-full sm:w-auto"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Complete & Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShareHandNavigation;
