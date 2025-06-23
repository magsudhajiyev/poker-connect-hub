
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { MobileSidebarContent } from '@/components/MobileSidebarContent';
import { ArrowLeft, Menu, Bell, Shield, User, Palette, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-slate-950 border-slate-800 overflow-y-auto">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Main navigation menu for the application</SheetDescription>
        <div className="h-full">
          <MobileSidebarContent onNavigate={() => setIsOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const SettingsContent = () => {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const { logout, isLoggingOut } = useAuth();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [handNotifications, setHandNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <GlobalSidebar />
      </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 lg:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-200">Settings</h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className={`flex-1 min-w-0 px-3 sm:px-4 md:px-6 py-4 sm:py-6 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-16 lg:pt-6`}>
        <div className="max-w-4xl mx-auto w-full">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800/60 mb-6 sm:mb-8">
              <TabsTrigger value="account" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4 sm:space-y-6">
              <Card className="bg-slate-800/40 border-slate-700/30 w-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-slate-200 text-lg sm:text-xl">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="username" className="text-slate-300 text-sm">Username</Label>
                      <Input
                        id="username"
                        defaultValue="pokerpro2024"
                        className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9 sm:h-10 w-full"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="email" className="text-slate-300 text-sm">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="user@example.com"
                        className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9 sm:h-10 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-300 text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your poker journey..."
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200 min-h-[80px] sm:min-h-[100px] w-full"
                    />
                  </div>
                  <div className="pt-2 sm:pt-4">
                    <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 w-full sm:w-auto">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/40 border-slate-700/30 w-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-slate-200 text-lg sm:text-xl">Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="destructive"
                    className="w-full sm:w-auto flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </Button>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2">
                    You will be redirected to the home page after logging out.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
              <Card className="bg-slate-800/40 border-slate-700/30 w-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-slate-200 text-lg sm:text-xl">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between py-2 sm:py-3">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                      <Label className="text-slate-200 text-sm sm:text-base">Email Notifications</Label>
                      <p className="text-slate-400 text-xs sm:text-sm break-words">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 sm:py-3">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                      <Label className="text-slate-200 text-sm sm:text-base">Push Notifications</Label>
                      <p className="text-slate-400 text-xs sm:text-sm break-words">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 sm:py-3">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                      <Label className="text-slate-200 text-sm sm:text-base">Hand Analysis Updates</Label>
                      <p className="text-slate-400 text-xs sm:text-sm break-words">Get notified about comments on your hands</p>
                    </div>
                    <Switch
                      checked={handNotifications}
                      onCheckedChange={setHandNotifications}
                      className="flex-shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
              <Card className="bg-slate-800/40 border-slate-700/30 w-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-slate-200 text-lg sm:text-xl">Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between py-2 sm:py-3">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                      <Label className="text-slate-200 text-sm sm:text-base">Two-Factor Authentication</Label>
                      <p className="text-slate-400 text-xs sm:text-sm break-words">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 sm:py-3">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                      <Label className="text-slate-200 text-sm sm:text-base">Data Sharing</Label>
                      <p className="text-slate-400 text-xs sm:text-sm break-words">Allow anonymous analytics</p>
                    </div>
                    <Switch
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 sm:py-3">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                      <Label className="text-slate-200 text-sm sm:text-base">Public Profile</Label>
                      <p className="text-slate-400 text-xs sm:text-sm break-words">Make your profile visible to others</p>
                    </div>
                    <Switch
                      checked={profileVisibility}
                      onCheckedChange={setProfileVisibility}
                      className="flex-shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 sm:space-y-6">
              <Card className="bg-slate-800/40 border-slate-700/30 w-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-slate-200 text-lg sm:text-xl">App Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Default Game Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <Button variant="outline" className="border-slate-700/50 text-slate-300 h-9 sm:h-10 text-xs sm:text-sm">
                        No Limit Hold'em
                      </Button>
                      <Button variant="outline" className="border-slate-700/50 text-slate-300 h-9 sm:h-10 text-xs sm:text-sm">
                        Pot Limit Omaha
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Theme</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <Button variant="outline" className="border-slate-700/50 text-slate-300 h-9 sm:h-10 text-xs sm:text-sm">
                        Dark Mode
                      </Button>
                      <Button variant="outline" className="border-slate-700/50 text-slate-300 h-9 sm:h-10 text-xs sm:text-sm">
                        Light Mode
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2 sm:pt-4">
                    <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 w-full sm:w-auto">
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
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
