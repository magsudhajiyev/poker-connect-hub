'use client';

import { useState, ReactNode } from 'react';
import { useSidebar, SidebarProvider } from '@/components/sidebar/SidebarContext';
import { SidebarNavigationNext } from '@/components/sidebar/SidebarNavigationNext';
import { SidebarStatsOverviewNext } from '@/components/sidebar/SidebarStatsOverviewNext';

// Re-export for convenience
export { useSidebar, SidebarProvider };

export const GlobalSidebar = () => {
  const { isCollapsed } = useSidebar();

  return (
    <aside className={`hidden lg:block fixed left-0 top-0 h-screen z-40 bg-slate-950 border-r border-zinc-700/20 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <SidebarNavigationNext />
      <SidebarStatsOverviewNext />
    </aside>
  );
};