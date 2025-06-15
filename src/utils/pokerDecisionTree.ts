
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
  stacks: Record<string, number>; // stack per player
  children: Record<string, ActionNode | null>; // action -> next node
  isAllIn?: boolean;
  isFinal?: boolean;
}

// Builds the action tree for the given ordered positions
export function buildActionTree(
  actors: string[],
  street: string,
  stacks: Record<string, number>,
  pot = 0,
  currentIndex = 0,
  maxDepth = 10
): ActionNode | null {
  if (currentIndex >= actors.length || maxDepth <= 0) return null;

  const actor = actors[currentIndex];
  const options = ["fold", "call", "raise"];
  const node: ActionNode = {
    actor,
    street,
    options,
    pot,
    stacks: { ...stacks },
    children: {},
  };

  for (const action of options) {
    const updatedStacks = { ...stacks };
    let updatedPot = pot;
    let isAllIn = false;

    if (action === "fold") {
      node.children[action] = {
        actor: actor,
        street,
        options: [],
        pot: updatedPot,
        stacks: updatedStacks,
        children: {},
        isFinal: true
      };

    } else if (action === "call") {
      const callAmount = 10; // example flat call
      if (updatedStacks[actor] <= callAmount) {
        updatedPot += updatedStacks[actor];
        updatedStacks[actor] = 0;
        isAllIn = true;
      } else {
        updatedPot += callAmount;
        updatedStacks[actor] -= callAmount;
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex < actors.length) {
        node.children[action] = buildActionTree(actors, street, updatedStacks, updatedPot, nextIndex, maxDepth - 1);
      } else {
        const nextStreet = getNextStreet(street);
        node.children[action] = nextStreet
          ? buildActionTree(actors, nextStreet, updatedStacks, updatedPot, 0, maxDepth - 1)
          : {
              actor: actor,
              street,
              options: [],
              pot: updatedPot,
              stacks: updatedStacks,
              children: {},
              isFinal: true
            };
      }
    } else if (action === "raise") {
      const raiseAmount = 20; // example flat raise
      if (updatedStacks[actor] <= raiseAmount) {
        updatedPot += updatedStacks[actor];
        updatedStacks[actor] = 0;
        isAllIn = true;
      } else {
        updatedPot += raiseAmount;
        updatedStacks[actor] -= raiseAmount;
      }
      node.children[action] = buildActionTree(actors, street, updatedStacks, updatedPot, 0, maxDepth - 1);
    }

    if (node.children[action]) node.children[action]!.isAllIn = isAllIn;
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

// For frontend use: convert the tree into a format for D3.js or JSON
export interface VisualActionNode {
  name: string;
  children?: VisualActionNode[];
  pot?: number;
  stacks?: Record<string, number>;
  isAllIn?: boolean;
  isFinal?: boolean;
}

// Updated to create the exact format you specified
export function convertToVisualTree(node: ActionNode | null): VisualActionNode | null {
  if (!node) return null;

  const children: VisualActionNode[] = [];
  
  // For each action option, create a child node with the proper label
  for (const [action, childNode] of Object.entries(node.children)) {
    if (childNode) {
      // Create the label in the exact format: STREET - [ACTOR] -> [ACTION] | Pot: $[amount] | Stacks: {...} [| FINAL]
      const stacksStr = JSON.stringify(childNode.stacks);
      const finalStr = childNode.isFinal ? " | FINAL" : "";
      const label = `${node.street.toUpperCase()} - ${node.actor} -> ${action} | Pot: $${childNode.pot} | Stacks: ${stacksStr}${finalStr}`;
      
      // Recursively convert the child node
      const visualChild = convertToVisualTree(childNode);
      
      children.push({
        name: label,
        pot: childNode.pot,
        stacks: childNode.stacks,
        isAllIn: childNode.isAllIn,
        isFinal: childNode.isFinal,
        children: visualChild && !childNode.isFinal ? [visualChild] : undefined,
      });
    }
  }

  // Return the root node with its children
  return { 
    name: node.actor, 
    children: children.length > 0 ? children : undefined,
    pot: node.pot,
    stacks: node.stacks,
    isAllIn: node.isAllIn,
    isFinal: node.isFinal
  };
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

  // Build the decision tree
  const tree = buildActionTree(orderedActors, "preflop", initialStacks);
  
  // Convert to visual format
  return convertToVisualTree(tree);
}
