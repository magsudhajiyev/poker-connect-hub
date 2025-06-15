import { useIsMobile } from '@/hooks/use-mobile';
import { standardizePosition, getActionOrder } from '@/utils/positionMapping';
import { Player } from '@/types/shareHand';

export const usePokerTableLogic = (players: Player[], currentStreet?: string, formData?: any) => {
  const isMobile = useIsMobile();
  
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

  // Simplified approach: check if this player has the next incomplete action
  const isPlayerToAct = (position: string) => {
    console.log('🔍 DEBUGGING isPlayerToAct:', {
      position,
      currentStreet,
      hasFormData: !!formData
    });

    if (!currentStreet || !formData) {
      console.log('❌ No currentStreet or formData for isPlayerToAct check');
      return false;
    }
    
    const actions = formData[currentStreet];
    const player = getPlayerAtPosition(position);
    
    console.log('🔍 isPlayerToAct debug data:', {
      position,
      currentStreet,
      hasPlayer: !!player,
      playerName: player?.name,
      playerId: player?.id,
      actionsLength: actions?.length || 0,
      allActions: actions?.map((a: any) => ({
        name: a.playerName,
        id: a.playerId,
        completed: a.completed,
        action: a.action
      })) || []
    });

    if (!player) {
      console.log('❌ No player found at position:', position);
      return false;
    }

    // If no actions exist yet, determine first to act based on position order
    if (!actions || actions.length === 0) {
      console.log('🎯 No actions found, determining first to act based on positions');
      
      const playersWithPositions = players.filter(p => p.position);
      if (playersWithPositions.length < 2) {
        console.log('❌ Not enough players to determine action order');
        return false;
      }

      const uiPositions = playersWithPositions.map(p => p.position);
      const isPreflop = currentStreet === 'preflopActions';
      const orderedPositions = getActionOrder(uiPositions, isPreflop);
      
      if (orderedPositions.length > 0) {
        const firstToActStandardPos = orderedPositions[0];
        const playerStandardPos = standardizePosition(position);
        const isFirstToAct = playerStandardPos === firstToActStandardPos;
        
        console.log('🎯 First to act determination:', {
          position,
          playerStandardPos,
          firstToActStandardPos,
          isFirstToAct
        });
        
        return isFirstToAct;
      }
    }
    
    // If actions exist, find the first incomplete action
    if (actions && actions.length > 0) {
      const nextIncompleteAction = actions.find((action: any) => !action.completed);
      
      console.log('🔍 Next incomplete action search:', {
        nextIncompleteAction: nextIncompleteAction ? {
          playerName: nextIncompleteAction.playerName,
          playerId: nextIncompleteAction.playerId,
          completed: nextIncompleteAction.completed
        } : null
      });

      if (!nextIncompleteAction) {
        console.log('❌ No incomplete actions found - all actions completed');
        return false;
      }
      
      const isMatch = nextIncompleteAction.playerId === player.id;
      
      console.log('🎯 isPlayerToAct final check:', {
        position,
        playerName: player.name,
        playerId: player.id,
        nextActionPlayerId: nextIncompleteAction.playerId,
        nextActionPlayerName: nextIncompleteAction.playerName,
        isMatch
      });
      
      return isMatch;
    }
    
    console.log('❌ Fallback: no conditions met');
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
