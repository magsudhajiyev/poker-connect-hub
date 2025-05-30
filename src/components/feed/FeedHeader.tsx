
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { MobileSidebarContent } from '@/components/MobileSidebarContent';

export const FeedHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center space-x-3 min-w-0">
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
          <h1 className="text-lg font-semibold text-slate-200 truncate">Feed</h1>
        </div>
      </div>
    </div>
  );
};
