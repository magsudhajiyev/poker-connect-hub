'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/GlobalSidebar';
import { HandViewContent } from '../components/HandViewContent';

// Loading component for Suspense
function HandViewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
}

interface HandViewPageProps {
  params: {
    id: string;
  };
}

const HandViewPage = ({ params }: HandViewPageProps) => {
  return (
    <SidebarProvider>
      <Suspense fallback={<HandViewLoading />}>
        <HandViewContent handId={params.id} />
      </Suspense>
    </SidebarProvider>
  );
};

export default HandViewPage;
