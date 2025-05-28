
import React from 'react';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { ShareHandProvider, useShareHandContext } from '@/components/share-hand/ShareHandProvider';
import HandDisplay from '@/components/share-hand/HandDisplay';

const HandViewContent = () => {
  const { isCollapsed } = useSidebar();
  const {
    formData,
    tags,
    getPositionName,
    getCurrencySymbol,
    calculatePotSize
  } = useShareHandContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <HandDisplay
              formData={formData}
              tags={tags}
              getPositionName={getPositionName}
              getCurrencySymbol={getCurrencySymbol}
              calculatePotSize={calculatePotSize}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const HandView = () => {
  return (
    <SidebarProvider>
      <ShareHandProvider>
        <HandViewContent />
      </ShareHandProvider>
    </SidebarProvider>
  );
};

export default HandView;
