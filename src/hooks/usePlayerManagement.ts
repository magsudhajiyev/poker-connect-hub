import React, { useEffect, useRef } from 'react';
import { Player, ShareHandFormData } from '@/types/shareHand';

export const usePlayerManagement = (
  formData: ShareHandFormData,
  setFormData: React.Dispatch<React.SetStateAction<ShareHandFormData>>,
) => {
  const isInitializedRef = useRef(false);

  // Initialize empty players array if needed - only check players, not entire formData
  useEffect(() => {
    // Only run once on mount or when players is undefined/null
    if (!isInitializedRef.current && !formData.players) {
      setFormData((prevData) => ({
        ...prevData,
        players: [],
      }));

      isInitializedRef.current = true;
    }
  }, []); // Run only once on mount

  const players: Player[] = formData.players || [];

  // Update a player
  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    const updatedPlayers = players.map((player) => {
      if (player.id === playerId) {
        const updatedPlayer = {
          ...player,
          ...updates,
          stackSize: updates.stackSize ? [...updates.stackSize] : [...player.stackSize],
        };
        return updatedPlayer;
      }
      return player;
    });

    // Update legacy formData fields for backwards compatibility
    const heroPlayer = updatedPlayers.find((p) => p.isHero);
    const villainPlayer = updatedPlayers.find((p) => !p.isHero);

    setFormData((prevData) => {
      const newFormData = {
        ...prevData,
        players: updatedPlayers,
        heroPosition: heroPlayer?.position || '',
        villainPosition: villainPlayer?.position || '',
        heroStackSize: heroPlayer?.stackSize ? [...heroPlayer.stackSize] : [100],
        villainStackSize: villainPlayer?.stackSize ? [...villainPlayer.stackSize] : [100],
      };

      return newFormData;
    });
  };

  // Add a new player - not needed anymore since we add players directly via table clicks
  const _addPlayer = () => {
    // This method is kept for backwards compatibility but won't be used
  };

  // Remove a player
  const removePlayer = (playerId: string) => {
    const updatedPlayers = players.filter((p) => p.id !== playerId);

    // Update legacy formData fields
    const heroPlayer = updatedPlayers.find((p) => p.isHero);
    const villainPlayer = updatedPlayers.find((p) => !p.isHero);

    setFormData((prevData) => {
      const newFormData = {
        ...prevData,
        players: updatedPlayers,
        heroPosition: heroPlayer?.position || '',
        villainPosition: villainPlayer?.position || '',
        heroStackSize: heroPlayer?.stackSize ? [...heroPlayer.stackSize] : [100],
        villainStackSize: villainPlayer?.stackSize ? [...villainPlayer.stackSize] : [100],
      };

      return newFormData;
    });
  };

  return {
    players,
    updatePlayer,
    addPlayer: _addPlayer,
    removePlayer,
  };
};
