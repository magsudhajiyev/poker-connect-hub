
import React from 'react';

interface PotDisplayProps {
  pot: number;
  getCurrencySymbol: () => string;
}

const PotDisplay = ({ pot, getCurrencySymbol }: PotDisplayProps) => {
  if (pot <= 0) return null;

  return (
    <div className="text-center mb-4">
      <div className="inline-block bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-2">
        <span className="text-emerald-400 font-bold text-lg">
          Pot: {getCurrencySymbol()}{pot}
        </span>
      </div>
    </div>
  );
};

export default PotDisplay;
