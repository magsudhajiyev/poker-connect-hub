'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';

interface GameSetupStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showValidationErrors?: boolean;
  _showValidationErrors?: boolean;
}

const GameSetupStep = ({ formData, setFormData }: GameSetupStepProps) => {
  const getStackSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Stack Size ($)' : 'Stack Size (BB)';
  };

  const getStackSizePlaceholder = () => {
    return formData.gameFormat === 'cash' ? '200' : '100';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-slate-200 mb-3">Setup</h3>

      {/* Game Format Selection with Toggle Buttons */}
      <div>
        <Label className="text-slate-300 mb-2 block text-sm">Game Format</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={formData.gameFormat === 'mtt' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, gameFormat: 'mtt' })}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'mtt'
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900'
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
            }`}
          >
            {formData.gameFormat === 'mtt' && <Check className="absolute top-1 right-1 w-3 h-3" />}
            <span className="font-black text-sm">MTT</span>
            <span className="text-xs font-bold">Multi-Table Tournament</span>
          </Button>

          <Button
            variant={formData.gameFormat === 'cash' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, gameFormat: 'cash' })}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'cash'
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900'
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
            }`}
          >
            {formData.gameFormat === 'cash' && <Check className="absolute top-1 right-1 w-3 h-3" />}
            <span className="font-black text-sm">Cash Game</span>
            <span className="text-xs font-bold">Real Money Cash</span>
          </Button>
        </div>
      </div>

      {/* Game Type Selection with Toggle Buttons */}
      <div>
        <Label className="text-slate-300 mb-2 block text-sm">Game Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={formData.gameType === 'nlhe' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, gameType: 'nlhe' })}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameType === 'nlhe'
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900'
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
            }`}
          >
            {formData.gameType === 'nlhe' && <Check className="absolute top-1 right-1 w-3 h-3" />}
            <span className="font-black text-sm">NLHE</span>
            <span className="text-xs font-bold">No Limit Hold'em</span>
          </Button>

          <Button
            variant={formData.gameType === 'plo' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, gameType: 'plo' })}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameType === 'plo'
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900'
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
            }`}
          >
            {formData.gameType === 'plo' && <Check className="absolute top-1 right-1 w-3 h-3" />}
            <span className="font-black text-sm">PLO</span>
            <span className="text-xs font-bold">Pot Limit Omaha</span>
          </Button>
        </div>
      </div>

      {/* Blind Levels Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-200">Blind Levels</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="small-blind" className="text-slate-300 text-sm">
              Small Blind
            </Label>
            <Input
              id="small-blind"
              value={formData.smallBlind}
              onChange={(e) => setFormData({ ...formData, smallBlind: e.target.value })}
              placeholder={formData.gameFormat === 'cash' ? '1' : '25'}
              className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
            />
          </div>

          <div>
            <Label htmlFor="big-blind" className="text-slate-300 text-sm">
              Big Blind
            </Label>
            <Input
              id="big-blind"
              value={formData.bigBlind}
              onChange={(e) => setFormData({ ...formData, bigBlind: e.target.value })}
              placeholder={formData.gameFormat === 'cash' ? '2' : '50'}
              className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
            />
          </div>
        </div>

        {/* Ante Checkbox - Only show for MTT */}
        {formData.gameFormat === 'mtt' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ante"
              checked={formData.ante || false}
              onCheckedChange={(checked) => setFormData({ ...formData, ante: checked })}
              className="border-slate-700/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <Label htmlFor="ante" className="text-slate-300 text-sm">
              Big Blind Ante
            </Label>
          </div>
        )}
      </div>

      {/* Stack Size - Default for all players */}
      <div>
        <Label htmlFor="stack-size" className="text-slate-300 text-sm">
          {getStackSizeLabel()}
        </Label>
        <Input
          id="stack-size"
          value={formData.stackSize}
          onChange={(e) => setFormData({ ...formData, stackSize: e.target.value })}
          placeholder={getStackSizePlaceholder()}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
        />
        <p className="text-xs text-slate-400 mt-1">
          Default stack size for all players (can be adjusted individually in Positions step)
        </p>
      </div>
    </div>
  );
};

export default GameSetupStep;
