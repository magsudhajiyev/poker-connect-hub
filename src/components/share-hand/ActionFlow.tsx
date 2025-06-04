
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import BetSizingButtons from '@/components/BetSizingButtons';
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { GameState } from '@/utils/gameState';
import { processAction } from '@/utils/shareHandActions';
import { useShareHandContext } from './ShareHandProvider';

interface ActionFlowProps {
  street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions';
  formData: any;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  calculatePotSize: () => number;
  getAvailableActions: (street: string, index: number, allActions: any[]) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  gameState?: GameState | null;
}

const ActionFlow = ({ 
  street, 
  formData, 
  getPositionName, 
  getCurrencySymbol, 
  calculatePotSize, 
  getAvailableActions, 
  updateAction, 
  getActionButtonClass, 
  handleBetSizeSelect,
  gameState 
}: ActionFlowProps) => {
  const actions = formData[street];
  const potSize = calculatePotSize();
  const currentStackSize = formData.heroStackSize[0];
  
  // Use game state UI updates
  const { isPlayerActive, isActionAvailable } = useGameStateUI(gameState);
  const { gameStateUI } = useShareHandContext();

  const getBetSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Bet Size ($)' : 'Bet Size (BB)';
  };

  const handleActionClick = (actionStep: any, index: number, action: string) => {
    // Validate action step and position
    if (!actionStep || !actionStep.position) {
      console.warn('Invalid action step or missing position:', actionStep);
      updateAction(street, index, action);
      return;
    }

    // If we have a game state and this is the current player, process the action through game state
    if (gameState && isPlayerActive(actionStep.position)) {
      let amount = 0;
      
      if (action === 'bet' || action === 'raise') {
        const betInput = actionStep.betAmount || '';
        amount = parseFloat(betInput);
        
        if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid bet amount');
          return;
        }
      } else if (action === 'call') {
        amount = gameState.currentBet || 0;
      }
      
      try {
        // Process action through game state
        const newState = processAction(
          gameState,
          actionStep.position,
          action,
          amount
        );
        
        // Update the game state in the UI hook
        if (gameStateUI.updateGameState) {
          gameStateUI.updateGameState(newState);
        }
      } catch (error) {
        console.error('Error processing action through game state:', error);
      }
    }
    
    // Also update the form data action (existing functionality)
    updateAction(street, index, action);
  };

  const handleBetInputChange = (actionStep: any, index: number, value: string) => {
    // Validate input is numeric
    const numericValue = parseFloat(value);
    if (value !== '' && (isNaN(numericValue) || numericValue < 0)) {
      console.warn('Invalid bet input:', value);
      return;
    }
    
    updateAction(street, index, actionStep.action!, value);
  };

  return (
    <div className="space-y-2 w-full overflow-x-hidden">
      <h4 className="text-sm font-medium text-slate-300">Action Flow</h4>
      {actions.map((actionStep: any, index: number) => {
        const availableActions = getAvailableActions(street, index, actions);
        
        // Get position from action step or find the player in formData.players
        let playerPosition = actionStep.position;
        if (!playerPosition && formData.players) {
          const player = formData.players.find((p: any) => p.id === actionStep.playerId);
          playerPosition = player?.position || '';
        }
        
        // Check if this player is currently active
        const isCurrentPlayer = isPlayerActive(playerPosition);
        
        return (
          <div 
            key={`${actionStep.playerId}-${index}`} 
            className={`border rounded-lg p-2 w-full overflow-x-hidden transition-colors ${
              isCurrentPlayer 
                ? 'border-emerald-500/50 bg-emerald-950/20' 
                : 'border-slate-700/50'
            }`}
            data-position={playerPosition}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium text-xs truncate ${
                actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'
              } ${isCurrentPlayer ? 'font-bold' : ''}`}>
                {actionStep.playerName} ({getPositionName(playerPosition)})
                {isCurrentPlayer && <span className="ml-1 text-emerald-400">●</span>}
              </span>
              {actionStep.completed && (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              )}
            </div>
            
            <div className="space-y-2 w-full">
              <div className="w-full">
                <Label className="text-slate-300 text-xs">Action</Label>
                <div className="grid grid-cols-2 gap-1 mt-1 w-full">
                  {availableActions.map((action) => {
                    const isAvailable = isCurrentPlayer ? isActionAvailable(action) : true;
                    return (
                      <Button
                        key={action}
                        size="sm"
                        onClick={() => handleActionClick(actionStep, index, action)}
                        disabled={!isAvailable && isCurrentPlayer}
                        className={`${getActionButtonClass(action, actionStep.action === action)} text-xs h-7 truncate transition-opacity action-button ${action} ${
                          !isAvailable && isCurrentPlayer ? 'opacity-50' : ''
                        }`}
                        style={{ 
                          display: isCurrentPlayer && !isAvailable ? 'none' : 'block' 
                        }}
                      >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {(actionStep.action === 'bet' || actionStep.action === 'raise') && (
                <div className="space-y-2 w-full">
                  <div className="w-full overflow-x-hidden">
                    <Label className="text-slate-300 text-xs">Quick Bet Sizes</Label>
                    <div className="mt-1">
                      <BetSizingButtons
                        potSize={potSize}
                        stackSize={currentStackSize}
                        onBetSizeSelect={(amount) => handleBetSizeSelect(street, index, amount)}
                        gameFormat={formData.gameFormat}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <Label className="text-slate-300 text-xs">{getBetSizeLabel()}</Label>
                    <Input
                      value={actionStep.betAmount || ''}
                      onChange={(e) => handleBetInputChange(actionStep, index, e.target.value)}
                      placeholder="2.5"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-xs h-8 mt-1 w-full bet-size-input"
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              )}

              {actionStep.action === 'call' && actionStep.betAmount && (
                <div className="w-full">
                  <Label className="text-slate-300 text-xs">Call Amount</Label>
                  <div className="text-emerald-400 font-medium text-xs">
                    {getCurrencySymbol()}{actionStep.betAmount}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActionFlow;
