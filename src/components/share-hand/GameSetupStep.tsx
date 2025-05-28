
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Check } from 'lucide-react';

interface GameSetupStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const GameSetupStep = ({ formData, setFormData }: GameSetupStepProps) => {
  const getStackSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Stack Size ($)' : 'Stack Size (BB)';
  };

  const getStackSizePlaceholder = () => {
    return formData.gameFormat === 'cash' ? '200' : '100';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-200 mb-4">Game Setup</h3>
      
      {/* Game Format Selection with Toggle Buttons */}
      <div>
        <Label className="text-slate-300 mb-3 block">Game Format</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={formData.gameFormat === 'mtt' ? 'default' : 'outline'}
            onClick={() => setFormData({...formData, gameFormat: 'mtt'})}
            className={`h-16 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'mtt' 
                ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {formData.gameFormat === 'mtt' && (
              <Check className="absolute top-2 right-2 w-4 h-4" />
            )}
            <span className="font-medium">MTT</span>
            <span className="text-xs opacity-75">Multi-Table Tournament</span>
          </Button>
          
          <Button
            variant={formData.gameFormat === 'cash' ? 'default' : 'outline'}
            onClick={() => setFormData({...formData, gameFormat: 'cash'})}
            className={`h-16 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'cash' 
                ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {formData.gameFormat === 'cash' && (
              <Check className="absolute top-2 right-2 w-4 h-4" />
            )}
            <span className="font-medium">Cash Game</span>
            <span className="text-xs opacity-75">Real Money Cash</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game-type" className="text-slate-300">Game Type</Label>
          <Select value={formData.gameType} onValueChange={(value) => setFormData({...formData, gameType: value})}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
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
          <Label htmlFor="stack-size" className="text-slate-300">{getStackSizeLabel()}</Label>
          <Input
            id="stack-size"
            value={formData.stackSize}
            onChange={(e) => setFormData({...formData, stackSize: e.target.value})}
            placeholder={getStackSizePlaceholder()}
            className="bg-slate-900/50 border-slate-700/50 text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hero Position and Stack */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="hero-position" className="text-slate-300">Hero Position</Label>
            <Select value={formData.heroPosition} onValueChange={(value) => setFormData({...formData, heroPosition: value})}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="utg">UTG</SelectItem>
                <SelectItem value="mp">Middle Position</SelectItem>
                <SelectItem value="co">Cut Off</SelectItem>
                <SelectItem value="btn">Button</SelectItem>
                <SelectItem value="sb">Small Blind</SelectItem>
                <SelectItem value="bb">Big Blind</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-slate-300 mb-3 block">
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="villain-position" className="text-slate-300">Villain Position</Label>
            <Select value={formData.villainPosition} onValueChange={(value) => setFormData({...formData, villainPosition: value})}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="utg">UTG</SelectItem>
                <SelectItem value="mp">Middle Position</SelectItem>
                <SelectItem value="co">Cut Off</SelectItem>
                <SelectItem value="btn">Button</SelectItem>
                <SelectItem value="sb">Small Blind</SelectItem>
                <SelectItem value="bb">Big Blind</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-slate-300 mb-3 block">
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
