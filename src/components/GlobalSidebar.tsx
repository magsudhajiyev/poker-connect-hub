
import { useSidebar, SidebarProvider } from './sidebar/SidebarContext';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { SidebarStatsOverview } from './sidebar/SidebarStatsOverview';

export { SidebarProvider, useSidebar };

export const GlobalSidebar = () => {
  const { isCollapsed } = useSidebar();

  return (
    <aside className={`hidden lg:block fixed left-0 top-0 h-screen z-40 bg-slate-950 border-r border-zinc-700/20 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <SidebarNavigation />
      <SidebarStatsOverview />
    </aside>
  );
};
