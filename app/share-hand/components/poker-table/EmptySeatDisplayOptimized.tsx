import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptySeatDisplayProps {
  position: string;
  className?: string;
}

const EmptySeatDisplayOptimized = React.memo<EmptySeatDisplayProps>(({ position, className }) => {
  return (
    <Card
      className={cn(
        'border border-dashed border-slate-700 bg-slate-900/50',
        'hover:border-slate-600 hover:bg-slate-900/70 transition-all duration-200',
        className,
      )}
    >
      <CardContent className="p-3">
        <div className="flex flex-col items-center justify-center h-full min-h-[60px]">
          <UserPlus className="w-6 h-6 text-slate-600 mb-1" />
          <p className="text-xs text-slate-600">Empty Seat</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{position}</p>
        </div>
      </CardContent>
    </Card>
  );
});

EmptySeatDisplayOptimized.displayName = 'EmptySeatDisplayOptimized';

export { EmptySeatDisplayOptimized };
