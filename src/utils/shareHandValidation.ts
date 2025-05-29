
import { ValidationResult, StreetType, ShareHandFormData } from '@/types/shareHand';

export const validateCurrentStep = (
  currentStep: number,
  formData: ShareHandFormData
): ValidationResult => {
  // Validate game setup step (step 0)
  if (currentStep === 0) {
    if (!formData.heroPosition || formData.heroPosition.trim() === '') {
      return {
        isValid: false,
        message: 'Please select Hero position before proceeding.'
      };
    }
    
    if (!formData.villainPosition || formData.villainPosition.trim() === '') {
      return {
        isValid: false,
        message: 'Please select Villain position before proceeding.'
      };
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
