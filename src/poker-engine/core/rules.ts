 
// src/poker-engine/core/rules.ts
import { HandState, LegalAction } from './state';
import { Position, Street, GameType, ActionType } from '@/types/poker';

export class PokerRules {
  constructor(_gameType: GameType) {
    // Game type will be used for PLO vs NLH specific rules in the future
  }

  calculateLegalActions(state: HandState, playerId: string): LegalAction[] {
    const player = state.players.get(playerId);
    if (!player || player.status !== 'active') {
      return [];
    }

    const actions: LegalAction[] = [];
    const toCall = state.betting.currentBet - player.currentBet;
    const stack = player.stackSize;

    // Fold - always available when facing a bet
    if (toCall > 0) {
      actions.push({ type: ActionType.FOLD });
    }

    // Check - available when no bet to call
    if (toCall === 0) {
      actions.push({ type: ActionType.CHECK });
    }

    // Call - when facing a bet and have chips
    if (toCall > 0 && stack > 0) {
      if (stack <= toCall) {
        // Must go all-in
        actions.push({
          type: ActionType.ALL_IN,
          amount: stack,
          isPartialCall: true,
        });
      } else {
        actions.push({
          type: ActionType.CALL,
          amount: toCall,
        });
      }
    }

    // Bet/Raise - when have enough chips
    const activeNonAllInPlayers = this.countActiveNonAllInPlayers(state);

    if (activeNonAllInPlayers > 1 && stack > toCall) {
      const minBet = this.calculateMinBet(state);
      const maxBet = stack;

      if (state.betting.currentBet === 0 && stack >= minBet) {
        // Can bet
        actions.push({
          type: ActionType.BET,
          minAmount: minBet,
          maxAmount: maxBet,
        });
      } else if (state.betting.currentBet > 0) {
        // Can raise
        const minRaiseTotal = this.calculateMinRaise(state);
        const minRaiseAmount = minRaiseTotal - player.currentBet;
        if (stack >= minRaiseAmount) {
          actions.push({
            type: ActionType.RAISE,
            minAmount: minRaiseTotal, // This should be the total amount, not the additional chips
            maxAmount: player.currentBet + stack, // Total amount player can bet
          });
        }
      }
    }

    // All-in as aggressive action
    if (stack > 0 && activeNonAllInPlayers > 1) {
      actions.push({
        type: ActionType.ALL_IN,
        amount: stack,
        isPartialCall: false,
      });
    }

    return actions;
  }

  private calculateMinBet(state: HandState): number {
    // Minimum bet is usually the big blind
    return state.gameConfig.blinds.big;
  }

  private calculateMinRaise(state: HandState): number {
    // Minimum raise is current bet + last raise size
    // If no previous raise, use big blind as minimum raise size
    const minRaiseSize =
      state.betting.lastRaiseSize > 0 ? state.betting.lastRaiseSize : state.gameConfig.blinds.big;

    return state.betting.currentBet + minRaiseSize;
  }

  private countActiveNonAllInPlayers(state: HandState): number {
    return Array.from(state.players.values()).filter((p) => p.status === 'active').length;
  }

  isBettingRoundComplete(state: HandState): boolean {
    const activePlayers = Array.from(state.players.values()).filter(
      (p) => p.status === 'active' || p.status === 'allIn',
    );

    // Only one player left
    if (activePlayers.length <= 1) {
      return true;
    }

    // Check if all active (non-all-in) players have acted and matched bet
    const activeNonAllIn = activePlayers.filter((p) => p.status === 'active');

    if (activeNonAllIn.length === 0) {
      // All remaining players are all-in
      return true;
    }

    // All active players must have acted and matched the current bet
    return activeNonAllIn.every((p) => p.hasActed && p.currentBet === state.betting.currentBet);
  }

  determineNextPlayer(state: HandState): string | null {
    const activePlayers = state.playerOrder
      .map((id) => ({ id, player: state.players.get(id)! }))
      .filter(({ player }) => player.status === 'active');

    if (activePlayers.length === 0) {
      return null;
    }

    // If there's no current player (start of new street), return first active player
    if (!state.betting.actionOn) {
      return activePlayers[0].id;
    }

    // Find current player index
    const currentIndex = state.playerOrder.indexOf(state.betting.actionOn);

    // Find next active player
    for (let i = 1; i <= state.playerOrder.length; i++) {
      const nextIndex = (currentIndex + i) % state.playerOrder.length;
      const nextPlayerId = state.playerOrder[nextIndex];
      const nextPlayer = state.players.get(nextPlayerId);

      if (nextPlayer && nextPlayer.status === 'active') {
        return nextPlayerId;
      }
    }

    return null;
  }

  calculatePlayerOrder(
    players: Array<{ position: Position | string; id: string }>,
    street: Street,
  ): string[] {
    // Define position order for post-flop
    const postflopOrder: string[] = [
      Position.SB,
      Position.BB,
      Position.UTG,
      Position.UTG1,
      Position.MP,
      Position.LJ,
      Position.HJ,
      Position.CO,
      Position.BTN,
    ];

    // Define position order for preflop
    const preflopOrder: string[] = [
      Position.UTG,
      Position.UTG1,
      Position.MP,
      Position.LJ,
      Position.HJ,
      Position.CO,
      Position.BTN,
      Position.SB,
      Position.BB,
    ];

    const orderToUse = street === Street.PREFLOP ? preflopOrder : postflopOrder;

    // Sort players according to the position order
    const sortedPlayers = [...players].sort((a, b) => {
      const aIndex = orderToUse.indexOf(a.position as string);
      const bIndex = orderToUse.indexOf(b.position as string);

      // If position not found, put at end
      const aPos = aIndex === -1 ? 999 : aIndex;
      const bPos = bIndex === -1 ? 999 : bIndex;

      return aPos - bPos;
    });

    return sortedPlayers.map((p) => p.id);
  }
}
