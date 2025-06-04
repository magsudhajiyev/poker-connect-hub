
export const positionOrder = ['utg', 'utg1', 'utg2', 'mp', 'mp1', 'mp2', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];

export const positionNames: { [key: string]: string } = {
  'utg': 'UTG',
  'utg1': 'UTG+1',
  'utg2': 'UTG+2',
  'mp': 'Middle Position',
  'mp1': 'MP+1',
  'mp2': 'MP+2',
  'lj': 'Lojack',
  'hj': 'Hijack',
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
