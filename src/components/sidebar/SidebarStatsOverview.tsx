'use client';

import { TrendingUp, Trophy, Clock } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export const SidebarStatsOverview = () => {
  const { isCollapsed } = useSidebar();

  if (isCollapsed) {
    return null;
  }

  const stats = [
    { label: 'Win Rate', value: '68%', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Hands Played', value: '1,234', icon: Trophy, color: 'text-violet-400' },
    { label: 'Avg. Session', value: '2.5h', icon: Clock, color: 'text-blue-400' },
  ];

  return (
    <div className="p-4 border-t border-zinc-800/50">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Quick Stats
      </h3>
      <div className="space-y-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-zinc-400">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold text-zinc-200">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
