// Streamlined Poker Actions Algorithm - Outputs Valid Actions Only

export class PokerActionsAlgorithm {
  constructor(smallBlind: number, bigBlind: number, players: any[]) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    
    // Initialize players with positions and names
    this.players = players.map((player, index) => ({
      id: player.id || index,
      name: player.name || `Player ${index + 1}`,
      stack: player.stackSize?.[0] || player.stack || 100,
      position: this.getPositionName(index, players.length),
      positionIndex: index,
      currentBet: 0,
      totalInvested: 0,
      isActive: true,
      isFolded: false,
      isAllIn: false,
      hasActed: false
    }));
    
    this.currentStreet = 'preFlop';
    this.pot = smallBlind + bigBlind;
    this.currentBet = bigBlind;
    this.actionHistory = [];
    this.streetActions = {
      preFlop: [],
      flop: [],
      turn: [],
      river: []
    };
    
    // Set initial blinds
    this.setInitialBlinds();
    
    // Determine action order for current street
    this.updateActionOrder();
  }

  smallBlind: number;
  bigBlind: number;
  players: any[];
  currentStreet: string;
  pot: number;
  currentBet: number;
  actionHistory: any[];
  streetActions: any;
  actionOrder: number[];
  currentActionIndex: number;

  getPositionName(index: number, totalPlayers: number): string {
    if (totalPlayers === 2) {
      return index === 0 ? 'BTN/SB' : 'BB';
    }
    
    const positions: { [key: number]: string[] } = {
      2: ['BTN/SB', 'BB'],
      3: ['BTN', 'SB', 'BB'],
      4: ['BTN', 'SB', 'BB', 'UTG'],
      5: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1'],
      6: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2'],
      7: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'HJ'],
      8: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ'],
      9: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'UTG+3', 'LJ', 'HJ']
    };
    
    const positionArray = positions[totalPlayers] || positions[9];
    return positionArray[index] || `UTG+${index - 3}`;
  }

  setInitialBlinds() {
    const sbIndex = this.players.length === 2 ? 0 : 1;
    const bbIndex = this.players.length === 2 ? 1 : 2;
    
    // Small blind
    const sbPlayer = this.players[sbIndex];
    const sbAmount = Math.min(this.smallBlind, sbPlayer.stack);
    sbPlayer.currentBet = sbAmount;
    sbPlayer.totalInvested = sbAmount;
    sbPlayer.stack -= sbAmount;
    if (sbPlayer.stack === 0) sbPlayer.isAllIn = true;
    
    // Big blind
    const bbPlayer = this.players[bbIndex];
    const bbAmount = Math.min(this.bigBlind, bbPlayer.stack);
    bbPlayer.currentBet = bbAmount;
    bbPlayer.totalInvested = bbAmount;
    bbPlayer.stack -= bbAmount;
    if (bbPlayer.stack === 0) bbPlayer.isAllIn = true;
  }

  updateActionOrder() {
    if (this.currentStreet === 'preFlop') {
      // Pre-flop: start after big blind
      const startIndex = this.players.length === 2 ? 0 : 3;
      this.actionOrder = this.getActionOrderFromPosition(startIndex);
    } else {
      // Post-flop: start with small blind
      const startIndex = this.players.length === 2 ? 0 : 1;
      this.actionOrder = this.getActionOrderFromPosition(startIndex);
    }
    this.currentActionIndex = 0;
  }

  getActionOrderFromPosition(startIndex: number): number[] {
    const order = [];
    for (let i = 0; i < this.players.length; i++) {
      const playerIndex = (startIndex + i) % this.players.length;
      const player = this.players[playerIndex];
      if (player.isActive && !player.isFolded && !player.isAllIn) {
        order.push(playerIndex);
      }
    }
    return order;
  }

  // MAIN METHOD: Get current player's valid actions
  getCurrentPlayerActions() {
    const playerIndex = this.getCurrentPlayerIndex();
    if (playerIndex === -1) {
      // No current player to act, check if street/hand is complete
      return this.getStreetCompletionState();
    }

    const player = this.players[playerIndex];
    const actions = this.calculateValidActions(player);

    return {
      street: this.currentStreet,
      position: player.position,
      playerId: player.id,
      playerName: player.name,
      playerStack: player.stack,
      currentBet: this.currentBet,
      pot: this.pot,
      actions: actions
    };
  }

  getCurrentPlayerIndex(): number {
    if (this.currentActionIndex >= this.actionOrder.length) {
      return -1; // No more players to act
    }
    return this.actionOrder[this.currentActionIndex];
  }

  calculateValidActions(player: any) {
    const actions = [];
    const callAmount = this.currentBet - player.currentBet;
    const effectiveCallAmount = Math.min(callAmount, player.stack);

    // FOLD - available if there's a bet to call
    if (callAmount > 0 && player.stack > 0) {
      actions.push({
        type: 'fold',
        amount: 0,
        description: 'Fold'
      });
    }

    // CHECK - available if no bet to call
    if (callAmount === 0) {
      actions.push({
        type: 'check',
        amount: 0,
        description: 'Check'
      });
    }

    // CALL - available if there's a bet to call
    if (callAmount > 0 && effectiveCallAmount > 0) {
      actions.push({
        type: 'call',
        amount: effectiveCallAmount,
        description: `Call ${effectiveCallAmount}`
      });
    }

    // BET/RAISE - available if player has chips after calling
    if (player.stack > effectiveCallAmount) {
      const minRaiseAmount = this.getMinRaiseAmount(callAmount);
      const maxRaiseAmount = player.stack - effectiveCallAmount;

      if (minRaiseAmount <= maxRaiseAmount) {
        const actionType = this.currentBet === 0 ? 'bet' : 'raise';
        const totalMinAmount = effectiveCallAmount + minRaiseAmount;
        const totalMaxAmount = player.stack;

        actions.push({
          type: actionType,
          minAmount: totalMinAmount,
          maxAmount: totalMaxAmount,
          description: `${actionType === 'bet' ? 'Bet' : 'Raise'} (${totalMinAmount}-${totalMaxAmount})`
        });
      }
    }

    // ALL-IN - always available if player has chips
    if (player.stack > 0) {
      actions.push({
        type: 'allIn',
        amount: player.stack,
        description: `All-in (${player.stack})`
      });
    }

    return actions;
  }

  getMinRaiseAmount(callAmount: number): number {
    // Minimum raise is the size of the last raise, or big blind if no raises
    const lastRaiseSize = this.getLastRaiseSize();
    return Math.max(this.bigBlind, lastRaiseSize);
  }

  getLastRaiseSize(): number {
    const streetActions = this.streetActions[this.currentStreet];
    for (let i = streetActions.length - 1; i >= 0; i--) {
      const action = streetActions[i];
      if (action.type === 'bet' || action.type === 'raise') {
        return action.raiseSize || this.bigBlind;
      }
    }
    return this.bigBlind;
  }

  // MAIN METHOD: Execute chosen action
  executeAction(actionType: string, amount: number = 0): boolean {
    const playerIndex = this.getCurrentPlayerIndex();
    if (playerIndex === -1) return false;

    const player = this.players[playerIndex];
    let success = false;

    switch (actionType) {
      case 'fold':
        success = this.processFold(player, playerIndex);
        break;
      case 'check':
        success = this.processCheck(player, playerIndex);
        break;
      case 'call':
        success = this.processCall(player, playerIndex);
        break;
      case 'bet':
      case 'raise':
        success = this.processRaise(player, playerIndex, amount, actionType);
        break;
      case 'allIn':
        success = this.processAllIn(player, playerIndex);
        break;
    }

    if (success) {
      player.hasActed = true;
      this.moveToNextPlayer();
    }

    return success;
  }

  processFold(player: any, playerIndex: number): boolean {
    player.isFolded = true;
    player.isActive = false;

    const action = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      type: 'fold',
      amount: 0,
      street: this.currentStreet
    };

    this.streetActions[this.currentStreet].push(action);
    this.actionHistory.push(action);
    
    return true;
  }

  processCheck(player: any, playerIndex: number): boolean {
    const action = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      type: 'check',
      amount: 0,
      street: this.currentStreet
    };

    this.streetActions[this.currentStreet].push(action);
    this.actionHistory.push(action);
    
    return true;
  }

  processCall(player: any, playerIndex: number): boolean {
    const callAmount = Math.min(this.currentBet - player.currentBet, player.stack);
    
    player.currentBet += callAmount;
    player.totalInvested += callAmount;
    player.stack -= callAmount;
    this.pot += callAmount;

    if (player.stack === 0) player.isAllIn = true;

    const action = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      type: 'call',
      amount: callAmount,
      street: this.currentStreet
    };

    this.streetActions[this.currentStreet].push(action);
    this.actionHistory.push(action);
    
    return true;
  }

  processRaise(player: any, playerIndex: number, totalAmount: number, actionType: string): boolean {
    const callAmount = Math.max(0, this.currentBet - player.currentBet);
    
    if (totalAmount > player.stack) return false;

    const newBetLevel = player.currentBet + totalAmount;
    const raiseSize = newBetLevel - this.currentBet;

    player.currentBet = newBetLevel;
    player.totalInvested += totalAmount;
    player.stack -= totalAmount;
    this.pot += totalAmount;
    this.currentBet = newBetLevel;

    if (player.stack === 0) player.isAllIn = true;

    // Reset other players' hasActed status
    this.players.forEach((p, i) => {
      if (i !== playerIndex && p.isActive && !p.isFolded && !p.isAllIn) {
        p.hasActed = false;
      }
    });

    const action = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      type: actionType,
      amount: totalAmount,
      raiseSize: raiseSize,
      newBetLevel: newBetLevel,
      street: this.currentStreet
    };

    this.streetActions[this.currentStreet].push(action);
    this.actionHistory.push(action);
    
    return true;
  }

  processAllIn(player: any, playerIndex: number): boolean {
    const allInAmount = player.stack;
    const newBetLevel = player.currentBet + allInAmount;

    player.currentBet = newBetLevel;
    player.totalInvested += allInAmount;
    player.stack = 0;
    player.isAllIn = true;
    this.pot += allInAmount;

    // Check if this is effectively a raise
    let effectiveActionType = 'allIn';
    let raiseSize = 0;
    
    if (newBetLevel > this.currentBet) {
      raiseSize = newBetLevel - this.currentBet;
      this.currentBet = newBetLevel;
      effectiveActionType = 'allInRaise';
      
      // Reset other players' hasActed status
      this.players.forEach((p, i) => {
        if (i !== playerIndex && p.isActive && !p.isFolded && !p.isAllIn) {
          p.hasActed = false;
        }
      });
    }

    const action = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      type: effectiveActionType,
      amount: allInAmount,
      raiseSize: raiseSize,
      newBetLevel: newBetLevel,
      street: this.currentStreet
    };

    this.streetActions[this.currentStreet].push(action);
    this.actionHistory.push(action);
    
    return true;
  }

  moveToNextPlayer() {
    this.currentActionIndex++;
    
    // Skip inactive players
    while (this.currentActionIndex < this.actionOrder.length) {
      const playerIndex = this.actionOrder[this.currentActionIndex];
      const player = this.players[playerIndex];
      
      if (player.isActive && !player.isFolded && !player.isAllIn) {
        break;
      }
      this.currentActionIndex++;
    }
  }

  // NEW METHOD: Get street completion state without causing recursion
  getStreetCompletionState() {
    const activePlayers = this.players.filter((p: any) => p.isActive && !p.isFolded);
    
    // Hand complete if only one player left
    if (activePlayers.length <= 1) {
      return {
        street: 'complete',
        handComplete: true,
        winner: activePlayers[0] || null,
        finalPot: this.pot
      };
    }

    const playersWhoCanAct = activePlayers.filter((p: any) => !p.isAllIn);
    
    // Street complete if no one can act OR all have acted and matched bets
    const streetComplete = playersWhoCanAct.length === 0 || 
      playersWhoCanAct.every((p: any) => p.hasActed && (p.currentBet === this.currentBet || p.stack === 0));

    if (streetComplete) {
      return this.advanceToNextStreet();
    }

    // If we get here, there's an issue with action order - rebuild it
    console.log('Rebuilding action order - no valid current player found');
    this.updateActionOrder();
    
    // Return waiting state instead of calling getCurrentPlayerActions again
    return {
      street: this.currentStreet,
      waiting: true,
      pot: this.pot,
      message: 'Waiting for next player action'
    };
  }

  // RENAMED METHOD: This was causing the recursion
  checkStreetComplete() {
    return this.getStreetCompletionState();
  }

  advanceToNextStreet() {
    const streets = ['preFlop', 'flop', 'turn', 'river'];
    const currentIndex = streets.indexOf(this.currentStreet);
    
    if (currentIndex < streets.length - 1) {
      this.currentStreet = streets[currentIndex + 1];
      
      // Reset for new street
      this.players.forEach((p: any) => {
        if (p.isActive && !p.isFolded) {
          p.currentBet = 0;
          p.hasActed = false;
        }
      });
      
      this.currentBet = 0;
      this.updateActionOrder();
      
      // Return new street state, not a recursive call
      return {
        street: this.currentStreet,
        newStreet: true,
        pot: this.pot,
        message: `Advanced to ${this.currentStreet}`
      };
    } else {
      // Hand complete
      return {
        street: 'complete',
        handComplete: true,
        finalPot: this.pot,
        activePlayers: this.players.filter((p: any) => p.isActive && !p.isFolded)
      };
    }
  }

  // Utility methods for debugging/tracking
  getHandSummary() {
    return {
      currentStreet: this.currentStreet,
      pot: this.pot,
      currentBet: this.currentBet,
      players: this.players.map((p: any) => ({
        name: p.name,
        position: p.position,
        stack: p.stack,
        totalInvested: p.totalInvested,
        status: p.isFolded ? 'folded' : p.isAllIn ? 'all-in' : 'active'
      })),
      streetActions: this.streetActions
    };
  }

  getActionHistory() {
    return this.actionHistory;
  }
}
