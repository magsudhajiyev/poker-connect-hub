
// Pure Poker Game Engine (Editor Mode for Hand Sharing)
// Assumes hand is already played — no shuffling, no dealing, no button movement

import { Position, PREFLOP_ACTION_ORDER, POSTFLOP_ACTION_ORDER } from '@/constants';

interface PokerPlayer {
  id: string | number;
  name: string;
  stack: number;
  hand: string[];
  bet: number;
  folded: boolean;
  allIn: boolean;
  position: Position;
}

interface PokerAction {
  id: string | number;
  action: string;
  amount: number;
  street: string;
}

export class PokerGameEngine {
  players: PokerPlayer[];
  smallBlind: number;
  bigBlind: number;
  pot: number;
  communityCards: string[];
  street: string;
  actions: PokerAction[];
  currentBet: number;
  currentPlayerIndex: number | null;

  constructor(players: PokerPlayer[], smallBlind: number, bigBlind: number) {
    // Validate input parameters
    if (!players || players.length < 2) {
      throw new Error('At least 2 players are required to start a poker game');
    }
    
    if (players.length > 10) {
      throw new Error('Maximum of 10 players allowed in a poker game');
    }
    
    if (!smallBlind || smallBlind <= 0) {
      throw new Error('Small blind must be a positive number');
    }
    
    if (!bigBlind || bigBlind <= 0) {
      throw new Error('Big blind must be a positive number');
    }
    
    if (bigBlind <= smallBlind) {
      throw new Error('Big blind must be greater than small blind');
    }

    // Validate each player
    players.forEach((player, index) => {
      if (!player.id && player.id !== 0) {
        throw new Error(`Player at index ${index} is missing an ID`);
      }
      if (!player.name) {
        throw new Error(`Player ${player.id} is missing a name`);
      }
      if (!player.position) {
        throw new Error(`Player ${player.id} is missing a position`);
      }
    });

    this.players = players.map((p, i) => ({
      id: p.id || i,
      name: p.name || `Player ${i + 1}`,
      stack: p.stack || (p.stackSize && p.stackSize[0]) || 100,
      hand: p.hand || [],
      bet: 0,
      folded: false,
      allIn: false,
      position: p.position,
    }));

    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.pot = 0;
    this.communityCards = [];
    this.street = 'preflop';
    this.actions = [];
    this.currentBet = 0;
    this.currentPlayerIndex = null;
  }

  // Manual community card setting (for UI-driven input)
  setCommunityCards(cards: string[]) {
    this.communityCards = [...cards];
  }

  // Manual blind posting from UI (no assumptions)
  postBlinds(sbIndex: number, bbIndex: number) {
    const sb = this.players[sbIndex];
    const bb = this.players[bbIndex];

    sb.bet = Math.min(this.smallBlind, sb.stack);
    sb.stack -= sb.bet;
    if (sb.stack === 0) {
sb.allIn = true;
}

    bb.bet = Math.min(this.bigBlind, bb.stack);
    bb.stack -= bb.bet;
    if (bb.stack === 0) {
bb.allIn = true;
}

    this.pot += sb.bet + bb.bet;
    this.currentBet = bb.bet; // Set current bet to BB amount
    
    // Blinds posted successfully
  }

  startBettingRound(startIndex?: number) {
    const active = this.players.filter(p => !p.folded && !p.allIn);
    if (active.length <= 1) {
      this.street = 'complete';
      return;
    }
    
    // Define proper position ordering for action flow
    const actionOrder = this.street === 'preflop' ? PREFLOP_ACTION_ORDER : POSTFLOP_ACTION_ORDER;
    
    // Find first active player in correct order
    for (const position of actionOrder) {
      const playerIndex = this.players.findIndex(p => p.position === position && !p.folded && !p.allIn);
      if (playerIndex !== -1) {
        this.currentPlayerIndex = playerIndex;
        const player = this.players[playerIndex];
        // Set first player to act based on position order
        return;
      }
    }
    
    // Fallback to provided startIndex or first active player
    if (startIndex !== undefined) {
      this.currentPlayerIndex = startIndex;
    } else {
      const firstActive = active[0];
      this.currentPlayerIndex = this.players.indexOf(firstActive);
    }
  }

  getCurrentPlayer() {
    if (this.currentPlayerIndex === null) {
return null;
}
    return this.players[this.currentPlayerIndex];
  }

  getLegalActions(): string[] {
    const player = this.getCurrentPlayer();
    if (!player || player.folded || player.allIn) {
return [];
}

    const toCall = Math.max(0, this.currentBet - player.bet);
    const actions: string[] = [];

    // Player can always fold (unless already folded or all-in)
    if (player.stack > 0) {
      actions.push('fold');
    }

    // Check or call options
    if (toCall === 0) {
      actions.push('check');
    } else if (player.stack >= toCall) {
      actions.push('call');
    }

    // Betting/raising options
    const minBet = this.currentBet === 0 ? this.bigBlind : this.currentBet * 2; // Min raise = current bet
    const availableForBet = player.stack - toCall;
    
    if (this.currentBet === 0 && availableForBet >= this.bigBlind) {
      actions.push('bet');
    } else if (this.currentBet > 0 && availableForBet >= this.currentBet) {
      actions.push('raise');
    }

    // All-in option (always available if player has chips)
    if (player.stack > 0) {
      actions.push('all-in');
    }

    // Calculated legal actions for current player
    return [...new Set(actions)];
  }

  takeAction(action: string, amount: number = 0): boolean {
    try {
      // Validate basic preconditions
      if (!action || typeof action !== 'string') {
        throw new Error('Action must be a valid string');
      }

      if (amount < 0) {
        throw new Error('Amount cannot be negative');
      }

      const player = this.getCurrentPlayer();
      if (!player) {
        throw new Error('No current player to act');
      }

      if (player.folded) {
        throw new Error('Player has already folded and cannot act');
      }

      if (player.allIn) {
        throw new Error('Player is all-in and cannot act');
      }

      const toCall = Math.max(0, this.currentBet - player.bet);
      const move: PokerAction = { id: player.id, action, amount, street: this.street };

      // Validate and execute action
      switch (action) {
        case 'fold':
          player.folded = true;
          break;
          
        case 'check':
          if (toCall > 0) {
            throw new Error(`Cannot check when there's a bet of ${toCall} to call`);
          }
          break;
          
        case 'call':
          if (toCall === 0) {
            throw new Error('Cannot call when there\'s no bet to call');
          }
          const callAmt = Math.min(toCall, player.stack);
          if (callAmt <= 0) {
            throw new Error('Cannot call with zero amount');
          }
          player.stack -= callAmt;
          player.bet += callAmt;
          this.pot += callAmt;
          if (player.stack === 0) {
            player.allIn = true;
          }
          move.amount = callAmt;
          break;
        
        case 'bet': {
          if (this.currentBet > 0) {
            throw new Error('Cannot bet when there\'s already a bet on the table');
          }
          if (amount <= 0) {
            throw new Error('Bet amount must be positive');
          }
          if (amount < this.bigBlind) {
            throw new Error(`Bet must be at least the big blind (${this.bigBlind})`);
          }
          if (amount > player.stack) {
            throw new Error(`Bet amount (${amount}) exceeds player stack (${player.stack})`);
          }
          player.stack -= amount;
          player.bet += amount;
          this.currentBet = amount;
          this.pot += amount;
          if (player.stack === 0) {
            player.allIn = true;
          }
          move.amount = amount;
          break;
        }
          
        case 'raise': {
          if (this.currentBet === 0) {
            throw new Error('Cannot raise when there\'s no bet to raise');
          }
          if (amount <= 0) {
            throw new Error('Raise amount must be positive');
          }
          const totalRequired = toCall + amount;
          if (amount < this.currentBet) {
            throw new Error(`Raise amount (${amount}) must be at least the current bet (${this.currentBet})`);
          }
          if (totalRequired > player.stack) {
            throw new Error(`Total raise amount (${totalRequired}) exceeds player stack (${player.stack})`);
          }
          player.stack -= totalRequired;
          player.bet += totalRequired;
          this.currentBet = player.bet;
          this.pot += totalRequired;
          if (player.stack === 0) {
            player.allIn = true;
          }
          move.amount = totalRequired;
          break;
        }
        
        case 'all-in': {
          const allInAmt = player.stack;
          if (allInAmt === 0) {
            throw new Error('Player has no chips left to go all-in');
          }
          player.stack = 0;
          player.bet += allInAmt;
          this.pot += allInAmt;
          if (player.bet > this.currentBet) {
            this.currentBet = player.bet;
          }
          player.allIn = true;
          move.amount = allInAmt;
          break;
        }
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.actions.push(move);
      // Advance to next player
      this.advanceToNextPlayer();
      return true;
      
    } catch (error) {
      console.error('Error in takeAction:', error);
      // In a real application, you might want to handle this differently
      // For now, we'll return false to indicate the action failed
      return false;
    }
  }

  advanceToNextPlayer() {
    const activeCount = this.players.filter(p => !p.folded && !p.allIn).length;
    if (activeCount <= 1) {
      this.currentPlayerIndex = null;
      // Betting round complete - only one active player remaining
      return;
    }

    // Use proper position ordering for next player
    const actionOrder = this.street === 'preflop' ? PREFLOP_ACTION_ORDER : POSTFLOP_ACTION_ORDER;
    
    if (this.currentPlayerIndex === null) {
          // Action validation error
      return;
    }
    const currentPlayer = this.players[this.currentPlayerIndex];
    const currentPositionIndex = actionOrder.indexOf(currentPlayer.position);
    
    // Find next active player in action order
    for (let i = 1; i < actionOrder.length; i++) {
      const nextPositionIndex = (currentPositionIndex + i) % actionOrder.length;
      const nextPosition = actionOrder[nextPositionIndex];
      const nextPlayerIndex = this.players.findIndex(p => p.position === nextPosition && !p.folded && !p.allIn);
      
      if (nextPlayerIndex !== -1) {
        this.currentPlayerIndex = nextPlayerIndex;
        const nextPlayer = this.players[nextPlayerIndex];
        // Found next player to act
        return;
      }
    }
    
    this.currentPlayerIndex = null;
    // No more players to act
  }

  getState() {
    return {
      players: this.players,
      pot: this.pot,
      street: this.street,
      communityCards: this.communityCards,
      actions: this.actions,
      currentPlayer: this.getCurrentPlayer(),
      currentBet: this.currentBet,
    };
  }
}

export default PokerGameEngine;
