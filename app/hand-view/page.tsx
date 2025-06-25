'use client';

import { SidebarProvider } from '@/components/GlobalSidebar';
import { HandViewContent } from './components/HandViewContent';

const HandViewPage = () => {
  return (
    <SidebarProvider>
      <HandViewContent />
    </SidebarProvider>
  );
};

export default HandViewPage;