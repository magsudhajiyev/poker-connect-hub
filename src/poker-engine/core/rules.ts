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

    // Fold - always available (player can voluntarily fold at any time)
    actions.push({ type: ActionType.FOLD });

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
        // Can raise if:
        // 1. Player hasn't acted yet in this round, OR
        // 2. Player has acted but someone made a complete raise after them
        // A player who has acted cannot raise if only facing an incomplete all-in
        const minRaiseTotal = this.calculateMinRaise(state);
        const minRaiseAmount = minRaiseTotal - player.currentBet;

        // Check if player is facing an incomplete raise
        // POKER RULE: Incomplete Raise (All-in for less than minimum)
        // When a player goes all-in but cannot make a full minimum raise:
        // 1. It does NOT reopen the betting for players who have already acted
        // 2. Players who haven't acted yet can still raise normally
        // 3. Players who have acted can only call or fold (not raise)
        // Example: Blinds $1/$2, Player A bets $10, Player B raises to $30 (raise of $20),
        // Player C goes all-in for $35 (only $5 more, less than min raise of $20).
        // Player A can only call $35 or fold, cannot re-raise.

        // A player can raise unless:
        // 1. They have already acted in this betting round AND
        // 2. The action was NOT reopened by a complete raise
        // The hasActed flag is reset when someone makes a complete raise,
        // so if hasActed is true here, it means they're facing an incomplete raise

        if (stack >= minRaiseAmount && !player.hasActed) {
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
    // POKER RULE: Minimum Bet
    // The minimum bet is typically one big blind
    // In some games this could be different (e.g., pot-limit games)
    return state.gameConfig.blinds.big;
  }

  private calculateMinRaise(state: HandState): number {
    // POKER RULE: Minimum Raise Amount
    // The minimum raise must be at least the size of the last bet or raise
    // Example: If current bet is $10 and last raise was from $4 to $10 (raise of $6),
    // then minimum raise would be to $16 ($10 + $6)
    // If no previous raise in this round, minimum raise is one big blind
    if (state.betting.minRaise > 0) {
      return state.betting.minRaise;
    }

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

    // POKER RULE: Heads-up Preflop Special Case
    // In heads-up play, the button posts the small blind and acts first preflop
    // The big blind acts last preflop (gets last action)
    // Betting round is complete when both players have acted and matched bets
    if (activePlayers.length === 2 && state.street === Street.PREFLOP) {
      // In heads-up preflop, round is complete when:
      // 1. Both players have acted
      // 2. Both have the same bet amount
      // 3. The last action was a call or check
      const [p1, p2] = activePlayers;
      const bothActed = p1.hasActed && p2.hasActed;
      const sameBets = p1.currentBet === p2.currentBet;

      if (bothActed && sameBets && p1.currentBet > 0) {
        const lastAction = state.actionHistory[state.actionHistory.length - 1];
        if (
          lastAction &&
          (lastAction.action === ActionType.CALL ||
            (lastAction.action === ActionType.CHECK &&
              state.betting.currentBet === state.gameConfig.blinds.big))
        ) {
          return true;
        }
      }
    }

    // All active players must have acted and matched the current bet
    const allActedAndMatched = activeNonAllIn.every(
      (p) => p.hasActed && p.currentBet === state.betting.currentBet,
    );

    return allActedAndMatched;
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
    // POKER RULE: Heads-up Position Rules (Traditional)
    // In traditional heads-up (BTN vs BB):
    // - The button posts the small blind
    // - The other player posts the big blind
    // - Preflop: Button acts first, BB acts last
    // - Postflop: BB acts first, Button acts last

    // Special case ONLY for traditional heads-up (BTN vs BB)
    if (players.length === 2) {
      const hasBtn = players.some((p) => p.position === Position.BTN || p.position === 'BTN');
      const hasBB = players.some((p) => p.position === Position.BB || p.position === 'BB');

      // ONLY apply special heads-up rules if it's actually BTN vs BB
      if (hasBtn && hasBB) {
        if (street === Street.PREFLOP) {
          const btnPlayer = players.find(
            (p) => p.position === Position.BTN || p.position === 'BTN',
          )!;
          const bbPlayer = players.find((p) => p.position === Position.BB || p.position === 'BB')!;
          return [btnPlayer.id, bbPlayer.id];
        } else {
          // Post-flop: BB acts first
          const bbPlayer = players.find((p) => p.position === Position.BB || p.position === 'BB')!;
          const btnPlayer = players.find(
            (p) => p.position === Position.BTN || p.position === 'BTN',
          )!;
          return [bbPlayer.id, btnPlayer.id];
        }
      }
      // For all other 2-player combinations, fall through to standard position order
    }

    // POKER RULE: Standard Position Order
    // For all non-heads-up games and partial hands:
    // Preflop: Action starts left of BB (UTG) and continues clockwise
    // Postflop: Action starts with first active player left of button
    // Position advantage: Button acts last on all postflop streets

    // Define position order for post-flop
    const postflopOrder: string[] = [
      Position.SB, // Small blind acts first postflop
      Position.BB, // Big blind acts second
      Position.UTG, // Then continues clockwise
      Position.UTG1,
      Position.MP,
      Position.LJ,
      Position.HJ,
      Position.CO,
      Position.BTN, // Button acts last (best position)
    ];

    // Define position order for preflop
    const preflopOrder: string[] = [
      Position.UTG, // "Under the gun" - first to act preflop
      Position.UTG1, // Also called UTG+1 or EP (early position)
      Position.MP, // Middle position
      Position.LJ, // Lojack
      Position.HJ, // Hijack
      Position.CO, // Cutoff
      Position.BTN, // Button/Dealer
      Position.SB, // Small blind
      Position.BB, // Big blind acts last preflop
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
