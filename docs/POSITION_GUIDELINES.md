# Poker Position Guidelines

## Overview

This document outlines the valid position configurations for poker hands in Poker Connect Hub. The system supports both full table configurations and partial hand scenarios (where some players have folded) to accurately recreate real poker situations.

## Position Abbreviations

- **UTG** - Under the Gun (first to act preflop in full ring)
- **UTG1** - Under the Gun + 1
- **MP** - Middle Position
- **LJ** - Lojack
- **HJ** - Hijack
- **CO** - Cutoff
- **BTN** - Button/Dealer
- **SB** - Small Blind
- **BB** - Big Blind

## Valid Position Configurations

### True Heads-Up (2 Players Starting the Hand)

**Required positions:** BTN and BB

- The Button (BTN) posts the small blind and acts first preflop
- The Big Blind (BB) acts last preflop and first on all post-flop streets
- This is the standard heads-up configuration used in all major poker rooms

### Partial Hand Scenarios (2 Players Remaining)

**Any two valid positions are allowed**, for example:

- **UTG vs SB**: UTG opened, everyone else folded except SB
- **CO vs BB**: CO raised, everyone folded except BB
- **MP vs HJ**: MP opened, HJ called/raised, everyone else folded

These scenarios represent hands where other players have already folded, leaving only two players to continue the action.

### 3+ Player Games

For games with 3 or more players, we support two types of configurations:

#### Full Table Configuration
**Requirements:**
1. Must have a Button (BTN) position
2. Must have at least one blind position (SB or BB, preferably both)
3. All positions must be unique

#### Partial Hand Configuration
**Any combination of valid positions**, representing mid-hand scenarios where some players have folded:

- **UTG vs SB vs BB**: UTG opened, everyone else folded except the blinds
- **MP vs CO vs SB**: MP raised, CO called, button folded, SB still to act
- **HJ vs CO vs BTN vs SB**: Multi-way pot after early positions folded

**Recommended full table configurations by player count:**

- **4 players:** CO, BTN, SB, BB
- **5 players:** HJ, CO, BTN, SB, BB
- **6 players:** MP, HJ, CO, BTN, SB, BB
- **7 players:** UTG, MP, HJ, CO, BTN, SB, BB
- **8 players:** UTG, UTG1, MP, HJ, CO, BTN, SB, BB
- **9 players:** UTG, UTG1, MP, LJ, HJ, CO, BTN, SB, BB

## Why Position Validation?

1. **Game Integrity**: Proper positions ensure correct action order and betting rounds
2. **Blind Posting**: The poker engine requires specific positions to post blinds correctly
3. **Action Order**: Different positions act in different orders preflop vs postflop
4. **Hand Analysis**: Accurate positions are crucial for proper hand analysis and strategy discussion

## Understanding Partial Hand Scenarios

Partial hand scenarios are common in poker when you want to analyze a specific situation that occurred after several players have already folded. For example:

1. **UTG opens, only SB continues**: This creates a "UTG vs SB" scenario
2. **The action order follows standard poker rules**: UTG acts first preflop, SB acts first postflop
3. **Blinds are handled appropriately**: Dead blinds may apply if BB folded

## Common Validation Rules

### Error: "Games with a Button (BTN) require at least one blind position"

**Problem**: Button is present but no blind positions assigned

**Solution**: When including a BTN position, also include at least SB or BB

### Error: "Each player must have a unique position"

**Problem**: Multiple players assigned to the same position

**Solution**: Ensure each player has a different position

### Error: "Invalid position(s): [position names]"

**Problem**: Using non-standard position abbreviations

**Solution**: Use only the standard abbreviations listed above

## Position Order

### Preflop Action Order
1. UTG (Under the Gun)
2. UTG+1
3. MP (Middle Position)
4. LJ (Lojack)
5. HJ (Hijack)
6. CO (Cutoff)
7. BTN (Button)
8. SB (Small Blind)
9. BB (Big Blind) - acts last

### Postflop Action Order
1. SB (Small Blind) - acts first
2. BB (Big Blind)
3. UTG
4. UTG+1
5. MP
6. LJ
7. HJ
8. CO
9. BTN (Button) - acts last

## Technical Implementation

The position validation is enforced in the `ShareHandProvider` component using the `validatePositions` utility function. This ensures that only valid position configurations can proceed to hand creation.

For developers, the validation logic can be found in:
- `/src/utils/positionValidation.ts` - Core validation logic
- `/app/share-hand/components/ShareHandProvider.tsx` - UI integration
- `/src/utils/__tests__/positionValidation.test.ts` - Test cases