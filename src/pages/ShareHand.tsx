
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { ShareHandProvider } from '@/components/share-hand/ShareHandProvider';
import ShareHandHeader from '@/components/share-hand/ShareHandHeader';
import ShareHandForm from '@/components/share-hand/ShareHandForm';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-slate-950">
          <GlobalSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ShareHandContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      <div className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <h1 className="text-lg font-semibold text-slate-200 lg:hidden">Share Hand</h1>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <ProfileTopBar />
      </div>
      
      <div className="flex pt-16 lg:pt-0">
        <div className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
          <GlobalSidebar />
        </div>

        <main className={`w-full px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6 transition-all duration-300 overflow-x-hidden ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-68'
        }`}>
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 w-full">
            <ShareHandProvider>
              <ShareHandHeader />
              <ShareHandForm />
            </ShareHandProvider>
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
