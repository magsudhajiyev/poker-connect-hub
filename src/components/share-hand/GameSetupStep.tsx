
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Check, AlertCircle } from 'lucide-react';
import { validateCurrentStep } from '@/utils/shareHandValidation';

interface GameSetupStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const GameSetupStep = ({ formData, setFormData }: GameSetupStepProps) => {
  // Check validation to determine if positions should be highlighted
  const validation = validateCurrentStep(0, formData);
  const shouldHighlightHero = !formData.heroPosition && !validation.isValid;
  const shouldHighlightVillain = !formData.villainPosition && !validation.isValid;

  const getStackSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Stack Size ($)' : 'Stack Size (BB)';
  };

  const getStackSizePlaceholder = () => {
    return formData.gameFormat === 'cash' ? '200' : '100';
  };

  // Get available positions for villain (exclude hero's position)
  const getAvailableVillainPositions = () => {
    const allPositions = [
      { value: 'utg', label: 'UTG' },
      { value: 'mp', label: 'Middle Position' },
      { value: 'co', label: 'Cut Off' },
      { value: 'btn', label: 'Button' },
      { value: 'sb', label: 'Small Blind' },
      { value: 'bb', label: 'Big Blind' }
    ];
    
    return allPositions.filter(pos => pos.value !== formData.heroPosition);
  };

  // Get available positions for hero (exclude villain's position)
  const getAvailableHeroPositions = () => {
    const allPositions = [
      { value: 'utg', label: 'UTG' },
      { value: 'mp', label: 'Middle Position' },
      { value: 'co', label: 'Cut Off' },
      { value: 'btn', label: 'Button' },
      { value: 'sb', label: 'Small Blind' },
      { value: 'bb', label: 'Big Blind' }
    ];
    
    return allPositions.filter(pos => pos.value !== formData.villainPosition);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-slate-200 mb-3">Game Setup</h3>
      
      {/* Game Format Selection with Toggle Buttons */}
      <div>
        <Label className="text-slate-300 mb-2 block text-sm">Game Format</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={formData.gameFormat === 'mtt' ? 'default' : 'outline'}
            onClick={() => setFormData({...formData, gameFormat: 'mtt'})}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'mtt' 
                ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 bg-slate-900/30'
            }`}
          >
            {formData.gameFormat === 'mtt' && (
              <Check className="absolute top-1 right-1 w-3 h-3" />
            )}
            <span className="font-black text-sm">MTT</span>
            <span className="text-xs font-bold">Multi-Table Tournament</span>
          </Button>
          
          <Button
            variant={formData.gameFormat === 'cash' ? 'default' : 'outline'}
            onClick={() => setFormData({...formData, gameFormat: 'cash'})}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'cash' 
                ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 bg-slate-900/30'
            }`}
          >
            {formData.gameFormat === 'cash' && (
              <Check className="absolute top-1 right-1 w-3 h-3" />
            )}
            <span className="font-black text-sm">Cash Game</span>
            <span className="text-xs font-bold">Real Money Cash</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="game-type" className="text-slate-300 text-sm">Game Type</Label>
          <Select value={formData.gameType} onValueChange={(value) => setFormData({...formData, gameType: value})}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9">
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="nlhe">No Limit Hold'em</SelectItem>
              <SelectItem value="plo">Pot Limit Omaha</SelectItem>
              <SelectItem value="stud">Seven Card Stud</SelectItem>
              <SelectItem value="mixed">Mixed Games</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="stack-size" className="text-slate-300 text-sm">{getStackSizeLabel()}</Label>
          <Input
            id="stack-size"
            value={formData.stackSize}
            onChange={(e) => setFormData({...formData, stackSize: e.target.value})}
            placeholder={getStackSizePlaceholder()}
            className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hero Position and Stack */}
        <div className="space-y-3">
          <div className={`${shouldHighlightHero ? 'ring-2 ring-red-500 rounded-md p-2' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="hero-position" className="text-slate-300 text-sm">Hero Position</Label>
              {shouldHighlightHero && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
            {shouldHighlightHero && (
              <p className="text-red-400 text-xs mb-2">Please select Hero position</p>
            )}
            <Select 
              value={formData.heroPosition} 
              onValueChange={(value) => setFormData({...formData, heroPosition: value})}
            >
              <SelectTrigger className={`bg-slate-900/50 border-slate-700/50 text-slate-200 h-9 ${
                shouldHighlightHero ? 'border-red-500' : ''
              }`}>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {getAvailableHeroPositions().map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-slate-300 mb-2 block text-sm">
              Hero Stack Size: {formData.gameFormat === 'cash' ? '$' : ''}{formData.heroStackSize[0]}{formData.gameFormat === 'mtt' ? ' BB' : ''}
            </Label>
            <Slider
              value={formData.heroStackSize}
              onValueChange={(value) => setFormData({...formData, heroStackSize: value})}
              max={formData.gameFormat === 'cash' ? 1000 : 200}
              min={1}
              step={formData.gameFormat === 'cash' ? 10 : 1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1{formData.gameFormat === 'cash' ? '0' : ''}</span>
              <span>{formData.gameFormat === 'cash' ? '1000' : '200'}{formData.gameFormat === 'mtt' ? ' BB' : ''}</span>
            </div>
          </div>
        </div>
        
        {/* Villain Position and Stack */}
        <div className="space-y-3">
          <div className={`${shouldHighlightVillain ? 'ring-2 ring-red-500 rounded-md p-2' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="villain-position" className="text-slate-300 text-sm">Villain Position</Label>
              {shouldHighlightVillain && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
            {shouldHighlightVillain && (
              <p className="text-red-400 text-xs mb-2">Please select Villain position</p>
            )}
            <Select 
              value={formData.villainPosition} 
              onValueChange={(value) => setFormData({...formData, villainPosition: value})}
            >
              <SelectTrigger className={`bg-slate-900/50 border-slate-700/50 text-slate-200 h-9 ${
                shouldHighlightVillain ? 'border-red-500' : ''
              }`}>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {getAvailableVillainPositions().map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-slate-300 mb-2 block text-sm">
              Villain Stack Size: {formData.gameFormat === 'cash' ? '$' : ''}{formData.villainStackSize[0]}{formData.gameFormat === 'mtt' ? ' BB' : ''}
            </Label>
            <Slider
              value={formData.villainStackSize}
              onValueChange={(value) => setFormData({...formData, villainStackSize: value})}
              max={formData.gameFormat === 'cash' ? 1000 : 200}
              min={1}
              step={formData.gameFormat === 'cash' ? 10 : 1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1{formData.gameFormat === 'cash' ? '0' : ''}</span>
              <span>{formData.gameFormat === 'cash' ? '1000' : '200'}{formData.gameFormat === 'mtt' ? ' BB' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetupStep;
