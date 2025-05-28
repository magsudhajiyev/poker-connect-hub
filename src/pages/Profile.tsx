
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileNav } from '@/components/profile/ProfileNav';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('hands');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ProfileSidebar />
          <div className="flex-1">
            <ProfileTopBar />
            <main className="p-6 pt-20">
              <div className="max-w-7xl mx-auto space-y-6">
                <ProfileHeader />
                <ProfileNav activeTab={activeTab} onTabChange={setActiveTab} />
                <ProfileContent activeTab={activeTab} />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Profile;
