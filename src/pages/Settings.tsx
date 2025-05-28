
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Settings as SettingsIcon, 
  Camera,
  Menu
} from 'lucide-react';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-slate-950">
          <GlobalSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const SettingsContent = () => {
  const { isCollapsed } = useSidebar();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    handUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showStats: true,
    showOnlineStatus: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile Header */}
      <div className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 lg:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <h1 className="text-lg font-semibold text-slate-200">Settings</h1>
          </div>
        </div>
      </div>

      <div className="flex pt-16 lg:pt-0">
        <div className="hidden lg:block">
          <GlobalSidebar />
        </div>

        <main className={`flex-1 px-2 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">Settings</h1>
              <p className="text-slate-400">Manage your account preferences and privacy settings</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-800/40 border border-slate-700/30">
                <TabsTrigger value="profile" className="text-slate-400 data-[state=active]:text-slate-200">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-slate-400 data-[state=active]:text-slate-200">
                  <Bell className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="text-slate-400 data-[state=active]:text-slate-200">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="text-slate-400 data-[state=active]:text-slate-200">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Billing</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="bg-slate-800/40 border-slate-700/30">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Update your profile details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <h3 className="text-lg font-medium text-slate-200">John Doe</h3>
                          <Badge variant="secondary" className="w-fit">Pro Player</Badge>
                        </div>
                        <p className="text-slate-400">Member since March 2024</p>
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-slate-200">Username</Label>
                        <Input
                          id="username"
                          defaultValue="pokerpro123"
                          className="bg-slate-900/50 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue="john.doe@example.com"
                          className="bg-slate-900/50 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-slate-200">Location</Label>
                        <Input
                          id="location"
                          defaultValue="Las Vegas, NV"
                          className="bg-slate-900/50 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-slate-200">Timezone</Label>
                        <Select defaultValue="pst">
                          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="est">Eastern Time (EST)</SelectItem>
                            <SelectItem value="cst">Central Time (CST)</SelectItem>
                            <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                            <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="bg-slate-800/40 border-slate-700/30">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Control how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-200">Email notifications</Label>
                          <p className="text-sm text-slate-400">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-200">Push notifications</Label>
                          <p className="text-sm text-slate-400">Receive push notifications in your browser</p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-200">Marketing emails</Label>
                          <p className="text-sm text-slate-400">Receive updates about new features and promotions</p>
                        </div>
                        <Switch
                          checked={notifications.marketing}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-200">Hand updates</Label>
                          <p className="text-sm text-slate-400">Get notified when someone comments on your hands</p>
                        </div>
                        <Switch
                          checked={notifications.handUpdates}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, handUpdates: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card className="bg-slate-800/40 border-slate-700/30">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Privacy Settings
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Control who can see your information and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-200">Public profile</Label>
                          <p className="text-sm text-slate-400">Make your profile visible to other users</p>
                        </div>
                        <Switch
                          checked={privacy.profilePublic}
                          onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profilePublic: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-200">Show statistics</Label>
                          <p className="text-sm text-slate-400">Display your poker statistics on your profile</p>
                        </div>
                        <Switch
                          checked={privacy.showStats}
                          onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showStats: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-200">Online status</Label>
                          <p className="text-sm text-slate-400">Show when you're online to other users</p>
                        </div>
                        <Switch
                          checked={privacy.showOnlineStatus}
                          onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card className="bg-slate-800/40 border-slate-700/30">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Billing & Subscription
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-medium text-slate-200">Pro Plan</h3>
                        <p className="text-slate-400">$9.99/month • Next billing: April 15, 2024</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="border-slate-600 text-slate-300">
                          Change Plan
                        </Button>
                        <Button variant="outline" className="border-slate-600 text-slate-300">
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-slate-200 font-medium mb-3">Payment Methods</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-sm font-bold">
                              ••••
                            </div>
                            <div>
                              <p className="text-slate-200">•••• •••• •••• 4242</p>
                              <p className="text-slate-400 text-sm">Expires 12/26</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Primary</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-3 border-slate-600 text-slate-300">
                        Add Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
