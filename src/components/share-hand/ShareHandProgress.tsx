
import { Progress } from '@/components/ui/progress';
import { useShareHandContext } from './ShareHandProvider';

const ShareHandProgress = () => {
  const { currentStep, steps } = useShareHandContext();
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-sm text-slate-400">
        {steps.map((step, index) => (
          <span key={step.id} className={index <= currentStep ? 'text-emerald-400' : ''}>
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ShareHandProgress;
