
export const positionOrder = ['utg', 'mp', 'co', 'btn', 'sb', 'bb'];

export const positionNames: { [key: string]: string } = {
  'utg': 'UTG',
  'mp': 'Middle Position',
  'co': 'Cut Off',
  'btn': 'Button',
  'sb': 'Small Blind',
  'bb': 'Big Blind'
};

export const steps = [
  { id: 'game-setup', title: 'Game Setup', description: 'Basic game information' },
  { id: 'preflop', title: 'Preflop', description: 'Preflop action and betting' },
  { id: 'flop', title: 'Flop', description: 'Flop cards and action' },
  { id: 'turn', title: 'Turn', description: 'Turn card and action' },
  { id: 'river', title: 'River', description: 'River card and final action' }
];

export const getPositionName = (position: string): string => {
  return positionNames[position] || position;
};
