
export const positionOrder = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];

export const positionNames: { [key: string]: string } = {
  'utg': 'UTG',
  'utg1': 'UTG+1',
  'mp': 'MP',
  'lj': 'LJ',
  'hj': 'HJ',
  'co': 'CO',
  'btn': 'BTN',
  'sb': 'SB',
  'bb': 'BB',
  // Add uppercase versions to handle any case issues
  'UTG': 'UTG',
  'UTG1': 'UTG+1',
  'MP': 'MP',
  'LJ': 'LJ',
  'HJ': 'HJ',
  'CO': 'CO',
  'BTN': 'BTN',
  'SB': 'SB',
  'BB': 'BB',
};

export const steps = [
  { id: 'game-setup', title: 'Setup', description: 'Basic game information' },
  { id: 'positions', title: 'Positions', description: 'Player positions and stacks' },
  { id: 'preflop', title: 'Preflop', description: 'Preflop action and betting' },
  { id: 'flop', title: 'Flop', description: 'Flop cards and action' },
  { id: 'turn', title: 'Turn', description: 'Turn card and action' },
  { id: 'river', title: 'River', description: 'River card and final action' },
];

export const getPositionName = (position: string): string => {
  if (!position) {
return '';
}
  
  // Convert to lowercase for lookup
  const lowerPos = position.toLowerCase();
  const mapped = positionNames[lowerPos] || positionNames[position];
  
  // If no mapping found, return the original position in uppercase
  // This prevents "utg" from becoming "Dealer" or other strange mappings
  return mapped || position.toUpperCase();
};
