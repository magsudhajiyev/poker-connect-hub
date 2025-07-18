import React from 'react';
import { UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptySeatDisplayProps {
  position: string;
  className?: string;
}

const EmptySeatDisplayOptimized = React.memo<EmptySeatDisplayProps>(({ position, className }) => {
  return (
    <div
      className={cn(
        'w-20 h-20 rounded-full flex flex-col items-center justify-center',
        'border-2 border-dashed border-slate-700 bg-slate-900/50',
        'hover:border-slate-600 hover:bg-slate-900/70 transition-all duration-200',
        className,
      )}
    >
      <UserPlus className="w-5 h-5 text-slate-600 mb-1" />
      <p className="text-xs text-slate-600">Empty</p>
      <p className="text-xs text-slate-500 font-medium">{position}</p>
    </div>
  );
});

EmptySeatDisplayOptimized.displayName = 'EmptySeatDisplayOptimized';

export { EmptySeatDisplayOptimized };
