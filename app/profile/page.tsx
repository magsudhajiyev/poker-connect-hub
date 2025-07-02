'use client';

import { useState } from 'react';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileNav } from './components/ProfileNav';
import { ProfileContent } from './components/ProfileContent';
import { ProfileTopBar } from '@/components/shared/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { MobileSidebarContent } from '@/components/MobileSidebarContent';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-slate-950 border-slate-800">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Main navigation menu for the application
        </SheetDescription>
        <MobileSidebarContent onNavigate={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

const ProfileContent_Internal = () => {
  const [activeTab, setActiveTab] = useState('hands');
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <GlobalSidebar />
      </div>

      {/* Main Content Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center space-x-3 min-w-0">
              <MobileSidebar />
              <h1 className="text-lg font-semibold text-slate-200 truncate">Profile</h1>
            </div>
          </div>
        </div>

        {/* Desktop Profile Top Bar */}
        <div className="hidden lg:block">
          <ProfileTopBar />
        </div>

        {/* Main Content */}
        <main className="flex-1 pt-14 lg:pt-16 overflow-hidden">
          <div className="w-full h-full overflow-y-auto">
            <div className="px-4 lg:px-6 py-6 lg:py-8">
              <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
                <ProfileHeader />
                <ProfileNav activeTab={activeTab} onTabChange={setActiveTab} />
                <ProfileContent activeTab={activeTab} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <SidebarProvider>
      <ProfileContent_Internal />
    </SidebarProvider>
  );
};

export default Profile;
