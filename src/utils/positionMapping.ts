
// Standard position order for poker action flow
export const standardPositionOrder = ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN'];

// Map UI positions to standard positions
export const positionMap: { [key: string]: string } = {
  'utg': 'UTG',
  'utg1': 'UTG+1', 
  'mp': 'MP',
  'lj': 'LJ', // Lojack is its own position
  'hj': 'HJ',
  'co': 'CO',
  'btn': 'BTN',
  'sb': 'SB',
  'bb': 'BB',
};

// Reverse map for converting standard positions back to UI positions
export const reversePositionMap: { [key: string]: string } = {
  'UTG': 'utg',
  'UTG+1': 'utg1',
  'MP': 'mp',
  'LJ': 'lj',
  'HJ': 'hj',
  'CO': 'co',
  'BTN': 'btn',
  'SB': 'sb',
  'BB': 'bb',
};

// Convert UI position to standard position
export function standardizePosition(uiPosition: string): string {
  return positionMap[uiPosition] || uiPosition;
}

// Convert standard position back to UI position
export function uiPosition(standardPosition: string): string {
  return reversePositionMap[standardPosition] || standardPosition;
}

// Get action order based on standard positions
export function getActionOrder(positions: string[], isPreflop: boolean = false): string[] {
  // Convert UI positions to standard positions
  const standardPositions = positions.map(pos => standardizePosition(pos));
  
  if (isPreflop) {
    // Preflop: action starts after BB, wraps around
    const preflopOrder = ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    return preflopOrder.filter(pos => standardPositions.includes(pos));
  } else {
    // Post-flop: action starts with SB
    const postflopOrder = ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN'];
    return postflopOrder.filter(pos => standardPositions.includes(pos));
  }
}
