// src/poker-engine/hooks/useHandBuilder.ts
import { useState, useCallback, useMemo } from 'react';
import { HandBuilderService } from '../services/builder';
import { IPokerHand } from '@/types/poker-engine';
import { Player } from '@/types/shareHand';
import { Position, ActionType, Street, GameType, GameFormat } from '@/types/poker';
import { GameConfig } from '../core/state';
import { useAuth } from '@/contexts/AuthContext';

export function useHandBuilder(existingHand?: IPokerHand) {
  // Initialize builder
  const [builder] = useState(() => {
    if (existingHand) {
      const service = new HandBuilderService(existingHand.gameConfig as GameConfig);
      // Replay existing events
      existingHand.events.forEach((event) => {
        service['engine'].applyEvent(event);
      });
      return service;
    } else {
      return new HandBuilderService({
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 1, big: 2 },
      });
    }
  });

  const { user } = useAuth();
  const [state, setState] = useState(() => builder.getCurrentState());

  // Initialize hand
  const initializeHand = useCallback(
    (players: Player[]) => {
      const result = builder.initializeHand(
        players.map((p) => ({
          id: p.id,
          name: p.name,
          position: p.position as Position,
          stackSize: p.stackSize[0],
          isHero: p.isHero || false,
        })),
      );

      if (result.isValid) {
        setState(builder.getCurrentState());

        // Post blinds automatically
        const blindsResult = builder.postBlinds();
        if (blindsResult.isValid) {
          setState(builder.getCurrentState());
        }
      }

      return result;
    },
    [builder],
  );

  // Process action
  const processAction = useCallback(
    (playerId: string, action: ActionType, amount?: number) => {
      const result = builder.processAction(playerId, action, amount);
      if (result.isValid) {
        setState(builder.getCurrentState());
      }

      return result;
    },
    [builder],
  );

  // Deal cards
  const dealCards = useCallback(
    (playerId: string | null, cards: string[], street: Street) => {
      const result = builder.dealCards(playerId, cards, street);
      if (result.isValid) {
        setState(builder.getCurrentState());
      }

      return result;
    },
    [builder],
  );

  // Save hand via API
  const saveHand = useCallback(
    async (title: string, description: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const events = builder.getEvents();
      const gameConfig = builder.getCurrentState().gameConfig;

      // Save via API endpoint
      const response = await fetch('/api/hands/save-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          gameConfig,
          events,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save hand');
      }

      const result = await response.json();
      return result.hand;
    },
    [user, builder],
  );

  // Get current player and legal actions
  const currentPlayer = useMemo(() => {
    if (!state) {
      return null;
    }
    return state.currentState.betting.actionOn
      ? state.currentState.players.get(state.currentState.betting.actionOn)
      : null;
  }, [state]);

  const legalActions = useMemo(() => {
    if (!currentPlayer) {
      return [];
    }
    return builder.getLegalActions();
  }, [builder, currentPlayer]);

  // Update game config
  const updateGameConfig = useCallback(
    (config: Partial<GameConfig>) => {
      const currentConfig = state.gameConfig;
      const newConfig = { ...currentConfig, ...config };

      // TODO: Create new builder with updated config
      // This would require reinitializing the hand
      // For now, we'll just update the local state
      setState((prev) => ({ ...prev, gameConfig: newConfig }));
    },
    [state],
  );

  return {
    // State
    state,
    currentPlayer,
    legalActions,

    // Methods
    initializeHand,
    processAction,
    dealCards,
    saveHand,
    updateGameConfig,

    // Info
    isComplete: state.isComplete,
    currentStreet: state.currentState.street,
    pot: state.currentState.betting.pot,
    players: Array.from(state.currentState.players.values()),
  };
}
