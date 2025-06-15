
import { useIsMobile } from '@/hooks/use-mobile';
import { standardizePosition, getActionOrder } from '@/utils/positionMapping';
import { Player } from '@/types/shareHand';
import { useShareHandContext } from '../ShareHandProvider';

export const usePokerTableLogic = (players: Player[], currentStreet?: string, formData?: any) => {
  const isMobile = useIsMobile();
  const { gameStateUI } = useShareHandContext();
  
  // All possible positions around the table in clockwise order starting from top
  const allPositions = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];
  
  // Calculate evenly spaced positions around an ellipse
  const calculatePositions = () => {
    const positions: { [key: string]: { mobile: { x: number; y: number }, desktop: { x: number; y: number } } } = {};
    
    // Center coordinates
    const centerX = 50;
    const centerY = 50;
    
    // Ellipse radii (percentage of container)
    // Make mobile more vertically elliptical for better spacing
    const radiusX = isMobile ? 35 : 42; // Smaller horizontal radius on mobile
    const radiusY = isMobile ? 45 : 40; // Larger vertical radius on mobile
    
    // Starting angle (top center) - adjust to start at top
    const startAngle = -Math.PI / 2; // -90 degrees (top)
    
    // Calculate angular step for 9 positions
    const angleStep = (2 * Math.PI) / 9;
    
    allPositions.forEach((position, index) => {
      const angle = startAngle + (index * angleStep);
      
      // Calculate position on ellipse
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      
      positions[position] = {
        mobile: { x, y },
        desktop: { x, y }
      };
    });
    
    return positions;
  };

  const seatPositions = calculatePositions();

  // Get player for a specific position
  const getPlayerAtPosition = (position: string) => {
    return players.find(p => p.position === position);
  };

  // Check if any player is already set as hero
  const hasHero = players.some(p => p.isHero);

  // Check if it's this player's turn to act - UPDATED to use game state
  const isPlayerToAct = (position: string) => {
    // First priority: use game state if available
    if (gameStateUI?.gameState && gameStateUI.isPlayerActive) {
      const isActiveFromGameState = gameStateUI.isPlayerActive(position);
      console.log('GAME STATE CHECK - isPlayerToAct:', {
        position,
        isActiveFromGameState,
        currentPlayerFromGameState: gameStateUI.currentPlayerPosition,
        gameStateRound: gameStateUI.currentRound,
        currentStreet
      });
      
      // Only use game state if we're on the matching street
      const gameStateStreet = gameStateUI.currentRound + 'Actions';
      if (gameStateStreet === currentStreet) {
        return isActiveFromGameState;
      }
    }
    
    // Fallback to form data logic if no game state or different street
    if (!currentStreet || !formData) {
      console.log('No currentStreet or formData for isPlayerToAct check');
      return false;
    }
    
    const actions = formData[currentStreet];
    const player = getPlayerAtPosition(position);
    if (!player) {
      console.log('No player found at position:', position);
      return false;
    }

    // If no actions exist yet, determine first to act based on position order
    if (!actions || actions.length === 0) {
      console.log('No actions found, determining first to act based on positions');
      
      // Get all players with positions
      const playersWithPositions = players.filter(p => p.position);
      if (playersWithPositions.length < 2) {
        console.log('Not enough players to determine action order');
        return false;
      }

      // Get action order for this street
      const uiPositions = playersWithPositions.map(p => p.position);
      const isPreflop = currentStreet === 'preflopActions';
      const orderedPositions = getActionOrder(uiPositions, isPreflop);
      
      // First position in order should be first to act
      if (orderedPositions.length > 0) {
        const firstToActStandardPos = orderedPositions[0];
        const playerStandardPos = standardizePosition(position);
        const isFirstToAct = playerStandardPos === firstToActStandardPos;
        
        console.log('FALLBACK - First to act determination:', {
          position,
          playerStandardPos,
          firstToActStandardPos,
          isFirstToAct,
          orderedPositions,
          currentStreet
        });
        
        return isFirstToAct;
      }
    }
    
    // If actions exist, use existing logic
    if (actions && actions.length > 0) {
      // Find the first incomplete action (next to act)
      const nextActionIndex = actions.findIndex((action: any) => !action.completed);
      if (nextActionIndex === -1) {
        console.log('FALLBACK - No incomplete actions found');
        return false;
      }
      
      const nextAction = actions[nextActionIndex];
      const isMatch = nextAction.playerId === player.id;
      
      console.log('FALLBACK - isPlayerToAct check:', {
        position,
        playerName: player.name,
        playerId: player.id,
        nextActionPlayerId: nextAction.playerId,
        nextActionPlayerName: nextAction.playerName,
        isMatch,
        currentStreet,
        nextActionIndex
      });
      
      return isMatch;
    }
    
    return false;
  };

  // Get the current bet amount for a player in this street
  const getPlayerBetAmount = (position: string) => {
    if (!currentStreet || !formData) return null;
    
    const actions = formData[currentStreet];
    if (!actions) return null;
    
    const player = getPlayerAtPosition(position);
    if (!player) return null;
    
    // Find the most recent completed bet or raise action for this player
    const playerActions = actions.filter((action: any) => 
      action.playerId === player.id && 
      action.completed && 
      (action.action === 'bet' || action.action === 'raise') &&
      action.betAmount
    );
    
    if (playerActions.length === 0) return null;
    
    // Get the most recent bet/raise
    const latestAction = playerActions[playerActions.length - 1];
    console.log('Player bet amount for', position, ':', latestAction.betAmount);
    return latestAction.betAmount;
  };

  return {
    allPositions,
    seatPositions,
    getPlayerAtPosition,
    hasHero,
    isPlayerToAct,
    getPlayerBetAmount,
    isMobile
  };
};
