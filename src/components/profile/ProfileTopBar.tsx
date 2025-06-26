import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Bell, User, Settings, LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/GlobalSidebar';
import { useAuth } from '@/contexts/AuthContext';
export const ProfileTopBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { logout, user, isLoggingOut } = useAuth();
  const handleProfileClick = () => {
    router.push('/profile');
  };
  const handleSettingsClick = () => {
    router.push('/settings');
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const handleHomeClick = () => {
    router.push('/feed');
  };
  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/20 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Hamburger Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex text-slate-400 hover:text-slate-200 w-10 h-10 flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-slate-800 text-lg font-bold">♦</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              PokerConnect
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 bg-slate-800/40 border-slate-700/30 text-slate-200 placeholder-slate-400 focus:ring-violet-500/50"
                placeholder="Search hands, players, tags..."
              />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHomeClick}
              className="text-slate-400 hover:text-slate-200 w-10 h-10 flex-shrink-0"
            >
              <Home className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 w-10 h-10 flex-shrink-0 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/50 flex-shrink-0">
                  <Avatar className="w-8 h-8 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                    <AvatarImage src={user?.picture} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-slate-800/95 backdrop-blur-sm border-slate-700/50 text-slate-200"
              >
                <DropdownMenuItem
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50"
                >
                  <User className="w-4 h-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSettingsClick}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700/50" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
