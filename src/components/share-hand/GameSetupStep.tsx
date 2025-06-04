
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';

interface GameSetupStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showValidationErrors?: boolean;
}

const GameSetupStep = ({ formData, setFormData, showValidationErrors = false }: GameSetupStepProps) => {
  const getStackSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Stack Size ($)' : 'Stack Size (BB)';
  };

  const getStackSizePlaceholder = () => {
    return formData.gameFormat === 'cash' ? '200' : '100';
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
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900' 
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
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
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900' 
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
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
              <SelectItem value="nlhe" className="text-white hover:bg-slate-700 focus:bg-slate-700">No Limit Hold'em</SelectItem>
              <SelectItem value="plo" className="text-white hover:bg-slate-700 focus:bg-slate-700">Pot Limit Omaha</SelectItem>
              <SelectItem value="stud" className="text-white hover:bg-slate-700 focus:bg-slate-700">Seven Card Stud</SelectItem>
              <SelectItem value="mixed" className="text-white hover:bg-slate-700 focus:bg-slate-700">Mixed Games</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="table-size" className="text-slate-300 text-sm">Table Size</Label>
          <Select value={formData.tableSize} onValueChange={(value) => setFormData({...formData, tableSize: value})}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9">
              <SelectValue placeholder="Select table size" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="6max" className="text-white hover:bg-slate-700 focus:bg-slate-700">6-Max</SelectItem>
              <SelectItem value="9max" className="text-white hover:bg-slate-700 focus:bg-slate-700">9-Max</SelectItem>
              <SelectItem value="heads-up" className="text-white hover:bg-slate-700 focus:bg-slate-700">Heads-Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blind Levels Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-200">Blind Levels</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="small-blind" className="text-slate-300 text-sm">Small Blind</Label>
            <Input
              id="small-blind"
              value={formData.smallBlind}
              onChange={(e) => setFormData({...formData, smallBlind: e.target.value})}
              placeholder={formData.gameFormat === 'cash' ? '1' : '25'}
              className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
            />
          </div>
          
          <div>
            <Label htmlFor="big-blind" className="text-slate-300 text-sm">Big Blind</Label>
            <Input
              id="big-blind"
              value={formData.bigBlind}
              onChange={(e) => setFormData({...formData, bigBlind: e.target.value})}
              placeholder={formData.gameFormat === 'cash' ? '2' : '50'}
              className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
            />
          </div>
        </div>
      </div>

      {/* Stack Size - Default for all players */}
      <div>
        <Label htmlFor="stack-size" className="text-slate-300 text-sm">{getStackSizeLabel()}</Label>
        <Input
          id="stack-size"
          value={formData.stackSize}
          onChange={(e) => setFormData({...formData, stackSize: e.target.value})}
          placeholder={getStackSizePlaceholder()}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
        />
        <p className="text-xs text-slate-400 mt-1">Default stack size for all players (can be adjusted individually in Positions step)</p>
      </div>
    </div>
  );
};

export default GameSetupStep;
