
import { ShareHandFormData, StreetType, ActionStep } from '@/types/shareHand';
import { 
  initializeActions, 
  createNextActionStep, 
  shouldAddNextAction 
} from '@/utils/shareHandActions';

export const useActionManagement = (
  formData: ShareHandFormData, 
  setFormData: (data: ShareHandFormData | ((prev: ShareHandFormData) => ShareHandFormData)) => void
) => {
  const addNextActionStep = (street: StreetType, currentIndex: number) => {
    const actions = formData[street];
    const currentAction = actions[currentIndex];
    
    // Check if currentAction exists and has an action property
    if (!currentAction || !currentAction.action) {
      console.warn(`Cannot add next action step: currentAction is undefined or has no action at index ${currentIndex}`);
      return;
    }
    
    console.log(`Adding next action step after ${currentAction.action} by ${currentAction.playerName}`);
    
    if (shouldAddNextAction(currentAction.action)) {
      const nextActionStep = createNextActionStep(currentAction, formData.players);
      
      // Check if next action already exists
      const nextActionExists = actions.find((action, index) => 
        index > currentIndex && action.playerId === nextActionStep.playerId
      );
      
      if (!nextActionExists) {
        const updatedActions = [...actions, nextActionStep];
        console.log(`Adding next action step for ${nextActionStep.playerName}`, updatedActions);
        
        setFormData((prev: ShareHandFormData) => ({ ...prev, [street]: updatedActions }));
      }
    }
  };

  const updateAction = (street: StreetType, index: number, action: string, betAmount?: string) => {
    console.log(`Updating action at index ${index} on ${street}:`, action, betAmount);
    
    setFormData((prev: ShareHandFormData) => {
      const updatedActions = [...prev[street]];
      
      // Check if the action at the index exists
      if (!updatedActions[index]) {
        console.warn(`Cannot update action: no action exists at index ${index}`);
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
        completed: action !== 'bet' && action !== 'raise'
      };
      
      // If changing from bet/raise to something else, remove subsequent actions
      if ((previousAction === 'bet' || previousAction === 'raise') && 
          !shouldAddNextAction(action)) {
        console.log(`Action changed from ${previousAction} to ${action}, removing subsequent actions`);
        const actionsToKeep = updatedActions.slice(0, index + 1);
        const newFormData = { ...prev, [street]: actionsToKeep };
        
        // If the new action is bet or raise, add next action step
        if (shouldAddNextAction(action)) {
          setTimeout(() => {
            addNextActionStep(street, index);
          }, 100);
        }
        
        return newFormData;
      }
      
      const newFormData = { ...prev, [street]: updatedActions };
      
      // If this is a bet or raise action, add next action step
      if (shouldAddNextAction(action)) {
        setTimeout(() => {
          addNextActionStep(street, index);
        }, 100);
      }
      
      return newFormData;
    });
  };

  const handleBetSizeSelect = (street: StreetType, index: number, amount: string) => {
    console.log(`Bet size selected: ${amount} for index ${index} on ${street}`);
    
    // Validate amount is a valid number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.warn('Invalid bet amount selected:', amount);
      return;
    }
    
    setFormData((prev: ShareHandFormData) => {
      const updatedActions = [...prev[street]];
      const currentAction = updatedActions[index];
      
      // Check if currentAction exists
      if (!currentAction) {
        console.warn(`Cannot handle bet size select: no action exists at index ${index}`);
        return prev;
      }
      
      // Update the current action with bet amount and mark as completed
      updatedActions[index] = {
        ...currentAction,
        betAmount: amount,
        completed: true
      };
      
      // Add next action step if this is a bet or raise and it doesn't already exist
      if (currentAction.action && shouldAddNextAction(currentAction.action)) {
        const nextActionStep = createNextActionStep(currentAction, prev.players);
        
        // Check if next action already exists
        const nextActionExists = updatedActions.find((action, actionIndex) => 
          actionIndex > index && action.playerId === nextActionStep.playerId
        );
        
        if (!nextActionExists) {
          updatedActions.push(nextActionStep);
          console.log(`Adding next action step for ${nextActionStep.playerName}`, updatedActions);
        }
      }
      
      return { ...prev, [street]: updatedActions };
    });
  };

  const initializeActionsForPositions = () => {
    // Only initialize if we have both positions and players
    if (formData.heroPosition && formData.villainPosition && formData.players && formData.players.length > 0) {
      console.log('Initializing actions with players:', formData.players);
      
      const streets: StreetType[] = [
        'preflopActions', 'flopActions', 'turnActions', 'riverActions'
      ];
      
      const updatedFormData = { ...formData };
      let hasChanges = false;
      
      streets.forEach(street => {
        // Always reinitialize actions when players change
        const newActions = initializeActions(
          street, 
          formData.heroPosition, 
          formData.villainPosition,
          formData.players
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
        players: formData.players
      });
    }
  };

  return {
    updateAction,
    handleBetSizeSelect,
    initializeActionsForPositions
  };
};
