
import { ShareHandFormData, StreetType, ActionStep } from '@/types/shareHand';
import { 
  initializeActions, 
  createNextActionStep, 
  shouldAddNextAction, 
} from '@/utils/shareHandActions';
import { ActionType } from '@/constants';

export const useActionManagement = (
  formData: ShareHandFormData, 
  setFormData: (data: ShareHandFormData | ((prev: ShareHandFormData) => ShareHandFormData)) => void,
) => {
  const addNextActionStep = (street: StreetType, currentIndex: number) => {
    const actions = formData[street];
    
    // Add bounds checking to prevent undefined access
    if (currentIndex < 0 || currentIndex >= actions.length) {
      console.warn(`Invalid action index ${currentIndex} for street ${street}. Actions length: ${actions.length}`);
      return;
    }
    
    const currentAction = actions[currentIndex];
    
    // Additional safety check
    if (!currentAction || !currentAction.action) {
      console.warn('Current action is undefined or missing action property:', currentAction);
      return;
    }
    
    console.log(`Adding next action step after ${currentAction.action} by ${currentAction.playerName}`);
    
    if (shouldAddNextAction(currentAction.action)) {
      const nextActionStep = createNextActionStep(currentAction, formData.players);
      
      // Check if next action already exists
      const nextActionExists = actions.find((action, index) => 
        index > currentIndex && action.playerId === nextActionStep.playerId,
      );
      
      if (!nextActionExists) {
        const updatedActions = [...actions, nextActionStep];
        console.log(`Adding next action step for ${nextActionStep.playerName}`, updatedActions);
        
        setFormData((prev: ShareHandFormData) => ({ ...prev, [street]: updatedActions }));
      }
    }
  };

  const updateAction = (street: StreetType, index: number, action: ActionType, betAmount?: string) => {
    console.log(`🎯 useActionManagement.updateAction called at index ${index} on ${street}:`, action, betAmount);
    
    setFormData((prev: ShareHandFormData) => {
      const updatedActions = [...prev[street]];
      
      // Add bounds checking
      if (index < 0 || index >= updatedActions.length) {
        console.warn(`Invalid action index ${index} for street ${street}. Actions length: ${updatedActions.length}`);
        // If index is invalid, try to find the first incomplete action for this player
        // or create a new action step if none exists
        return prev;
      }
      
      const previousAction = updatedActions[index].action;
      
      // Ensure betAmount is properly handled
      const validBetAmount = betAmount !== undefined ? betAmount : updatedActions[index].betAmount || '';
      
      // Update the current action
      updatedActions[index] = {
        ...updatedActions[index],
        action,
        betAmount: validBetAmount,
        completed: action !== ActionType.BET && action !== ActionType.RAISE,
      };
      
      // If changing from bet/raise to something else, remove subsequent actions
      if ((previousAction === ActionType.BET || previousAction === ActionType.RAISE) && 
          !shouldAddNextAction(action)) {
        console.log(`Action changed from ${previousAction} to ${action}, removing subsequent actions`);
        const actionsToKeep = updatedActions.slice(0, index + 1);
        let newFormData = { ...prev, [street]: actionsToKeep };
        
        // If the new action is bet or raise, add next action step immediately
        if (shouldAddNextAction(action)) {
          const currentAction = actionsToKeep[index];
          if (currentAction?.action) {
            const nextActionStep = createNextActionStep(currentAction, prev.players);
            // Check if next action already exists
            const nextActionExists = actionsToKeep.find((action, actionIndex) => 
              actionIndex > index && action.playerId === nextActionStep.playerId,
            );
            if (!nextActionExists) {
              newFormData = { ...newFormData, [street]: [...actionsToKeep, nextActionStep] };
            }
          }
        }
        
        return newFormData;
      }
      
      let newFormData = { ...prev, [street]: updatedActions };
      
      // If this is a bet or raise action, add next action step immediately
      if (shouldAddNextAction(action)) {
        const currentAction = updatedActions[index];
        if (currentAction?.action) {
          const nextActionStep = createNextActionStep(currentAction, prev.players);
          // Check if next action already exists
          const nextActionExists = updatedActions.find((action, actionIndex) => 
            actionIndex > index && action.playerId === nextActionStep.playerId,
          );
          if (!nextActionExists) {
            newFormData = { ...newFormData, [street]: [...updatedActions, nextActionStep] };
          }
        }
      }
      
      return newFormData;
    });
  };

  const handleBetSizeSelect = (street: StreetType, index: number, amount: string) => {
    console.log(`🎯 useActionManagement.handleBetSizeSelect called: ${amount} for index ${index} on ${street}`);
    
    // Validate amount is a valid number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.warn('Invalid bet amount selected:', amount);
      return;
    }
    
    setFormData((prev: ShareHandFormData) => {
      const updatedActions = [...prev[street]];
      
      // Add bounds checking
      if (index < 0 || index >= updatedActions.length) {
        console.warn(`Invalid action index ${index} for street ${street}. Actions length: ${updatedActions.length}`);
        return prev;
      }
      
      const currentAction = updatedActions[index];
      
      // Update the current action with bet amount and mark as completed
      updatedActions[index] = {
        ...currentAction,
        betAmount: amount,
        completed: true,
      };
      
      // Update player's stack size when bet amount is finalized
      let updatedPlayers = [...(prev.players || [])];
      if (currentAction.action && (currentAction.action === 'bet' || currentAction.action === 'raise' || currentAction.action === 'call')) {
        updatedPlayers = updatedPlayers.map(player => {
          if (player.id === currentAction.playerId) {
            // Reduce stack size by the bet amount
            const currentStack = player.stackSize[0] || 100;
            const newStack = Math.max(0, currentStack - numericAmount);
            
            console.log(`Player ${player.name}: stack ${currentStack} - bet ${numericAmount} = ${newStack}`);
            
            return {
              ...player,
              stackSize: [newStack],
            };
          }
          return player;
        });
      }
      
      // Add next action step if this is a bet or raise and it doesn't already exist
      if (currentAction.action && shouldAddNextAction(currentAction.action)) {
        const nextActionStep = createNextActionStep(currentAction, prev.players);
        
        // Check if next action already exists
        const nextActionExists = updatedActions.find((action, actionIndex) => 
          actionIndex > index && action.playerId === nextActionStep.playerId,
        );
        
        if (!nextActionExists) {
          updatedActions.push(nextActionStep);
          console.log(`Adding next action step for ${nextActionStep.playerName}`, updatedActions);
        }
      }
      
      return { ...prev, [street]: updatedActions, players: updatedPlayers };
    });
  };

  const initializeActionsForPositions = () => {
    // Only initialize if we have both positions and players
    if (formData.heroPosition && formData.villainPosition && formData.players && formData.players.length > 0) {
      console.log('Initializing actions with players:', formData.players);
      
      const streets: StreetType[] = [
        'preflopActions', 'flopActions', 'turnActions', 'riverActions',
      ];
      
      const updatedFormData = { ...formData };
      let hasChanges = false;
      
      streets.forEach(street => {
        // Always reinitialize actions when players change
        const newActions = initializeActions(
          street, 
          formData.heroPosition, 
          formData.villainPosition,
          formData.players,
        );
        
        // Only update if the action structure has changed (different number of players or different players)
        const currentActions = updatedFormData[street];
        const currentPlayerIds = currentActions.map(a => a.playerId);
        const newPlayerIds = newActions.map(a => a.playerId);
        
        if (currentPlayerIds.length !== newPlayerIds.length || 
            !currentPlayerIds.every((id, index) => id === newPlayerIds[index])) {
          console.log(`Reinitializing ${street} actions with new player structure`);
          updatedFormData[street] = newActions;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        console.log('Updated actions for all streets with new players:', updatedFormData);
        setFormData(updatedFormData);
      }
    } else {
      console.log('Skipping action initialization - missing data:', {
        heroPosition: formData.heroPosition,
        villainPosition: formData.villainPosition,
        players: formData.players,
      });
    }
  };

  return {
    updateAction,
    handleBetSizeSelect,
    initializeActionsForPositions,
  };
};
