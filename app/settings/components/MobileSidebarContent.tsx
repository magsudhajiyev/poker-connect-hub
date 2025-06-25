'use client';

import { 
  Rss, Flame, Share2, User, Users, HelpCircle, X, Settings as SettingsIcon,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export const MobileSidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

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
        <div 
          onClick={() => handleNavigation('/feed')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/feed') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <Rss className={`w-5 h-5 mr-3 transition-colors duration-300 ${
            isActive('/feed') ? 'text-emerald-500' : 'hover:text-zinc-300'
          }`} />
          <span className="text-sm">Feed</span>
        </div>
        
        <div className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40">
          <Flame className="w-5 h-5 mr-3 transition-colors duration-300 hover:text-zinc-300" />
          <span className="text-sm">Trending Hands</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/share-hand')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/share-hand') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <Share2 className={`w-5 h-5 mr-3 transition-colors duration-300 ${
            isActive('/share-hand') ? 'text-emerald-500' : 'hover:text-zinc-300'
          }`} />
          <span className="text-sm">Share Hand</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/profile')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/profile') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <User className={`w-5 h-5 mr-3 transition-colors duration-300 ${
            isActive('/profile') ? 'text-emerald-500' : 'hover:text-zinc-300'
          }`} />
          <span className="text-sm">My Profile</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/settings')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/settings') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <SettingsIcon className={`w-5 h-5 mr-3 transition-colors duration-300 ${
            isActive('/settings') ? 'text-emerald-500' : 'hover:text-zinc-300'
          }`} />
          <span className="text-sm">Settings</span>
        </div>
        
        <div className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40">
          <Users className="w-5 h-5 mr-3 transition-colors duration-300 hover:text-zinc-300" />
          <span className="text-sm">Following</span>
        </div>
        
        <div className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40">
          <HelpCircle className="w-5 h-5 mr-3 transition-colors duration-300 hover:text-zinc-300" />
          <span className="text-sm">Help & Support</span>
        </div>
      </nav>
    </div>
  );
};