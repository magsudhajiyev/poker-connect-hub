'use client';

import { Home, Activity, TrendingUp, Trophy, Clock, Settings,
  Rss, Flame, Share2, User, Users, HelpCircle,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';

export const SidebarNavigationNext = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  
  const navigationItems = [
    { name: 'Feed', icon: Home, path: '/feed' },
    { name: 'Share Hand', icon: Share2, path: '/share-hand' },
    { name: 'My Hands', icon: Activity, path: '/my-hands' },
    { name: 'Trending', icon: TrendingUp, path: '/trending' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const bottomItems = [
    { name: 'Help', icon: HelpCircle, path: '/help' },
  ];

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-slate-800 text-lg font-bold">♦</span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              PokerConnect
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-violet-500/20 text-white border border-emerald-500/30' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-400' : ''}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-zinc-800/50 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-violet-500/20 text-white border border-emerald-500/30' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-400' : ''}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};