'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShareHandFormData } from '@/types/shareHand';
import SelectedCardsDisplay from './SelectedCardsDisplay';
import ActionDisplay from './ActionDisplay';
// Removed old imports - using new state machine architecture

interface HandReplayProps {
  formData: ShareHandFormData;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  // gameState removed - using new state machine architecture
}

const HandReplay = ({
  formData,
  getPositionName,
  getCurrencySymbol,
  // gameState removed
}: HandReplayProps) => {
  const [currentStreet, setCurrentStreet] = useState<number>(0);
  // Removed old game state logic - using new state machine architecture

  const streets = [
    {
      id: 'preflop',
      title: 'Preflop',
      actions: formData.preflopActions,
      cards: [],
      description: formData.preflopDescription,
    },
    {
      id: 'flop',
      title: 'Flop',
      actions: formData.flopActions,
      cards: formData.flopCards,
      description: formData.flopDescription,
    },
    {
      id: 'turn',
      title: 'Turn',
      actions: formData.turnActions,
      cards: formData.turnCard,
      description: formData.turnDescription,
    },
    {
      id: 'river',
      title: 'River',
      actions: formData.riverActions,
      cards: formData.riverCard,
      description: formData.riverDescription,
    },
  ];

  const goToPreviousStreet = () => {
    if (currentStreet > 0) {
      setCurrentStreet(currentStreet - 1);
    }
  };

  const goToNextStreet = () => {
    if (currentStreet < streets.length - 1) {
      setCurrentStreet(currentStreet + 1);
    }
  };

  const goToStreet = (streetIndex: number) => {
    setCurrentStreet(streetIndex);
  };

  const currentStreetData = streets[currentStreet];

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <h3 className="text-slate-200 font-medium mb-4">Hand Replay</h3>

      {/* Hand Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousStreet}
          disabled={currentStreet === 0}
          className="w-14 h-14 border-slate-700/50 text-slate-400 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex space-x-2">
          {streets.map((street, index) => {
            const isCurrentStreet = index === currentStreet;
            const hasActions = street.actions && street.actions.length > 0;

            return (
              <Button
                key={street.id}
                size="sm"
                onClick={() => goToStreet(index)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors round-tab ${
                  isCurrentStreet
                    ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900'
                    : hasActions
                      ? 'bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-800/50'
                      : 'bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                }`}
                data-round={street.id}
              >
                {street.title}
                {hasActions && !isCurrentStreet && <span className="ml-1 text-emerald-400">●</span>}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextStreet}
          disabled={currentStreet === streets.length - 1}
          className="w-14 h-14 border-slate-700/50 text-slate-400 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Street Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-slate-200">{currentStreetData.title}</h4>
        </div>

        {/* Hero Cards - Always shown */}
        {formData.holeCards.length > 0 && (
          <SelectedCardsDisplay cards={formData.holeCards} label="Hero Cards" />
        )}

        {/* Community Cards - Side by side layout */}
        {(currentStreet >= 1 || currentStreet === 3) && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start gap-6">
              {currentStreet >= 1 && formData.flopCards.length > 0 && (
                <SelectedCardsDisplay cards={formData.flopCards} label="Flop" />
              )}
              {currentStreet >= 2 && formData.turnCard.length > 0 && (
                <SelectedCardsDisplay cards={formData.turnCard} label="Turn" />
              )}
              {currentStreet >= 3 && formData.riverCard.length > 0 && (
                <SelectedCardsDisplay cards={formData.riverCard} label="River" />
              )}
            </div>
          </div>
        )}

        {/* Actions for Current Street */}
        {currentStreetData.actions.length > 0 && (
          <ActionDisplay
            actions={currentStreetData.actions}
            formData={formData}
            getPositionName={getPositionName}
            getCurrencySymbol={getCurrencySymbol}
          />
        )}

        {/* Street Description */}
        {currentStreetData.description && (
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
            <h5 className="text-slate-300 font-medium mb-2">Analysis</h5>
            <p className="text-slate-400 text-sm">{currentStreetData.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandReplay;
