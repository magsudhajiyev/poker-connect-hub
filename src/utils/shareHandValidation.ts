
import { ValidationResult, StreetType, ShareHandFormData } from '@/types/shareHand';

export const validateCurrentStep = (
  currentStep: number,
  formData: ShareHandFormData
): ValidationResult => {
  // Validate game setup step (step 0)
  if (currentStep === 0) {
    if (!formData.gameFormat || formData.gameFormat.trim() === '') {
      return {
        isValid: false,
        message: 'Please select a game format before proceeding.'
      };
    }
    
    if (!formData.gameType || formData.gameType.trim() === '') {
      return {
        isValid: false,
        message: 'Please select a game type before proceeding.'
      };
    }
    
    return { isValid: true, message: '' };
  }
  
  // Validate positions step (step 1) - now silent validation for UI highlighting
  if (currentStep === 1) {
    if (!formData.heroPosition || formData.heroPosition.trim() === '' ||
        !formData.villainPosition || formData.villainPosition.trim() === '') {
      return {
        isValid: false,
        message: '' // No alert message, just UI highlighting
      };
    }
    
    return { isValid: true, message: '' };
  }
  
  // For preflop, flop, turn, river steps (steps 2-5)
  const streetName = ['preflopActions', 'flopActions', 'turnActions', 'riverActions'][currentStep - 2] as StreetType;
  const actions = formData[streetName];
  
  // Check if any bet/raise action is missing bet amount
  const incompleteBetAction = actions.find(action => 
    (action.action === 'bet' || action.action === 'raise') && 
    (!action.betAmount || action.betAmount.trim() === '')
  );
  
  if (incompleteBetAction) {
    return {
      isValid: false,
      message: `Please specify the bet size for ${incompleteBetAction.playerName}'s ${incompleteBetAction.action} before proceeding.`
    };
  }
  
  return { isValid: true, message: '' };
};
