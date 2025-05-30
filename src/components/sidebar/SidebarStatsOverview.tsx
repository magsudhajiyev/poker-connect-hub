
import { Button } from '@/components/ui/button';
import { useSidebar } from './SidebarContext';

export const SidebarStatsOverview = () => {
  const { isCollapsed } = useSidebar();

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="mt-8 px-4 transition-all duration-300">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 mb-2">My Stats Overview</h3>
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Hands Played</span>
          <span className="text-emerald-500 font-medium text-sm">1,280</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Win Rate</span>
          <span className="text-emerald-500 font-medium text-sm">+5.2 BB/100</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Top Hand</span>
          <span className="text-zinc-200 font-medium text-sm">A♠A♥</span>
        </div>
        <Button className="w-full mt-2 py-2 bg-zinc-800/40 rounded-xl border border-zinc-700/30 text-zinc-200 text-sm hover:bg-zinc-800/60">
          View Full Stats
        </Button>
      </div>
    </div>
  );
};
