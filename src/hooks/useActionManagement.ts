
import { ShareHandFormData, StreetType, ActionStep } from '@/types/shareHand';
import { 
  initializeActions, 
  createNextActionStep, 
  shouldAddNextAction,
  removeFoldedPlayerFromFutureStreets
} from '@/utils/shareHandActions';

export const useActionManagement = (
  formData: ShareHandFormData, 
  setFormData: (data: ShareHandFormData | ((prev: ShareHandFormData) => ShareHandFormData)) => void,
  gameStateUI?: any
) => {
  const addNextActionStep = (street: StreetType, currentIndex: number) => {
    const actions = formData[street];
    const currentAction = actions[currentIndex];
    
    if (!currentAction || !currentAction.action) {
      console.warn(`Cannot add next action step: currentAction is undefined or has no action at index ${currentIndex}`);
      return;
    }
    
    console.log(`Adding next action step after ${currentAction.action} by ${currentAction.playerName}`);
    
    if (shouldAddNextAction(currentAction.action)) {
      const nextActionStep = createNextActionStep(currentAction, formData.players);
      
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
    console.log('🚀 DEBUGGING updateAction called with:', {
      street,
      index,
      action,
      betAmount,
      formDataExists: !!formData,
      streetExists: !!formData[street],
      streetActionsLength: formData[street]?.length || 0,
      allStreetActions: formData[street]
    });
    
    setFormData((prev: ShareHandFormData) => {
      console.log('🔍 DEBUGGING updateAction setFormData callback:', {
        prevExists: !!prev,
        prevStreet: prev[street],
        prevStreetLength: prev[street]?.length || 0,
        targetIndex: index
      });

      const updatedActions = [...prev[street]];
      
      // If no action exists at this index, this means we need to initialize actions first
      if (!updatedActions[index]) {
        console.log('⚠️ DEBUGGING: No action at index, initializing actions for players:', prev.players);
        
        // Initialize actions for current players
        if (prev.players && prev.players.length > 0) {
          const initializedActions = initializeActions(street, '', '', prev.players);
          
          if (initializedActions[index]) {
            const newActions = [...initializedActions];
            newActions[index] = {
              ...newActions[index],
              action,
              betAmount: betAmount || '',
              completed: true
            };
            
            console.log('✅ DEBUGGING: Initialized and updated actions:', newActions);
            
            const newFormData = { ...prev, [street]: newActions };
            
            if (shouldAddNextAction(action)) {
              setTimeout(() => {
                addNextActionStep(street, index);
              }, 50);
            }
            
            return newFormData;
          }
        }
        
        console.warn('❌ DEBUGGING: Cannot initialize actions - no players found');
        return prev;
      }
      
      const previousAction = updatedActions[index].action;
      const validBetAmount = betAmount !== undefined ? betAmount : updatedActions[index].betAmount || '';
      
      console.log('✅ DEBUGGING: Updating action at index', index, {
        previousAction,
        newAction: action,
        validBetAmount,
        actionBefore: updatedActions[index],
        street
      });

      updatedActions[index] = {
        ...updatedActions[index],
        action,
        betAmount: validBetAmount,
        completed: true
      };
      
      console.log('✅ DEBUGGING: Action updated successfully:', {
        updatedAction: updatedActions[index],
        allUpdatedActions: updatedActions
      });

      if ((previousAction === 'bet' || previousAction === 'raise') && 
          !shouldAddNextAction(action)) {
        console.log(`Action changed from ${previousAction} to ${action}, removing subsequent actions`);
        const actionsToKeep = updatedActions.slice(0, index + 1);
        const newFormData = { ...prev, [street]: actionsToKeep };
        
        if (shouldAddNextAction(action)) {
          setTimeout(() => {
            addNextActionStep(street, index);
          }, 50);
        }
        
        return newFormData;
      }
      
      const newFormData = { ...prev, [street]: updatedActions };
      
      console.log('✅ DEBUGGING: Final form data update:', {
        newFormData,
        streetActions: newFormData[street],
        willAddNextAction: shouldAddNextAction(action)
      });
      
      if (shouldAddNextAction(action)) {
        setTimeout(() => {
          addNextActionStep(street, index);
        }, 50);
      }
      
      return newFormData;
    });
  };

  const handleBetSizeSelect = (street: StreetType, index: number, amount: string) => {
    console.log(`Bet size selected: ${amount} for index ${index} on ${street}`);
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.warn('Invalid bet amount selected:', amount);
      return;
    }
    
    setFormData((prev: ShareHandFormData) => {
      const updatedActions = [...prev[street]];
      const currentAction = updatedActions[index];
      
      if (!currentAction) {
        console.warn(`Cannot handle bet size select: no action exists at index ${index}`);
        return prev;
      }
      
      updatedActions[index] = {
        ...currentAction,
        betAmount: amount,
        completed: true
      };
      
      if (currentAction.action && shouldAddNextAction(currentAction.action)) {
        const nextActionStep = createNextActionStep(currentAction, prev.players);
        
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
    console.log('🚀 DEBUGGING initializeActionsForPositions called:', {
      playersExist: !!formData.players,
      playersLength: formData.players?.length || 0,
      players: formData.players
    });

    // Initialize actions whenever we have players, regardless of other form data
    if (formData.players && formData.players.length > 0) {
      console.log('✅ DEBUGGING: Initializing actions with players:', formData.players);
      
      const streets: StreetType[] = [
        'preflopActions', 'flopActions', 'turnActions', 'riverActions'
      ];
      
      const updatedFormData = { ...formData };
      let hasChanges = false;
      
      streets.forEach(street => {
        const newActions = initializeActions(street, '', '', formData.players);
        
        const currentActions = updatedFormData[street];
        const currentPlayerIds = currentActions.map(a => a.playerId);
        const newPlayerIds = newActions.map(a => a.playerId);
        
        console.log(`🔍 DEBUGGING ${street} comparison:`, {
          currentPlayerIds,
          newPlayerIds,
          lengthsDifferent: currentPlayerIds.length !== newPlayerIds.length,
          playersDifferent: !currentPlayerIds.every((id, index) => id === newPlayerIds[index])
        });
        
        if (currentPlayerIds.length !== newPlayerIds.length || 
            !currentPlayerIds.every((id, index) => id === newPlayerIds[index])) {
          console.log(`✅ DEBUGGING: Reinitializing ${street} actions with new player structure`);
          updatedFormData[street] = newActions;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        console.log('✅ DEBUGGING: Updated actions for all streets with new players:', updatedFormData);
        setFormData(updatedFormData);
      } else {
        console.log('⏭️ DEBUGGING: No changes needed to action structure');
      }
    } else {
      console.log('❌ DEBUGGING: Skipping action initialization - no players found');
    }
  };

  return {
    updateAction,
    handleBetSizeSelect,
    initializeActionsForPositions
  };
};
