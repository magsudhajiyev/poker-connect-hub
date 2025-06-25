'use client';


import React from 'react';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmptySeatDisplayProps {
  position: string;
}

const EmptySeatDisplay = ({ position }: EmptySeatDisplayProps) => {
  const isMobile = useIsMobile();

  const getPositionLabel = (pos: string) => {
    const labels: { [key: string]: string } = {
      'utg': 'UTG',
      'utg1': 'UTG+1',
      'mp': 'MP',
      'lj': 'LJ',
      'hj': 'HJ',
      'co': 'CO',
      'btn': 'BTN',
      'sb': 'SB',
      'bb': 'BB',
    };
    return labels[pos] || pos.toUpperCase();
  };

  return (
    <div className={`${isMobile ? 'w-11 h-11' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full border-2 border-dashed border-slate-500 bg-slate-800/40 hover:bg-slate-700/60 transition-all duration-300 flex flex-col items-center justify-center group`}>
      <Plus className={`${isMobile ? 'w-3.5 h-3.5' : 'w-6 h-6'} text-slate-400 group-hover:text-slate-300`} />
      <div className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-slate-400 font-bold bg-slate-700/50 px-1 py-0.5 rounded mt-1`}>
        {getPositionLabel(position)}
      </div>
    </div>
  );
};

export default EmptySeatDisplay;
