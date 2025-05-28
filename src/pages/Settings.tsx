import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';

const SettingsContent_Internal = () => {
  const [activeTab, setActiveTab] = useState('account');
  const { isCollapsed } = useSidebar();

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'connected-apps', label: 'Connected Apps' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto">
            {/* Settings Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-400 mt-1">Manage your account preferences and profile information</p>
            </div>

            {/* Settings Navigation Tabs */}
            <div className="flex border-b border-slate-700/30 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-emerald-500 border-b-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Account Settings Section */}
            {activeTab === 'account' && (
              <>
                {/* Profile Information */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-700/20 p-6 mb-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-200">Profile Information</h2>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="md:w-1/3">
                      <div className="flex flex-col items-center">
                        <Avatar className="w-24 h-24 border-2 border-slate-700/50 mb-3">
                          <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-slate-800/40 border-slate-700/30 text-slate-200 hover:bg-slate-800/60 mb-1"
                        >
                          Change Avatar
                        </Button>
                        <span className="text-xs text-slate-400">JPG, PNG or GIF. 5MB max.</span>
                      </div>
                    </div>
                    
                    <div className="md:w-2/3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Display Name</label>
                          <Input 
                            defaultValue="John Doe" 
                            className="bg-slate-800/60 border-slate-700/30 text-slate-200 focus:ring-violet-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Username</label>
                          <Input 
                            defaultValue="pokerpro123" 
                            className="bg-slate-800/60 border-slate-700/30 text-slate-200 focus:ring-violet-500/50"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Bio</label>
                        <Textarea 
                          defaultValue="Professional poker player with 10+ years experience. Specializing in NLH cash games and MTTs."
                          className="h-24 bg-slate-800/60 border-slate-700/30 text-slate-200 focus:ring-violet-500/50"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Location</label>
                        <Input 
                          defaultValue="Las Vegas, NV" 
                          className="bg-slate-800/60 border-slate-700/30 text-slate-200 focus:ring-violet-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-700/20 p-6 mb-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-200">Contact Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                      <Input 
                        type="email" 
                        defaultValue="you@email.com" 
                        className="bg-slate-800/60 border-slate-700/30 text-slate-200 focus:ring-violet-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Phone Number (optional)</label>
                      <Input 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        className="bg-slate-800/60 border-slate-700/30 text-slate-200 focus:ring-violet-500/50"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Preferences */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-700/20 p-6 mb-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-200">Preferences</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Theme</label>
                      <Select defaultValue="dark">
                        <SelectTrigger className="bg-slate-800/60 border-slate-700/30 text-slate-200 focus:ring-violet-500/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700/50">
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium">
                    Save Changes
                  </Button>
                </div>
              </>
            )}

            {/* Other tabs content placeholder */}
            {activeTab !== 'account' && (
              <div className="bg-slate-900/60 rounded-xl border border-slate-700/20 p-6">
                <h2 className="text-lg font-medium mb-4 text-slate-200 capitalize">{activeTab} Settings</h2>
                <p className="text-slate-400">This section is coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <SidebarProvider>
      <SettingsContent_Internal />
    </SidebarProvider>
  );
};

export default Settings;
