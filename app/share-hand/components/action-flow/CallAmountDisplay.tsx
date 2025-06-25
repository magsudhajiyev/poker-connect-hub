'use client';


import React from 'react';
import { Label } from '@/components/ui/label';

interface CallAmountDisplayProps {
  betAmount: string;
  getCurrencySymbol: () => string;
}

export const CallAmountDisplay = ({
  betAmount,
  getCurrencySymbol,
}: CallAmountDisplayProps) => {
  return (
    <div className="w-full">
      <Label className="text-slate-300 text-xs">Call Amount</Label>
      <div className="text-emerald-400 font-medium text-xs">
        {getCurrencySymbol()}{betAmount}
      </div>
    </div>
  );
};
