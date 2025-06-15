
import React from 'react';
import PokerTableContainer from './PokerTableContainer';
import PotDisplay from './PotDisplay';
import { Player } from '@/types/shareHand';

interface PokerTableProps {
  players: Player[];
  communityCards?: string[];
  currentPlayer?: string;
  pot?: number;
  getCurrencySymbol?: () => string;
  gameFormat?: string;
  onUpdatePlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  availablePositions: Array<{value: string, label: string}>;
  currentStreet?: string;
  formData?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
  updateAction?: (street: any, index: number, action: string, betAmount?: string) => void;
  handleBetSizeSelect?: (street: any, index: number, amount: string) => void;
}

const PokerTable = ({ 
  players, 
  communityCards = [], 
  currentPlayer,
  pot = 0,
  getCurrencySymbol = () => '$',
  gameFormat = 'cash',
  onUpdatePlayer,
  onRemovePlayer,
  availablePositions,
  currentStreet,
  formData,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect
}: PokerTableProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Pot Display */}
      <PotDisplay pot={pot} getCurrencySymbol={getCurrencySymbol} />

      {/* Poker Table */}
      <PokerTableContainer
        players={players}
        communityCards={communityCards}
        currentPlayer={currentPlayer}
        getCurrencySymbol={getCurrencySymbol}
        gameFormat={gameFormat}
        onUpdatePlayer={onUpdatePlayer}
        onRemovePlayer={onRemovePlayer}
        availablePositions={availablePositions}
        currentStreet={currentStreet}
        formData={formData}
        getAvailableActions={getAvailableActions}
        updateAction={updateAction}
        handleBetSizeSelect={handleBetSizeSelect}
      />
    </div>
  );
};

export default PokerTable;
