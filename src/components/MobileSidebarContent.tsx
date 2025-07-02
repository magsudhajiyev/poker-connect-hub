'use client';

import { Rss, Flame, Share2, User, Users, HelpCircle, X, LogOut, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MobileSidebarContentProps {
  onNavigate?: () => void;
  showSettings?: boolean;
}

export const MobileSidebarContent = ({
  onNavigate,
  showSettings = false,
}: MobileSidebarContentProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  const navigationItems = [
    { path: '/feed', icon: Rss, label: 'Feed' },
    { path: '/trending', icon: Flame, label: 'Trending' },
    { path: '/share-hand', icon: Share2, label: 'Share Hand' },
  ];

  const secondaryItems = [
    { path: '/profile', icon: User, label: 'Profile' },
    ...(showSettings ? [{ path: '/settings', icon: Settings, label: 'Settings' }] : []),
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <div className="h-full bg-slate-950 text-slate-200">
      <div className="flex justify-end p-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigate}
          className="text-white hover:bg-slate-800/60"
        >
          <X className="h-5 w-5 text-white" />
        </Button>
      </div>

      <nav className="px-3 space-y-1 pt-4">
        {/* Primary Navigation */}
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <div
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                active
                  ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-300 ${
                  active ? 'text-emerald-500' : ''
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-zinc-800/50"></div>

        {/* Secondary Navigation */}
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <div
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                active
                  ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-300 ${
                  active ? 'text-emerald-500' : ''
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-zinc-800/50"></div>

        {/* Logout Button */}
        <button
          onClick={async () => {
            await logout();
            onNavigate?.();
          }}
          disabled={isLoggingOut}
          className="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </nav>
    </div>
  );
};
