'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { ActionButtons } from './ActionButtons';
import { BetInputSection } from './BetInputSection';
import { CallAmountDisplay } from './CallAmountDisplay';
// Removed old imports - using new state machine architecture

interface ActionStepCardProps {
  actionStep: any;
  index: number;
  street: string;
  availableActions: string[];
  formData: any;
  potSize: number;
  currentStackSize: number;
  // gameState removed - using new state machine architecture
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleActionClick: (actionStep: any, index: number, action: string) => void;
  handleBetInputChange: (actionStep: any, index: number, value: string) => void;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
}

export const ActionStepCard = ({
  actionStep,
  index,
  street,
  availableActions,
  formData,
  potSize,
  currentStackSize,
  // gameState removed
  getPositionName,
  getCurrencySymbol,
  getActionButtonClass,
  handleActionClick,
  handleBetInputChange,
  handleBetSizeSelect,
}: ActionStepCardProps) => {
  // Removed old game state logic - using new state machine architecture

  // Get position from action step or find the player in formData.players
  let playerPosition = actionStep.position;
  if (!playerPosition && formData.players) {
    const player = formData.players.find((p: any) => p.id === actionStep.playerId);
    playerPosition = player?.position || '';
  }

  // For now, we'll consider current player based on action completion status
  // This will be properly handled by the state machine
  const isCurrentPlayer = !actionStep.completed;

  return (
    <div
      className={`border rounded-lg p-2 w-full overflow-x-hidden transition-colors ${
        isCurrentPlayer ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700/50'
      }`}
      data-position={playerPosition}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-medium text-xs truncate ${
            actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'
          } ${isCurrentPlayer ? 'font-bold' : ''}`}
        >
          {actionStep.playerName} ({getPositionName(playerPosition)})
          {isCurrentPlayer && <span className="ml-1 text-emerald-400">●</span>}
        </span>
        {actionStep.completed && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
      </div>

      <div className="space-y-2 w-full">
        <ActionButtons
          actionStep={actionStep}
          index={index}
          availableActions={availableActions}
          isCurrentPlayer={isCurrentPlayer}
          getActionButtonClass={getActionButtonClass}
          handleActionClick={handleActionClick}
        />

        {(actionStep.action === 'bet' || actionStep.action === 'raise') && (
          <BetInputSection
            actionStep={actionStep}
            index={index}
            street={street}
            formData={formData}
            potSize={potSize}
            currentStackSize={currentStackSize}
            handleBetInputChange={handleBetInputChange}
            handleBetSizeSelect={handleBetSizeSelect}
          />
        )}

        {actionStep.action === 'call' && actionStep.betAmount && (
          <CallAmountDisplay
            betAmount={actionStep.betAmount}
            getCurrencySymbol={getCurrencySymbol}
          />
        )}
      </div>
    </div>
  );
};
