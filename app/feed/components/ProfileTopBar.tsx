'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useSidebar } from '@/components/sidebar/SidebarContext';
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
    router.push('/');
  };

  return (
    <div className="h-16 bg-slate-950 border-b border-slate-800/50 px-4 lg:px-6">
      <div className="h-full flex items-center justify-between">
        {/* Left Section - Toggle & Search */}
        <div className="flex items-center flex-1 space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative max-w-md flex-1 hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search hands, players..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-slate-900/60 border-slate-700/30 text-slate-200 placeholder-slate-400 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Right Section - Icons & Profile */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            onClick={handleHomeClick}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-slate-800/60 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      user?.picture ||
                      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg'
                    }
                  />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-slate-200 font-medium hidden lg:inline">
                  {user?.name || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700/30">
              <DropdownMenuItem
                onClick={handleProfileClick}
                className="text-slate-200 hover:bg-slate-800/60 hover:text-slate-100 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSettingsClick}
                className="text-slate-200 hover:bg-slate-800/60 hover:text-slate-100 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700/30" />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-400 hover:bg-slate-800/60 hover:text-red-300 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
