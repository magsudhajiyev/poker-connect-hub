
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { MobileSidebarContent } from '@/components/MobileSidebarContent';
import { ShareHandProvider } from '@/components/share-hand/ShareHandProvider';
import ShareHandHeader from '@/components/share-hand/ShareHandHeader';
import ShareHandForm from '@/components/share-hand/ShareHandForm';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
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
        <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-slate-800/60">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-slate-950 border-slate-800">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Main navigation menu for the application</SheetDescription>
        <MobileSidebarContent onNavigate={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

const ShareHandContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <GlobalSidebar />
      </div>

      {/* Main Content Container */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:ml-12' : 'lg:ml-64'
      }`}>
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 transition-all duration-300 ease-in-out"
             style={{
               left: window.innerWidth >= 1024 ? (isCollapsed ? '3rem' : '16rem') : '0',
             }}>
          <div className="flex items-center justify-between h-16 pl-4 pr-4 lg:px-4">
            <div className="flex items-center space-x-4">
              <MobileSidebar />
              <h1 className="text-lg font-semibold text-slate-200 lg:hidden">Share Hand</h1>
            </div>
          </div>
        </div>
        
        {/* Desktop Profile Top Bar */}
        <div className="hidden lg:block">
          <ProfileTopBar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 pt-16">
          <div className="w-full px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6">
            <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
              <ShareHandProvider>
                <ShareHandHeader />
                <ShareHandForm />
              </ShareHandProvider>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const ShareHand = () => {
  return (
    <SidebarProvider>
      <ShareHandContent />
    </SidebarProvider>
  );
};

export default ShareHand;
