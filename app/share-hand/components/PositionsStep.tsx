'use client';

import React from 'react';
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';
import { PokerTable } from './poker-table';
import { Player, ShareHandFormData } from '@/types/shareHand';

interface PositionsStepProps {
  formData: ShareHandFormData;
  setFormData: React.Dispatch<React.SetStateAction<ShareHandFormData>>;
  showValidationErrors?: boolean;
  getCurrencySymbol?: () => string;
}

const PositionsStep = ({
  formData,
  setFormData,
  getCurrencySymbol = () => '$',
}: PositionsStepProps) => {
  const { players, removePlayer } = usePlayerManagement(formData, setFormData);

  const handleUpdatePlayer = (newPlayer: Player) => {
    // Use callback pattern to ensure we have the latest state
    setFormData((prevFormData: ShareHandFormData): ShareHandFormData => {
      const currentPlayers = prevFormData.players || [];

      // If this player is being set as hero, remove hero status from others
      let updatedPlayers = currentPlayers.map((p) => {
        if (newPlayer.isHero && p.isHero && p.id !== newPlayer.id) {
          return { ...p, isHero: false };
        }
        return p;
      });

      // Check if this is a new player or updating existing
      const existingPlayerIndex = updatedPlayers.findIndex(
        (p) => p.position === newPlayer.position,
      );

      if (existingPlayerIndex >= 0) {
        // Update existing player
        updatedPlayers[existingPlayerIndex] = newPlayer;
      } else {
        // Add new player
        updatedPlayers = [...updatedPlayers, newPlayer];
      }

      return {
        ...prevFormData,
        players: updatedPlayers,
      };
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-base font-medium text-slate-200">Player Positions & Stack Sizes</h3>
        <p className="text-sm text-slate-400">
          Click on any position around the table to add or edit players
        </p>
      </div>

      {/* Interactive Poker Table */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
        <PokerTable
          players={players}
          getCurrencySymbol={getCurrencySymbol}
          gameFormat={formData.gameFormat}
          onUpdatePlayer={handleUpdatePlayer}
          onRemovePlayer={handleRemovePlayer}
          availablePositions={getAvailablePositions(players, '')}
          isPositionsStep={true}
        />
      </div>

      {/* Instructions */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600/30">
        <h4 className="text-sm font-medium text-slate-200 mb-2">Instructions</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Click on empty positions (dotted circles) to add new players</li>
          <li>• Click on existing players to edit their name, stack size, or hero status</li>
          <li>• Set one player as "Hero" - this will be your position in the hand</li>
          <li>• You need at least 2 players to continue to the next step</li>
        </ul>
      </div>
    </div>
  );
};

export default PositionsStep;
