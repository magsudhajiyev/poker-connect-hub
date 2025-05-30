
import { 
  Rss, Flame, Share2, User, Users, HelpCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from './SidebarContext';

export const SidebarNavigation = () => {
  const { isCollapsed } = useSidebar();
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
  };

  return (
    <nav className="px-3 space-y-1 pt-6">
      <div 
        onClick={() => handleNavigation('/feed')}
        className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
          isActive('/feed') 
            ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
            : isCollapsed 
              ? 'text-zinc-400 hover:bg-zinc-800/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <Rss className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? '' : 'mr-3'
        } ${isActive('/feed') ? 'text-emerald-500' : ''}`} />
        <span className={`transition-all duration-300 text-sm ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>Feed</span>
      </div>
      
      <div className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
        isCollapsed 
          ? 'text-zinc-400 hover:bg-zinc-800/40 justify-center px-2'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
      }`}>
        <Flame className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'}`} />
        <span className={`transition-all duration-300 text-sm ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>Trending Hands</span>
      </div>
      
      <div 
        onClick={() => handleNavigation('/share-hand')}
        className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
          isActive('/share-hand') 
            ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
            : isCollapsed 
              ? 'text-zinc-400 hover:bg-zinc-800/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <Share2 className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? '' : 'mr-3'
        } ${isActive('/share-hand') ? 'text-emerald-500' : ''}`} />
        <span className={`transition-all duration-300 text-sm ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>Share Hand</span>
      </div>
      
      <div 
        onClick={() => handleNavigation('/profile')}
        className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
          isActive('/profile') 
            ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
            : isCollapsed 
              ? 'text-zinc-400 hover:bg-zinc-800/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <User className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? '' : 'mr-3'
        } ${isActive('/profile') ? 'text-emerald-500' : ''}`} />
        <span className={`transition-all duration-300 text-sm ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>My Profile</span>
      </div>
      
      <div className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
        isCollapsed 
          ? 'text-zinc-400 hover:bg-zinc-800/40 justify-center px-2'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
      }`}>
        <Users className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'}`} />
        <span className={`transition-all duration-300 text-sm ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>Following</span>
      </div>
      
      <div className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
        isCollapsed 
          ? 'text-zinc-400 hover:bg-zinc-800/40 justify-center px-2'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
      }`}>
        <HelpCircle className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'}`} />
        <span className={`transition-all duration-300 text-sm ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>Help & Support</span>
      </div>
    </nav>
  );
};
