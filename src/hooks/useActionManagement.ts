
import { ShareHandFormData, StreetType, ActionStep } from '@/types/shareHand';
import { 
  initializeActions, 
  createNextActionStep, 
  shouldAddNextAction 
} from '@/utils/shareHandActions';

export const useActionManagement = (
  formData: ShareHandFormData, 
  setFormData: (data: ShareHandFormData) => void
) => {
  const addNextActionStep = (street: StreetType, currentIndex: number) => {
    const actions = formData[street];
    const currentAction = actions[currentIndex];
    
    console.log(`Adding next action step after ${currentAction.action} by ${currentAction.playerName}`);
    
    if (shouldAddNextAction(currentAction.action!)) {
      const nextActionStep = createNextActionStep(currentAction);
      
      // Check if next action already exists
      const nextActionExists = actions.find((action, index) => 
        index > currentIndex && action.playerId === nextActionStep.playerId
      );
      
      if (!nextActionExists) {
        const updatedActions = [...actions, nextActionStep];
        console.log(`Adding next action step for ${nextActionStep.playerName}`, updatedActions);
        
        setFormData(prev => ({ ...prev, [street]: updatedActions }));
      }
    }
  };

  const updateAction = (street: StreetType, index: number, action: string, betAmount?: string) => {
    console.log(`Updating action at index ${index} on ${street}:`, action, betAmount);
    
    setFormData(prev => {
      const updatedActions = [...prev[street]];
      const previousAction = updatedActions[index].action;
      
      // Update the current action
      updatedActions[index] = {
        ...updatedActions[index],
        action,
        betAmount: betAmount || updatedActions[index].betAmount,
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
    
    setFormData(prev => {
      const updatedActions = [...prev[street]];
      const currentAction = updatedActions[index];
      
      // Update the current action with bet amount and mark as completed
      updatedActions[index] = {
        ...currentAction,
        betAmount: amount,
        completed: true
      };
      
      // Add next action step if this is a bet or raise and it doesn't already exist
      if (shouldAddNextAction(currentAction.action!)) {
        const nextActionStep = createNextActionStep(currentAction);
        
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
    if (formData.heroPosition && formData.villainPosition) {
      const streets: StreetType[] = [
        'preflopActions', 'flopActions', 'turnActions', 'riverActions'
      ];
      
      const updatedFormData = { ...formData };
      let hasChanges = false;
      
      streets.forEach(street => {
        if (updatedFormData[street].length === 0) {
          updatedFormData[street] = initializeActions(street, formData.heroPosition, formData.villainPosition);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setFormData(updatedFormData);
      }
    }
  };

  return {
    updateAction,
    handleBetSizeSelect,
    initializeActionsForPositions
  };
};
