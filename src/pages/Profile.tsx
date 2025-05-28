
import { useState } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileNav } from '@/components/profile/ProfileNav';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';

const ProfileContent_Internal = () => {
  const [activeTab, setActiveTab] = useState('hands');
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-7xl mx-auto space-y-6">
            <ProfileHeader />
            <ProfileNav activeTab={activeTab} onTabChange={setActiveTab} />
            <ProfileContent activeTab={activeTab} />
          </div>
        </main>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <SidebarProvider>
      <ProfileContent_Internal />
    </SidebarProvider>
  );
};

export default Profile;
