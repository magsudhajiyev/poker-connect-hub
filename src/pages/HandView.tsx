
import { SidebarProvider } from '@/components/GlobalSidebar';
import { HandViewContent } from '@/components/hand-view/HandViewContent';

const HandView = () => {
  return (
    <SidebarProvider>
      <HandViewContent />
    </SidebarProvider>
  );
};

export default HandView;
