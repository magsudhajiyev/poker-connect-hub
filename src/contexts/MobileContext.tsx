import React, { createContext, useContext, useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

// Create a context to share mobile state across components
const MobileContext = createContext<boolean>(false);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Initial state based on current window width
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  useEffect(() => {
    // Create media query
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return <MobileContext.Provider value={isMobile}>{children}</MobileContext.Provider>;
}

// Optimized hook that uses context instead of individual event listeners
export function useIsMobileOptimized() {
  return useContext(MobileContext);
}
