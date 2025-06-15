
import { useState, useEffect } from 'react';
import { Player, ShareHandFormData } from '@/types/shareHand';

export const usePlayerManagement = (formData: ShareHandFormData, setFormData: (data: ShareHandFormData) => void) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize empty players array if needed
  useEffect(() => {
    if (!isInitialized && (!formData.players || formData.players.length === 0)) {
      console.log('Initializing empty players array');
      
      setFormData({
        ...formData,
        players: []
      });
      
      setIsInitialized(true);
    }
  }, [isInitialized, formData, setFormData]);

  const players: Player[] = formData.players || [];

  // Update a player
  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    console.log(`Updating player ${playerId} with:`, updates);
    
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        const updatedPlayer = { 
          ...player, 
          ...updates,
          stackSize: updates.stackSize ? [...updates.stackSize] : [...player.stackSize]
        };
        console.log(`Player ${playerId} updated:`, updatedPlayer);
        return updatedPlayer;
      }
      return player;
    });
    
    // Update legacy formData fields for backwards compatibility
    const heroPlayer = updatedPlayers.find(p => p.isHero);
    const villainPlayer = updatedPlayers.find(p => !p.isHero);
    
    const newFormData = {
      ...formData,
      players: updatedPlayers,
      heroPosition: heroPlayer?.position || '',
      villainPosition: villainPlayer?.position || '',
      heroStackSize: heroPlayer?.stackSize ? [...heroPlayer.stackSize] : [100],
      villainStackSize: villainPlayer?.stackSize ? [...villainPlayer.stackSize] : [100]
    };
    
    console.log('Player updated, triggering action reinitialization:', newFormData);
    setFormData(newFormData);
  };

  // Add a new player - not needed anymore since we add players directly via table clicks
  const addPlayer = () => {
    // This method is kept for backwards compatibility but won't be used
    console.log('addPlayer called - not needed with new table interface');
  };

  // Remove a player
  const removePlayer = (playerId: string) => {
    const updatedPlayers = players.filter(p => p.id !== playerId);
    
    // Update legacy formData fields
    const heroPlayer = updatedPlayers.find(p => p.isHero);
    const villainPlayer = updatedPlayers.find(p => !p.isHero);
    
    const newFormData = {
      ...formData,
      players: updatedPlayers,
      heroPosition: heroPlayer?.position || '',
      villainPosition: villainPlayer?.position || '',
      heroStackSize: heroPlayer?.stackSize ? [...heroPlayer.stackSize] : [100],
      villainStackSize: villainPlayer?.stackSize ? [...villainPlayer.stackSize] : [100]
    };
    
    console.log('Player removed, triggering action reinitialization:', newFormData);
    setFormData(newFormData);
  };

  return {
    players,
    updatePlayer,
    addPlayer,
    removePlayer
  };
};
