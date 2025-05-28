
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel 
} from '@/components/ui/sidebar';
import { Home, TrendingUp, BarChart3, User, Users, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { title: 'Feed', icon: Home, url: '/feed', isActive: false },
  { title: 'Trending Hands', icon: TrendingUp, url: '/trending', isActive: false },
  { title: 'My Stats', icon: BarChart3, url: '/stats', isActive: false },
  { title: 'My Profile', icon: User, url: '/profile', isActive: true },
  { title: 'Following', icon: Users, url: '/following', isActive: false },
  { title: 'Help & Support', icon: HelpCircle, url: '/help', isActive: false },
];

export const ProfileSidebar = () => {
  return (
    <Sidebar className="hidden lg:block">
      <SidebarHeader className="p-6" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive}
                    className={item.isActive ? 'bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-slate-700/30 text-slate-200' : ''}
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.isActive ? 'text-emerald-500' : ''}`} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
            My Stats Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mx-4 bg-slate-900/60 rounded-xl border border-slate-700/20 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Hands Played</span>
                <span className="text-emerald-500 font-medium">1,280</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Win Rate</span>
                <span className="text-emerald-500 font-medium">+5.2 BB/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Top Hand</span>
                <span className="text-slate-200 font-medium">A♠A♥</span>
              </div>
              <Button className="w-full mt-2 bg-slate-800/40 border border-slate-700/30 text-slate-200 hover:bg-slate-700/40">
                View Full Stats
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
