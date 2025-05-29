
import { 
  Rss, Flame, Share2, User, Users, HelpCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const MobileSidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/feed' && location.pathname === '/feed') return true;
    if (path === '/profile' && location.pathname === '/profile') return true;
    if (path === '/share-hand' && location.pathname === '/share-hand') return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="h-full bg-slate-950 text-slate-200">
      <nav className="px-3 space-y-1 pt-6">
        <div 
          onClick={() => handleNavigation('/feed')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/feed') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Rss className={`w-5 h-5 mr-3 ${isActive('/feed') ? 'text-emerald-500' : ''}`} />
          <span className="text-sm">Feed</span>
        </div>
        
        <div className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40">
          <Flame className="w-5 h-5 mr-3" />
          <span className="text-sm">Trending Hands</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/share-hand')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/share-hand') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Share2 className={`w-5 h-5 mr-3 ${isActive('/share-hand') ? 'text-emerald-500' : ''}`} />
          <span className="text-sm">Share Hand</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/profile')}
          className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/profile') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <User className={`w-5 h-5 mr-3 ${isActive('/profile') ? 'text-emerald-500' : ''}`} />
          <span className="text-sm">My Profile</span>
        </div>
        
        <div className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40">
          <Users className="w-5 h-5 mr-3" />
          <span className="text-sm">Following</span>
        </div>
        
        <div className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40">
          <HelpCircle className="w-5 h-5 mr-3" />
          <span className="text-sm">Help & Support</span>
        </div>
      </nav>
    </div>
  );
};
