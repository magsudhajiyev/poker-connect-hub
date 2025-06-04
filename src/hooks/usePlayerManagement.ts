
import { useState, useEffect } from 'react';
import { Player, ShareHandFormData } from '@/types/shareHand';

export const usePlayerManagement = (formData: ShareHandFormData, setFormData: (data: ShareHandFormData) => void) => {
  // Initialize players in useEffect to avoid state update during render
  useEffect(() => {
    if (!formData.players || formData.players.length === 0) {
      const heroPlayer: Player = {
        id: 'hero',
        name: 'Hero',
        position: formData.heroPosition || '',
        stackSize: formData.heroStackSize || [100],
        isHero: true
      };
      
      const villainPlayer: Player = {
        id: 'villain',
        name: 'Villain 1',
        position: formData.villainPosition || '',
        stackSize: formData.villainStackSize || [100]
      };

      setFormData({
        ...formData,
        players: [heroPlayer, villainPlayer]
      });
    }
  }, [formData, setFormData]);

  const players: Player[] = formData.players || [];

  // Update a player
  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    const updatedPlayers = players.map(player => 
      player.id === playerId ? { ...player, ...updates } : player
    );
    
    // Also update legacy formData fields for backwards compatibility
    const heroPlayer = updatedPlayers.find(p => p.isHero);
    const villainPlayer = updatedPlayers.find(p => p.id === 'villain');
    
    const newFormData = {
      ...formData,
      players: updatedPlayers,
      heroPosition: heroPlayer?.position || '',
      villainPosition: villainPlayer?.position || '',
      heroStackSize: heroPlayer?.stackSize || [100],
      villainStackSize: villainPlayer?.stackSize || [100]
    };
    
    console.log('Player updated, triggering action reinitialization:', newFormData);
    setFormData(newFormData);
  };

  // Add a new player
  const addPlayer = () => {
    // Calculate the next villain number based on existing players
    // Count all non-hero players (villain + manually added players)
    const nonHeroPlayers = players.filter(p => !p.isHero);
    const nextVillainNumber = nonHeroPlayers.length + 1;
    
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: `Villain ${nextVillainNumber}`,
      position: '',
      stackSize: [100]
    };
    
    const newFormData = {
      ...formData,
      players: [...players, newPlayer]
    };
    
    console.log('New player added, triggering action reinitialization:', newFormData);
    setFormData(newFormData);
  };

  // Remove a player (except hero and villain)
  const removePlayer = (playerId: string) => {
    if (playerId === 'hero' || playerId === 'villain') return;
    
    const updatedPlayers = players.filter(p => p.id !== playerId);
    const newFormData = {
      ...formData,
      players: updatedPlayers
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
