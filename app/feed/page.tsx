'use client';

import { GlobalSidebar } from '@/components/GlobalSidebar';
import { SidebarProvider } from '@/components/sidebar/SidebarContext';
import { FeedMainContent } from './components/FeedMainContent';

const FeedContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <GlobalSidebar />
      </div>

      {/* Main Content Container */}
      <FeedMainContent />
    </div>
  );
};

export default function FeedPage() {
  return (
    <SidebarProvider>
      <FeedContent />
    </SidebarProvider>
  );
}