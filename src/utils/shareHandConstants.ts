
export const positionOrder = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];

export const positionNames: { [key: string]: string } = {
  'utg': 'UTG',
  'utg1': 'UTG+1',
  'mp': 'Middle Position',
  'lj': 'Lojack',
  'hj': 'Hijack',
  'co': 'Cut Off',
  'btn': 'Button',
  'sb': 'Small Blind',
  'bb': 'Big Blind',
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
  return positionNames[position] || position;
};
