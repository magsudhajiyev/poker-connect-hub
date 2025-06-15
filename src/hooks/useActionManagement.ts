
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
      playersCount: formData.players?.length || 0
    });
    
    setFormData((prev: ShareHandFormData) => {
      const currentActions = [...prev[street]];
      
      // If no actions exist at all, initialize them first
      if (currentActions.length === 0 && prev.players && prev.players.length > 0) {
        console.log('✅ DEBUGGING: Initializing actions for empty street');
        const initializedActions = initializeActions(street, '', '', prev.players);
        
        if (initializedActions.length > 0 && initializedActions[index]) {
          const newActions = [...initializedActions];
          newActions[index] = {
            ...newActions[index],
            action,
            betAmount: betAmount || '',
            completed: true
          };
          
          console.log('✅ DEBUGGING: Initialized and updated actions:', newActions);
          return { ...prev, [street]: newActions };
        }
      }
      
      // If action doesn't exist at this index but we have some actions, extend the array
      if (!currentActions[index]) {
        console.log('⚠️ DEBUGGING: Action index out of bounds, cannot update');
        return prev;
      }
      
      const previousAction = currentActions[index].action;
      const validBetAmount = betAmount !== undefined ? betAmount : currentActions[index].betAmount || '';
      
      console.log('✅ DEBUGGING: Updating existing action at index', index, {
        previousAction,
        newAction: action,
        validBetAmount,
        playerName: currentActions[index].playerName
      });

      // Update the action
      currentActions[index] = {
        ...currentActions[index],
        action,
        betAmount: validBetAmount,
        completed: true
      };
      
      // Mark the next player as the one to act by making their action incomplete
      const nextActionIndex = index + 1;
      if (currentActions[nextActionIndex]) {
        currentActions[nextActionIndex] = {
          ...currentActions[nextActionIndex],
          completed: false  // This makes them the next to act
        };
        console.log('✅ DEBUGGING: Set next player to act:', currentActions[nextActionIndex].playerName);
      } else if (shouldAddNextAction(action)) {
        // Create next action step if it doesn't exist
        const nextActionStep = createNextActionStep(currentActions[index], prev.players);
        currentActions.push(nextActionStep);
        console.log('✅ DEBUGGING: Added next action step:', nextActionStep.playerName);
      }
      
      console.log('✅ DEBUGGING: Final updated actions:', currentActions.map(a => ({
        name: a.playerName,
        action: a.action,
        completed: a.completed
      })));
      
      return { ...prev, [street]: currentActions };
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
      
      // Mark next player to act
      const nextActionIndex = index + 1;
      if (updatedActions[nextActionIndex]) {
        updatedActions[nextActionIndex] = {
          ...updatedActions[nextActionIndex],
          completed: false
        };
      } else if (currentAction.action && shouldAddNextAction(currentAction.action)) {
        const nextActionStep = createNextActionStep(currentAction, prev.players);
        updatedActions.push(nextActionStep);
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
