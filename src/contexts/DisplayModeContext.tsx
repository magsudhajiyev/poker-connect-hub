import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DisplayMode } from '@/hooks/useDisplayValues';

interface DisplayModeContextType {
  displayMode: DisplayMode | null; // null means auto-detect based on game format
  setDisplayMode: (mode: DisplayMode | null) => void;
  toggleDisplayMode: () => void;
  isAutoMode: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextType | undefined>(undefined);

interface DisplayModeProviderProps {
  children: ReactNode;
  defaultMode?: DisplayMode | null; // For testing or special cases
}

export const DisplayModeProvider = ({ children, defaultMode = null }: DisplayModeProviderProps) => {
  const [displayMode, setDisplayModeState] = useState<DisplayMode | null>(() => {
    // In the future, this could load from localStorage
    // For now, default to null (auto-detect)
    if (defaultMode !== undefined) {
return defaultMode;
}
    
    // Try to load from localStorage (future feature)
    try {
      const saved = localStorage.getItem('poker-display-mode');
      if (saved === 'chips' || saved === 'bb') {
return saved;
}
      if (saved === 'auto' || saved === null) {
return null;
}
    } catch (e) {
      // localStorage not available or error
    }
    
    return null; // Auto-detect based on game format
  });

  const setDisplayMode = useCallback((mode: DisplayMode | null) => {
    setDisplayModeState(mode);
    
    // Save to localStorage for persistence (future feature)
    try {
      if (mode === null) {
        localStorage.setItem('poker-display-mode', 'auto');
      } else {
        localStorage.setItem('poker-display-mode', mode);
      }
    } catch (e) {
      // localStorage not available or error
    }
  }, []);

  const toggleDisplayMode = useCallback(() => {
    if (displayMode === null) {
      // If in auto mode, switch to chips
      setDisplayMode('chips');
    } else if (displayMode === 'chips') {
      // If in chips mode, switch to BB
      setDisplayMode('bb');
    } else {
      // If in BB mode, switch back to auto
      setDisplayMode(null);
    }
  }, [displayMode, setDisplayMode]);

  const isAutoMode = displayMode === null;

  const value: DisplayModeContextType = {
    displayMode,
    setDisplayMode,
    toggleDisplayMode,
    isAutoMode,
  };

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
};

export const useDisplayMode = (): DisplayModeContextType => {
  const context = useContext(DisplayModeContext);
  if (context === undefined) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider');
  }
  return context;
};

// Hook that combines display mode context with display values
export const useDisplayModeWithValues = (formData: any) => {
  const displayModeContext = useDisplayMode();
  
  // This hook can be used in components that need both display mode control
  // and display value calculations
  return {
    ...displayModeContext,
    // Future: could add computed values here
    effectiveMode: displayModeContext.displayMode || (formData?.gameFormat === 'cash' ? 'chips' : 'bb'),
  };
};