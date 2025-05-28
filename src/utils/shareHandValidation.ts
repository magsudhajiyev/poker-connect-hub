
import { ValidationResult, StreetType, ShareHandFormData } from '@/types/shareHand';

export const validateCurrentStep = (
  currentStep: number,
  formData: ShareHandFormData
): ValidationResult => {
  if (currentStep === 0) return { isValid: true, message: '' };
  
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
