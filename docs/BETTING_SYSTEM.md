# Betting Logic & Display System

## Overview

This document explains the unified betting logic and display system implemented for Poker Connect Hub. The system ensures consistent calculations while providing proper unit display for both cash games and tournaments.

## Core Architecture

### 1. Unified Value System

**Internal Storage**: All values are stored internally as **chip amounts** (the base unit)

- Stack sizes: stored as chip amounts
- Bet amounts: converted to chip amounts for calculations
- Pot calculations: performed in chip amounts

**Display Layer**: Values are converted to appropriate display units

- **Cash games**: Displayed as `$XX.XX` (chips)
- **Tournaments**: Displayed as `XX.XBB` (big blind units)

### 2. Key Components

#### `useDisplayValues` Hook

Central hook for all unit conversions and display formatting:

```typescript
const displayValues = useDisplayValues({ formData });

// Core conversions
displayValues.convertToChips(amount, fromUnit);
displayValues.convertFromChips(chipAmount, toUnit);

// Display formatting
displayValues.formatChipAmount(chipAmount);
displayValues.formatStackSize(stackSize);

// Input parsing and validation
displayValues.parseInputToChips(input);
displayValues.validateBetAmount(chipAmount, playerStack);
```

#### Enhanced Pot Calculations

- `calculatePotSize()`: Returns pot size in chips with proper unit handling
- `updatePotWithAction()`: Updates pot considering action types and unit conversions
- Handles complex scenarios: raises, calls, all-ins, side pots

#### Display Components

- **PlayerSeat**: Shows stack with proper units and short-stack warnings
- **BetSizingButtons**: Calculates pot-based bets with unit awareness
- **BetInputSection**: Handles input validation and unit conversion
- **PotDisplay**: Shows pot in primary unit with secondary unit info

## Game Format Handling

### Cash Games (`gameFormat: 'cash'`)

- **Display Mode**: `chips` (shows $XX.XX)
- **Internal**: Values stored as chip amounts
- **Calculations**: Direct chip arithmetic
- **Example**: $100 stack, $25 bet → stored as 100, 25

### Tournaments (`gameFormat: 'mtt'` or `sng'`)

- **Display Mode**: `bb` (shows XX.XBB)
- **Internal**: Values converted to chips for storage
- **Calculations**: Chip arithmetic with BB conversion
- **Example**: 50BB stack with 2BB blinds → stored as 100 chips, displayed as 50.0BB

## Betting Logic

### 1. Pot Calculations

```typescript
// Always returns chip amounts
const potInChips = calculatePotSize(formData, { returnInChips: true });

// Handles different bet types correctly
switch (action.action) {
  case 'bet':
    potSizeInChips += betAmountInChips;
    break;
  case 'call':
    potSizeInChips += callAmountInChips;
    break;
  case 'raise':
    potSizeInChips += newBet - previousBet;
    break;
}
```

### 2. Bet Sizing

```typescript
// Pot-based betting (always in chips internally)
const betSizes = [
  { label: '1/3 Pot', amount: potInChips * 0.33 },
  { label: '1/2 Pot', amount: potInChips * 0.5 },
  { label: 'All-in', amount: playerStackInChips },
];
```

### 3. Input Validation

```typescript
// Convert user input to chips for validation
const chipAmount = displayValues.parseInputToChips(userInput);
const validation = displayValues.validateBetAmount(chipAmount, playerStack);

// Validation includes:
// - Minimum bet checks (1BB minimum)
// - Stack size limits
// - Auto-adjustment for all-ins
```

## Display Examples

### Cash Game Display

```
Player Stack: $156.25
Pot: $47.50 (23.8BB)
Bet Input: "Bet Size ($)" with buttons showing $15.8 (1/3 Pot)
```

### Tournament Display

```
Player Stack: 78.1BB
Pot: 23.8BB ($47.50)
Bet Input: "Bet Size (BB)" with buttons showing 7.9BB (1/3 Pot)
```

## Future Toggle Feature

### Architecture Ready

The system is prepared for a future display mode toggle:

```typescript
// Context for global display mode control
const { displayMode, toggleDisplayMode } = useDisplayMode();

// Modes: 'chips' | 'bb' | null (auto-detect)
// - 'chips': Always show $ amounts
// - 'bb': Always show BB amounts
// - null: Auto-detect based on game format
```

### Toggle Component

Ready-to-use toggle component:

```tsx
<DisplayModeToggle variant="button" showLabels={true} />
```

## Data Flow

```
User Input → parseInputToChips() → Internal Storage (chips) → formatChipAmount() → Display
     ↑                                      ↓
Validation ← validateBetAmount() ← Calculations (chips) ← convertToChips()
```

## Benefits

1. **Mathematically Correct**: All calculations in consistent units
2. **User Friendly**: Displays in expected format for game type
3. **Future Ready**: Easy toggle between display modes
4. **Maintainable**: Centralized conversion logic
5. **Robust**: Proper validation and error handling

## Migration Notes

### Breaking Changes

- `BetSizingButtons` now expects `potSizeInChips` and `stackSizeInChips`
- `PotDisplay` can now auto-calculate pot if `formData` provided
- `PlayerSeat` shows formatted stack sizes with unit indicators

### Backward Compatibility

- Legacy components still work with fallback logic
- Gradual migration path for existing code
- Optional props maintain existing behavior

## Testing Scenarios

1. **Cash Game**: $100 stack, $2/$4 blinds → proper $ display
2. **Tournament**: 50BB stack, 1/2 blinds → proper BB display
3. **Mixed Calculations**: Pot bets work correctly in both formats
4. **Edge Cases**: All-in scenarios, fractional blinds, minimum bets
5. **Validation**: Invalid inputs handled gracefully

This system provides a solid foundation for accurate poker math while maintaining excellent user experience.
