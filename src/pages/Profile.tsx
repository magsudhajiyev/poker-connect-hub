
import { useState } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileNav } from '@/components/profile/ProfileNav';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar } from '@/components/GlobalSidebar';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('hands');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-4 py-6">
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

export default Profile;
