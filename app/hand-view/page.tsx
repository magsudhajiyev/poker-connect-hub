'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/GlobalSidebar';
import { HandViewContent } from './components/HandViewContent';

// Loading component for Suspense
function HandViewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
}

const HandViewPage = () => {
  return (
    <SidebarProvider>
      <Suspense fallback={<HandViewLoading />}>
        <HandViewContent />
      </Suspense>
    </SidebarProvider>
  );
};

export default HandViewPage;
