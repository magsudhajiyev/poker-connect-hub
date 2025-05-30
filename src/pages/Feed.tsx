
import { GlobalSidebar, SidebarProvider } from '@/components/GlobalSidebar';
import { FeedMainContent } from '@/components/feed/FeedMainContent';

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

const Feed = () => {
  return (
    <SidebarProvider>
      <FeedContent />
    </SidebarProvider>
  );
};

export default Feed;
