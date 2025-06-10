
import React from 'react';
import { Player } from '@/types/shareHand';
import { useShareHandContext } from './ShareHandProvider';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import PotDisplay from './PotDisplay';

interface PokerTableProps {
  formData: any;
  setFormData: (data: any) => void;
  currentStep: number;
}

const PokerTable = ({ formData, setFormData, currentStep }: PokerTableProps) => {
  const { 
    getPositionName, 
    getCurrencySymbol, 
    calculatePotSize,
    gameStateUI 
  } = useShareHandContext();

  const players = formData.players || [];
  const potSize = calculatePotSize();

  // Define seat positions in clockwise order starting from top
  const seatPositions = [
    { position: 'utg', style: 'top-8 left-1/2 transform -translate-x-1/2' },
    { position: 'utg1', style: 'top-16 right-16' },
    { position: 'mp', style: 'top-32 right-8' },
    { position: 'lj', style: 'bottom-32 right-8' },
    { position: 'hj', style: 'bottom-16 right-16' },
    { position: 'co', style: 'bottom-8 left-1/2 transform -translate-x-1/2' },
    { position: 'btn', style: 'bottom-16 left-16' },
    { position: 'sb', style: 'bottom-32 left-8' },
    { position: 'bb', style: 'top-32 left-8' }
  ];

  const getPlayerAtPosition = (position: string) => {
    return players.find((player: Player) => player.position === position);
  };

  const isPositionAvailable = (position: string) => {
    return !players.some((player: Player) => player.position === position);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Poker Table */}
      <div className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-full border-8 border-amber-700 shadow-2xl" 
           style={{ aspectRatio: '16/10', minHeight: '500px' }}>
        
        {/* Table felt pattern */}
        <div className="absolute inset-4 bg-gradient-to-br from-green-700 to-green-800 rounded-full opacity-80" />
        
        {/* Community Cards Area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <CommunityCards formData={formData} setFormData={setFormData} currentStep={currentStep} />
        </div>

        {/* Pot Display */}
        {potSize > 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-12">
            <PotDisplay potSize={potSize} getCurrencySymbol={getCurrencySymbol} />
          </div>
        )}

        {/* Player Seats */}
        {seatPositions.map(({ position, style }) => {
          const player = getPlayerAtPosition(position);
          const isAvailable = isPositionAvailable(position);
          
          return (
            <div key={position} className={`absolute ${style}`}>
              <PlayerSeat
                position={position}
                player={player}
                isAvailable={isAvailable}
                formData={formData}
                setFormData={setFormData}
                currentStep={currentStep}
              />
            </div>
          );
        })}

        {/* Dealer Button */}
        {formData.players && formData.players.some((p: Player) => p.position === 'btn') && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 translate-x-8">
            <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center text-black font-bold text-sm shadow-lg">
              D
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokerTable;
