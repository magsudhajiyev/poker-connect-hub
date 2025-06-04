
import { ValidationResult, StreetType, ShareHandFormData } from '@/types/shareHand';

export interface DetailedValidationResult extends ValidationResult {
  invalidPlayerId?: string;
}

export const validateCurrentStep = (
  currentStep: number,
  formData: ShareHandFormData
): DetailedValidationResult => {
  // Validate game setup step (step 0)
  if (currentStep === 0) {
    // Check if players exist and validate their positions
    if (formData.players && formData.players.length > 0) {
      for (const player of formData.players) {
        if (!player.position || player.position.trim() === '') {
          return {
            isValid: false,
            message: `Please select position for ${player.name}`,
            invalidPlayerId: player.id
          };
        }
      }
    } else {
      // Fallback to legacy validation for backwards compatibility
      if (!formData.heroPosition || formData.heroPosition.trim() === '') {
        return {
          isValid: false,
          message: 'Please select Hero position before proceeding.',
          invalidPlayerId: 'hero'
        };
      }
      
      if (!formData.villainPosition || formData.villainPosition.trim() === '') {
        return {
          isValid: false,
          message: 'Please select Villain position before proceeding.',
          invalidPlayerId: 'villain'
        };
      }
    }
    
    return { isValid: true, message: '' };
  }
  
  const streetName = ['preflopActions', 'flopActions', 'turnActions', 'riverActions'][currentStep - 1] as StreetType;
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
