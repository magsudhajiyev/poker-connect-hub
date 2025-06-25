'use client';

import { 
  Rss, Flame, Share2, User, Users, HelpCircle, X,
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
          <Rss className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Feed</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/trending')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/trending') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <Flame className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Trending</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/share-hand')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/share-hand') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <Share2 className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Share Hand</span>
        </div>
        
        <div className="my-4 border-t border-zinc-800/50"></div>
        
        <div 
          onClick={() => handleNavigation('/profile')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/profile') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <User className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Profile</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/community')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/community') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <Users className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Community</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/help')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/help') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40'
          }`}
        >
          <HelpCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Help</span>
        </div>
      </nav>
    </div>
  );
};