
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { MobileSidebarContent } from '@/components/MobileSidebarContent';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 overflow-y-auto">
        <MobileSidebarContent />
      </SheetContent>
    </Sheet>
  );
};
