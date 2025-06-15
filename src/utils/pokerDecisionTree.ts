
// Define player positions order
const POSITIONS_ORDER = [
  "UTG", "UTG+1", "MP", "CO", "BTN", "SB", "BB"
];

// Get ordered player positions from left of the dealer (preflop order)
export function getActionOrder(activePositions: string[]): string[] {
  return [...activePositions].sort(
    (a, b) => POSITIONS_ORDER.indexOf(a) - POSITIONS_ORDER.indexOf(b)
  );
}

// ActionNode represents a decision point in the hand
export interface ActionNode {
  actor: string;
  street: string;
  options: string[];
  pot: number;
  stacks: Record<string, number>;
  children: Record<string, ActionNode | null>;
  isAllIn?: boolean;
  isFinal?: boolean;
  currentBet?: number; // Track current bet amount on this street
  lastAggressor?: string; // Track who made the last bet/raise
}

// Builds the action tree for the given ordered positions
export function buildActionTree(
  actors: string[],
  street: string,
  stacks: Record<string, number>,
  pot = 0,
  currentIndex = 0,
  maxDepth = 8,
  currentBet = 0,
  lastAggressor = ""
): ActionNode | null {
  if (currentIndex >= actors.length || maxDepth <= 0) return null;

  const actor = actors[currentIndex];
  
  // Determine available actions based on current bet state
  let options: string[] = [];
  if (currentBet === 0) {
    // No bet made yet - can check or bet
    options = ["check", "bet"];
  } else {
    // Bet has been made - can fold, call, or raise
    options = ["fold", "call", "raise"];
  }

  const node: ActionNode = {
    actor,
    street,
    options,
    pot,
    stacks: { ...stacks },
    children: {},
    currentBet,
    lastAggressor
  };

  for (const action of options) {
    const updatedStacks = { ...stacks };
    let updatedPot = pot;
    let updatedCurrentBet = currentBet;
    let updatedLastAggressor = lastAggressor;
    let isAllIn = false;

    if (action === "fold") {
      // Player folds - hand ends
      node.children[action] = {
        actor: actor,
        street,
        options: [],
        pot: updatedPot,
        stacks: updatedStacks,
        children: {},
        isFinal: true,
        currentBet: updatedCurrentBet,
        lastAggressor: updatedLastAggressor
      };

    } else if (action === "check") {
      // Player checks - move to next player or next street
      const nextIndex = currentIndex + 1;
      if (nextIndex < actors.length) {
        // More players to act
        node.children[action] = buildActionTree(
          actors, street, updatedStacks, updatedPot, nextIndex, maxDepth - 1, 
          updatedCurrentBet, updatedLastAggressor
        );
      } else {
        // All players have acted, move to next street
        const nextStreet = getNextStreet(street);
        if (nextStreet) {
          node.children[action] = buildActionTree(
            actors, nextStreet, updatedStacks, updatedPot, 0, maxDepth - 1, 0, ""
          );
        } else {
          // No more streets - showdown
          node.children[action] = {
            actor: actor,
            street,
            options: [],
            pot: updatedPot,
            stacks: updatedStacks,
            children: {},
            isFinal: true,
            currentBet: 0,
            lastAggressor: ""
          };
        }
      }

    } else if (action === "call") {
      // Player calls the current bet
      const callAmount = currentBet;
      if (updatedStacks[actor] <= callAmount) {
        // All-in call
        updatedPot += updatedStacks[actor];
        updatedStacks[actor] = 0;
        isAllIn = true;
      } else {
        updatedPot += callAmount;
        updatedStacks[actor] -= callAmount;
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex < actors.length) {
        // More players to act
        node.children[action] = buildActionTree(
          actors, street, updatedStacks, updatedPot, nextIndex, maxDepth - 1,
          updatedCurrentBet, updatedLastAggressor
        );
      } else {
        // All players have acted and called, move to next street
        const nextStreet = getNextStreet(street);
        if (nextStreet) {
          node.children[action] = buildActionTree(
            actors, nextStreet, updatedStacks, updatedPot, 0, maxDepth - 1, 0, ""
          );
        } else {
          // No more streets - showdown
          node.children[action] = {
            actor: actor,
            street,
            options: [],
            pot: updatedPot,
            stacks: updatedStacks,
            children: {},
            isFinal: true,
            currentBet: 0,
            lastAggressor: ""
          };
        }
      }

    } else if (action === "bet") {
      // Player bets (first bet on this street)
      const betAmount = Math.min(20, updatedStacks[actor]); // Example bet size
      
      if (updatedStacks[actor] <= betAmount) {
        // All-in bet
        updatedPot += updatedStacks[actor];
        updatedCurrentBet = updatedStacks[actor];
        updatedStacks[actor] = 0;
        isAllIn = true;
      } else {
        updatedPot += betAmount;
        updatedCurrentBet = betAmount;
        updatedStacks[actor] -= betAmount;
      }
      
      updatedLastAggressor = actor;
      
      // After a bet, action goes back to first player (unless current player is last)
      const nextIndex = currentIndex + 1;
      if (nextIndex < actors.length) {
        node.children[action] = buildActionTree(
          actors, street, updatedStacks, updatedPot, nextIndex, maxDepth - 1,
          updatedCurrentBet, updatedLastAggressor
        );
      } else {
        // Current player was last to act, go back to first player
        node.children[action] = buildActionTree(
          actors, street, updatedStacks, updatedPot, 0, maxDepth - 1,
          updatedCurrentBet, updatedLastAggressor
        );
      }

    } else if (action === "raise") {
      // Player raises the current bet
      const raiseAmount = Math.min(currentBet * 2, updatedStacks[actor]); // Example: 2x raise
      
      if (updatedStacks[actor] <= raiseAmount) {
        // All-in raise
        updatedPot += updatedStacks[actor];
        updatedCurrentBet = updatedStacks[actor];
        updatedStacks[actor] = 0;
        isAllIn = true;
      } else {
        updatedPot += raiseAmount;
        updatedCurrentBet = raiseAmount;
        updatedStacks[actor] -= raiseAmount;
      }
      
      updatedLastAggressor = actor;
      
      // After a raise, action goes back to first player
      node.children[action] = buildActionTree(
        actors, street, updatedStacks, updatedPot, 0, maxDepth - 1,
        updatedCurrentBet, updatedLastAggressor
      );
    }

    if (node.children[action]) {
      node.children[action]!.isAllIn = isAllIn;
    }
  }

  return node;
}

// Street progression
const STREETS = ["preflop", "flop", "turn", "river"];
function getNextStreet(current: string): string | null {
  const index = STREETS.indexOf(current);
  if (index === -1 || index + 1 >= STREETS.length) return null;
  return STREETS[index + 1];
}

// For frontend use: convert the tree into a format for visualization
export interface VisualActionNode {
  name: string;
  children?: VisualActionNode[];
  pot?: number;
  stacks?: Record<string, number>;
  isAllIn?: boolean;
  isFinal?: boolean;
}

// Convert to visual tree - creates properly formatted action nodes
export function convertToVisualTree(node: ActionNode | null): VisualActionNode[] {
  if (!node) return [];

  const results: VisualActionNode[] = [];
  
  // For each action option, create a node with the proper label format
  for (const [action, childNode] of Object.entries(node.children)) {
    if (childNode) {
      // Create the label in the exact format: STREET - [ACTOR] -> [ACTION] | Pot: $[amount] | Stacks: {...} [| FINAL]
      const stacksStr = JSON.stringify(childNode.stacks);
      const finalStr = childNode.isFinal ? " | FINAL" : "";
      const label = `${node.street.toUpperCase()} - ${node.actor} -> ${action} | Pot: $${childNode.pot} | Stacks: ${stacksStr}${finalStr}`;
      
      // Create the action node
      const actionNode: VisualActionNode = {
        name: label,
        pot: childNode.pot,
        stacks: childNode.stacks,
        isAllIn: childNode.isAllIn,
        isFinal: childNode.isFinal
      };

      // If this action doesn't end the hand, recursively get children
      if (!childNode.isFinal) {
        const childResults = convertToVisualTree(childNode);
        if (childResults.length > 0) {
          actionNode.children = childResults;
        }
      }
      
      results.push(actionNode);
    }
  }

  return results;
}

// Helper function to build tree from current form data
export function buildTreeFromFormData(formData: any): VisualActionNode | null {
  if (!formData.players || formData.players.length < 2) {
    return null;
  }

  // Extract active positions from players
  const activePositions = formData.players
    .filter((p: any) => p.position)
    .map((p: any) => p.position.toUpperCase());

  // Get ordered actors
  const orderedActors = getActionOrder(activePositions);

  // Build initial stacks from players
  const initialStacks: Record<string, number> = {};
  formData.players.forEach((player: any) => {
    if (player.position && player.stackSize) {
      initialStacks[player.position.toUpperCase()] = parseFloat(player.stackSize) || 100;
    }
  });

  // Calculate initial pot (blinds)
  const smallBlind = parseFloat(formData.smallBlind) || 1;
  const bigBlind = parseFloat(formData.bigBlind) || 2;
  const initialPot = smallBlind + bigBlind;

  // Adjust stacks for blinds (simplified - assumes SB and BB are in the game)
  const adjustedStacks = { ...initialStacks };
  
  // Build the decision tree starting with preflop
  const tree = buildActionTree(orderedActors, "preflop", adjustedStacks, initialPot, 0, 8, bigBlind, "");
  
  // Convert to visual format - return as a wrapper node
  if (tree) {
    const children = convertToVisualTree(tree);
    return {
      name: "Decision Tree",
      children: children.length > 0 ? children : undefined
    };
  }
  
  return null;
}
