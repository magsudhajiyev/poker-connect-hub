
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { ShareHandProvider } from '@/components/share-hand/ShareHandProvider';
import ShareHandHeader from '@/components/share-hand/ShareHandHeader';
import ShareHandForm from '@/components/share-hand/ShareHandForm';

const ShareHandContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        <main className={`flex-1 px-3 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-12 xl:ml-16' : 'lg:ml-48 xl:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
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
