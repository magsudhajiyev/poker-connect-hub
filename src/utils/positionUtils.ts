
import { Player } from '@/types/shareHand';

// Get all available positions (limited to 9 for max poker game size)
export const getAllPositions = () => [
  { value: 'utg', label: 'UTG' },
  { value: 'utg1', label: 'UTG+1' },
  { value: 'mp', label: 'Middle Position' },
  { value: 'lj', label: 'Lojack' },
  { value: 'hj', label: 'Hijack' },
  { value: 'co', label: 'Cut Off' },
  { value: 'btn', label: 'Button' },
  { value: 'sb', label: 'Small Blind' },
  { value: 'bb', label: 'Big Blind' }
];

// Get available positions for a player (exclude other players' positions)
export const getAvailablePositions = (players: Player[], currentPlayerId: string) => {
  const usedPositions = players
    .filter(p => p.id !== currentPlayerId)
    .map(p => p.position)
    .filter(Boolean);
  
  return getAllPositions().filter(pos => !usedPositions.includes(pos.value));
};
