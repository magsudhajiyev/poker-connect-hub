
// Pure Poker Game Engine (Editor Mode for Hand Sharing)
// Assumes hand is already played — no shuffling, no dealing, no button movement

interface PokerPlayer {
  id: string | number;
  name: string;
  stack: number;
  hand: string[];
  bet: number;
  folded: boolean;
  allIn: boolean;
  position: string;
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
    this.players = players.map((p, i) => ({
      id: p.id || i,
      name: p.name || `Player ${i + 1}`,
      stack: p.stack || p.stackSize?.[0] || 100,
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
    if (sb.stack === 0) sb.allIn = true;

    bb.bet = Math.min(this.bigBlind, bb.stack);
    bb.stack -= bb.bet;
    if (bb.stack === 0) bb.allIn = true;

    this.pot += sb.bet + bb.bet;
    this.currentBet = bb.bet; // Set current bet to BB amount
    
    console.log('Blinds posted:', {
      sb: { bet: sb.bet, stack: sb.stack },
      bb: { bet: bb.bet, stack: bb.stack },
      pot: this.pot,
      currentBet: this.currentBet
    });
  }

  startBettingRound(startIndex?: number) {
    const active = this.players.filter(p => !p.folded && !p.allIn);
    if (active.length <= 1) {
      this.street = 'complete';
      return;
    }
    
    // Define proper position ordering for action flow
    const preflopOrder = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];
    const postflopOrder = ['sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn'];
    
    const actionOrder = this.street === 'preflop' ? preflopOrder : postflopOrder;
    
    // Find first active player in correct order
    for (const position of actionOrder) {
      const playerIndex = this.players.findIndex(p => p.position === position && !p.folded && !p.allIn);
      if (playerIndex !== -1) {
        this.currentPlayerIndex = playerIndex;
        const player = this.players[playerIndex];
        console.log(`First to act ${this.street}: ${player.name} (${player.position}) at index ${playerIndex}`);
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
    if (this.currentPlayerIndex === null) return null;
    return this.players[this.currentPlayerIndex];
  }

  getLegalActions(): string[] {
    const player = this.getCurrentPlayer();
    if (!player || player.folded || player.allIn) return [];

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

    console.log(`Legal actions for ${player.name}: ${actions.join(', ')} (toCall: ${toCall}, stack: ${player.stack}, currentBet: ${this.currentBet})`);
    return [...new Set(actions)];
  }

  takeAction(action: string, amount: number = 0): boolean {
    const player = this.getCurrentPlayer();
    if (!player || player.folded || player.allIn) return false;

    const toCall = Math.max(0, this.currentBet - player.bet);
    const move: PokerAction = { id: player.id, action, amount, street: this.street };

    console.log(`${player.name} attempting ${action} (amount: ${amount}, toCall: ${toCall})`);

    switch (action) {
      case 'fold':
        player.folded = true;
        break;
        
      case 'check':
        if (toCall > 0) {
          console.log(`Cannot check when there's a bet to call: ${toCall}`);
          return false;
        }
        break;
        
      case 'call':
        if (toCall === 0) {
          console.log('Cannot call when there\'s no bet');
          return false;
        }
        const callAmt = Math.min(toCall, player.stack);
        player.stack -= callAmt;
        player.bet += callAmt;
        this.pot += callAmt;
        if (player.stack === 0) player.allIn = true;
        move.amount = callAmt;
        break;
        
      case 'bet': {
        if (this.currentBet > 0) {
          console.log('Cannot bet when there\'s already a bet');
          return false;
        }
        if (amount < this.bigBlind || amount > player.stack) {
          console.log(`Invalid bet amount: ${amount} (min: ${this.bigBlind}, max: ${player.stack})`);
          return false;
        }
        player.stack -= amount;
        player.bet += amount;
        this.currentBet = amount;
        this.pot += amount;
        if (player.stack === 0) player.allIn = true;
        move.amount = amount;
        break;
      }
        
      case 'raise': {
        if (this.currentBet === 0) {
          console.log('Cannot raise when there\'s no bet to raise');
          return false;
        }
        const totalRequired = toCall + amount;
        if (amount < this.currentBet || totalRequired > player.stack) {
          console.log(`Invalid raise amount: ${amount} (min raise: ${this.currentBet}, total required: ${totalRequired}, available: ${player.stack})`);
          return false;
        }
        player.stack -= totalRequired;
        player.bet += totalRequired;
        this.currentBet = player.bet;
        this.pot += totalRequired;
        if (player.stack === 0) player.allIn = true;
        move.amount = totalRequired;
        break;
      }
        
      case 'all-in': {
        const allInAmt = player.stack;
        if (allInAmt === 0) return false;
        player.stack = 0;
        player.bet += allInAmt;
        this.pot += allInAmt;
        if (player.bet > this.currentBet) this.currentBet = player.bet;
        player.allIn = true;
        move.amount = allInAmt;
        break;
      }
        
      default:
        console.log(`Invalid action: ${action}`);
        return false;
    }

    this.actions.push(move);
    console.log('Action completed, advancing to next player...');
    this.advanceToNextPlayer();
    console.log('After advancing:', {
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.getCurrentPlayer()?.name,
      currentPlayerPosition: this.getCurrentPlayer()?.position
    });
    return true;
  }

  advanceToNextPlayer() {
    const activeCount = this.players.filter(p => !p.folded && !p.allIn).length;
    if (activeCount <= 1) {
      this.currentPlayerIndex = null;
      console.log('Betting round complete - only one active player remaining');
      return;
    }

    // Use proper position ordering for next player
    const actionOrder = this.street === 'preflop' 
      ? ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb']
      : ['sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn'];
    
    const currentPlayer = this.players[this.currentPlayerIndex!];
    const currentPositionIndex = actionOrder.indexOf(currentPlayer.position);
    
    // Find next active player in action order
    for (let i = 1; i < actionOrder.length; i++) {
      const nextPositionIndex = (currentPositionIndex + i) % actionOrder.length;
      const nextPosition = actionOrder[nextPositionIndex];
      const nextPlayerIndex = this.players.findIndex(p => p.position === nextPosition && !p.folded && !p.allIn);
      
      if (nextPlayerIndex !== -1) {
        this.currentPlayerIndex = nextPlayerIndex;
        const nextPlayer = this.players[nextPlayerIndex];
        console.log(`Next to act: ${nextPlayer.name} (${nextPlayer.position})`);
        return;
      }
    }
    
    this.currentPlayerIndex = null;
    console.log('No more players to act');
  }

  getState() {
    return {
      players: this.players,
      pot: this.pot,
      street: this.street,
      communityCards: this.communityCards,
      actions: this.actions,
      currentPlayer: this.getCurrentPlayer(),
      currentBet: this.currentBet
    };
  }
}

export default PokerGameEngine;
