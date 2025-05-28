
import { useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Rss, Flame, Share2, User, Users, HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const GlobalSidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
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
    <aside className={`hidden lg:block fixed h-[calc(100vh-4rem)] overflow-hidden border-r border-zinc-700/20 pt-6 transition-all duration-300 ${
      isCollapsed ? 'w-12 sm:w-16' : 'w-48 sm:w-56 md:w-64'
    }`}>
      {/* Toggle Button */}
      <div className="absolute top-4 right-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />}
        </Button>
      </div>

      <nav className="px-2 sm:px-4 space-y-1">
        <div 
          onClick={() => handleNavigation('/feed')}
          className={`flex items-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/feed') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : isCollapsed 
                ? 'text-zinc-400 hover:bg-zinc-800/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Rss className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${
            isCollapsed ? '' : 'mr-2 sm:mr-3'
          } ${isActive('/feed') ? 'text-emerald-500' : ''}`} />
          <span className={`transition-all duration-300 text-xs sm:text-sm ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>Feed</span>
        </div>
        
        <div className={`flex items-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
          isCollapsed 
            ? 'text-zinc-400 hover:bg-zinc-800/40 justify-center'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
        }`}>
          <Flame className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-2 sm:mr-3'}`} />
          <span className={`transition-all duration-300 text-xs sm:text-sm ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>Trending Hands</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/share-hand')}
          className={`flex items-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/share-hand') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : isCollapsed 
                ? 'text-zinc-400 hover:bg-zinc-800/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Share2 className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${
            isCollapsed ? '' : 'mr-2 sm:mr-3'
          } ${isActive('/share-hand') ? 'text-emerald-500' : ''}`} />
          <span className={`transition-all duration-300 text-xs sm:text-sm ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>Share Hand</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/profile')}
          className={`flex items-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
            isActive('/profile') 
              ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
              : isCollapsed 
                ? 'text-zinc-400 hover:bg-zinc-800/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <User className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${
            isCollapsed ? '' : 'mr-2 sm:mr-3'
          } ${isActive('/profile') ? 'text-emerald-500' : ''}`} />
          <span className={`transition-all duration-300 text-xs sm:text-sm ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>My Profile</span>
        </div>
        
        <div className={`flex items-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
          isCollapsed 
            ? 'text-zinc-400 hover:bg-zinc-800/40 justify-center'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
        }`}>
          <Users className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-2 sm:mr-3'}`} />
          <span className={`transition-all duration-300 text-xs sm:text-sm ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>Following</span>
        </div>
        
        <div className={`flex items-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
          isCollapsed 
            ? 'text-zinc-400 hover:bg-zinc-800/40 justify-center'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
        }`}>
          <HelpCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-2 sm:mr-3'}`} />
          <span className={`transition-all duration-300 text-xs sm:text-sm ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>Help & Support</span>
        </div>
      </nav>
      
      {!isCollapsed && (
        <div className="mt-4 sm:mt-8 px-2 sm:px-4 transition-all duration-300">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 sm:px-4 mb-2">My Stats Overview</h3>
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-xs sm:text-sm">Hands Played</span>
              <span className="text-emerald-500 font-medium text-xs sm:text-sm">1,280</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-xs sm:text-sm">Win Rate</span>
              <span className="text-emerald-500 font-medium text-xs sm:text-sm">+5.2 BB/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-xs sm:text-sm">Top Hand</span>
              <span className="text-zinc-200 font-medium text-xs sm:text-sm">A♠A♥</span>
            </div>
            <Button className="w-full mt-2 py-1.5 sm:py-2 bg-zinc-800/40 rounded-xl border border-zinc-700/30 text-zinc-200 text-xs sm:text-sm hover:bg-zinc-800/60">
              View Full Stats
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};
