import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Hash, Zap } from 'lucide-react';
import { useDisplayMode } from '@/contexts/DisplayModeContext';
import { DisplayMode } from '@/hooks/useDisplayValues';

interface DisplayModeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'badge' | 'compact';
  showLabels?: boolean;
  disabled?: boolean;
}

export const DisplayModeToggle = ({
  size = 'sm',
  variant = 'button',
  showLabels = true,
  disabled = false,
}: DisplayModeToggleProps) => {
  const { displayMode, toggleDisplayMode, isAutoMode } = useDisplayMode();

  const getIcon = (mode: DisplayMode | null) => {
    const iconSize = size === 'lg' ? 20 : size === 'md' ? 16 : 14;

    switch (mode) {
      case 'chips':
        return <DollarSign size={iconSize} />;
      case 'bb':
        return <Hash size={iconSize} />;
      case null:
        return <Zap size={iconSize} />;
      default:
        return <Zap size={iconSize} />;
    }
  };

  const getLabel = (mode: DisplayMode | null) => {
    switch (mode) {
      case 'chips':
        return 'Chips';
      case 'bb':
        return 'Big Blinds';
      case null:
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  const getDescription = (mode: DisplayMode | null) => {
    switch (mode) {
      case 'chips':
        return 'Display all values in chip amounts ($)';
      case 'bb':
        return 'Display all values in big blind units (BB)';
      case null:
        return 'Auto-detect based on game format ($ for cash, BB for tournaments)';
      default:
        return 'Auto-detect based on game format';
    }
  };

  if (variant === 'badge') {
    return (
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={disabled ? undefined : toggleDisplayMode}
        title={getDescription(displayMode)}
      >
        {getIcon(displayMode)}
        {showLabels && <span className="ml-1 text-xs">{getLabel(displayMode)}</span>}
      </Badge>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={disabled ? undefined : toggleDisplayMode}
        disabled={disabled}
        title={getDescription(displayMode)}
        className="h-6 w-6 p-0"
      >
        {getIcon(displayMode)}
      </Button>
    );
  }

  // Default button variant
  return (
    <Button
      variant="outline"
      size={size}
      onClick={disabled ? undefined : toggleDisplayMode}
      disabled={disabled}
      title={getDescription(displayMode)}
      className={`${isAutoMode ? 'border-blue-400/50 bg-blue-500/10' : ''} transition-colors`}
    >
      {getIcon(displayMode)}
      {showLabels && <span className="ml-2">{getLabel(displayMode)}</span>}
    </Button>
  );
};

// Utility component to show current display mode info
export const DisplayModeInfo = () => {
  const { isAutoMode } = useDisplayMode();

  return (
    <div className="text-xs text-slate-400 space-y-1">
      <div className="flex items-center gap-2">
        <span>Display Mode:</span>
        <DisplayModeToggle variant="badge" size="sm" showLabels={true} />
      </div>
      {isAutoMode && <div className="text-slate-500">Cash games show $ • Tournaments show BB</div>}
    </div>
  );
};
