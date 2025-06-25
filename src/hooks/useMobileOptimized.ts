import { useIsMobileOptimized } from '@/contexts/MobileContext';

// For backward compatibility, export a wrapper for the old hook name
export function useIsMobile() {
  console.warn('useIsMobile is deprecated. Please use useIsMobileOptimized with MobileProvider');
  return useIsMobileOptimized();
}

export { useIsMobileOptimized } from '@/contexts/MobileContext';
