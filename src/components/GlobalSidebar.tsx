'use client';

import React from 'react';
import { useSidebar, SidebarProvider } from '@/components/sidebar/SidebarContext';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { SidebarStatsOverview } from '@/components/sidebar/SidebarStatsOverview';

// Re-export for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useSidebar, SidebarProvider };

interface GlobalSidebarProps {
  isMobile?: boolean;
}

export const GlobalSidebar: React.FC<GlobalSidebarProps> = ({ isMobile = false }) => {
  const { isCollapsed } = useSidebar();

  if (isMobile) {
    // Mobile version - no collapse functionality, full width
    return (
      <div className="h-full bg-slate-950">
        <SidebarNavigation />
        <SidebarStatsOverview />
      </div>
    );
  }

  // Desktop version
  return (
    <aside
      className={`hidden lg:block fixed left-0 top-0 h-screen z-40 bg-slate-950 border-r border-zinc-700/20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <SidebarNavigation />
      <SidebarStatsOverview />
    </aside>
  );
};
