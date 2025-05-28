
import { useState } from 'react';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Bell, Shield, User, Palette, Globe } from 'lucide-react';

const SettingsContent = () => {
  const { isCollapsed } = useSidebar();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-200 mb-2">Settings</h1>
              <p className="text-slate-400">Manage your account preferences and privacy settings</p>
            </div>

            {/* Profile Settings */}
            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader className="flex flex-row items-center space-y-0">
                <User className="w-5 h-5 text-emerald-500 mr-3" />
                <h2 className="text-xl font-semibold text-slate-200">Profile Settings</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="border-slate-700/50 text-slate-300">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-slate-300">Username</Label>
                    <Input
                      id="username"
                      defaultValue="mikejohnson"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      defaultValue="mike@example.com"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-slate-300">Bio</Label>
                  <Input
                    id="bio"
                    defaultValue="Professional poker player sharing insights"
                    className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader className="flex flex-row items-center space-y-0">
                <Bell className="w-5 h-5 text-emerald-500 mr-3" />
                <h2 className="text-xl font-semibold text-slate-200">Notifications</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-200 font-medium">Email Notifications</h3>
                    <p className="text-slate-400 text-sm">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                
                <Separator className="bg-slate-700/50" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-200 font-medium">Push Notifications</h3>
                    <p className="text-slate-400 text-sm">Get notified on your device</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                
                <Separator className="bg-slate-700/50" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-200 font-medium">Marketing Emails</h3>
                    <p className="text-slate-400 text-sm">Receive promotional content</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader className="flex flex-row items-center space-y-0">
                <Shield className="w-5 h-5 text-emerald-500 mr-3" />
                <h2 className="text-xl font-semibold text-slate-200">Privacy & Security</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="privacy" className="text-slate-300">Profile Visibility</Label>
                  <Select defaultValue="public">
                    <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="border-slate-700/50 text-slate-300">
                  Change Password
                </Button>
                
                <Button variant="outline" className="border-slate-700/50 text-slate-300">
                  Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>

            {/* Save Changes */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" className="border-slate-700/50 text-slate-300">
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900">
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <SidebarProvider>
      <SettingsContent />
    </SidebarProvider>
  );
};

export default Settings;
