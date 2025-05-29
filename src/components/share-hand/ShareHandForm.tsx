
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useShareHandContext } from './ShareHandProvider';
import ShareHandProgress from './ShareHandProgress';
import ShareHandNavigation from './ShareHandNavigation';
import GameSetupStep from './GameSetupStep';
import PreflopStep from './PreflopStep';
import FlopStep from './FlopStep';
import TurnStep from './TurnStep';
import RiverStep from './RiverStep';
import { useState } from 'react';

const ShareHandForm = () => {
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  const {
    currentStep,
    formData,
    setFormData,
    tags,
    addTag,
    removeTag,
    getPositionName,
    getCurrencySymbol,
    calculatePotSize,
    getAvailableActions,
    updateAction,
    getActionButtonClass,
    handleBetSizeSelect,
    getAllSelectedCards
  } = useShareHandContext();

  const renderStepContent = () => {
    const showPot = currentStep > 0;

    const commonProps = {
      formData,
      setFormData,
      getPositionName,
      getCurrencySymbol,
      calculatePotSize,
      getAvailableActions,
      updateAction,
      getActionButtonClass,
      handleBetSizeSelect,
      getAllSelectedCards
    };

    switch (currentStep) {
      case 0:
        return <GameSetupStep {...commonProps} showValidationErrors={showValidationErrors} />;
      case 1:
        return <PreflopStep {...commonProps} showPot={showPot} />;
      case 2:
        return <FlopStep {...commonProps} showPot={showPot} />;
      case 3:
        return <TurnStep {...commonProps} showPot={showPot} />;
      case 4:
        return <RiverStep {...commonProps} showPot={showPot} tags={tags} addTag={addTag} removeTag={removeTag} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <Card className="bg-slate-800/40 border-slate-700/30 w-full">
        <CardHeader className="pb-2">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-200">Hand Details</h2>
            <ShareHandProgress />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 px-3 overflow-x-hidden">
          <div className="w-full overflow-x-hidden">
            {renderStepContent()}
          </div>
          <ShareHandNavigation onValidationError={() => setShowValidationErrors(true)} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareHandForm;
