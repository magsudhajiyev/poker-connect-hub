
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useShareHandContext } from './ShareHandProvider';
import ShareHandProgress from './ShareHandProgress';
import ShareHandNavigation from './ShareHandNavigation';
import GameSetupStep from './GameSetupStep';
import PokerTable from './PokerTable';
import { useState, useEffect } from 'react';

const TableShareHandForm = () => {
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
    getAllSelectedCards,
    gameStateUI
  } = useShareHandContext();

  // Reset validation errors when step changes
  useEffect(() => {
    setShowValidationErrors(false);
  }, [currentStep]);

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <GameSetupStep 
          formData={formData}
          setFormData={setFormData}
          getPositionName={getPositionName}
          getCurrencySymbol={getCurrencySymbol}
          calculatePotSize={calculatePotSize}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          getActionButtonClass={getActionButtonClass}
          handleBetSizeSelect={handleBetSizeSelect}
          getAllSelectedCards={getAllSelectedCards}
          showValidationErrors={showValidationErrors}
        />
      );
    }

    // For all other steps, show the poker table
    return (
      <div className="space-y-4">
        <PokerTable 
          formData={formData}
          setFormData={setFormData}
          currentStep={currentStep}
        />
        
        {/* Additional step-specific content */}
        {currentStep === 5 && (
          <div className="space-y-3 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-slate-200">Hand Summary</h3>
            {/* Add final summary components here */}
          </div>
        )}
      </div>
    );
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

export default TableShareHandForm;
