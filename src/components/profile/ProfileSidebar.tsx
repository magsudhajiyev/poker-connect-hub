
import { 
  Rss, Flame, ChartLine, User, Users, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: 'Feed', icon: Rss, url: '/feed', isActive: false },
  { title: 'Trending Hands', icon: Flame, url: '/trending', isActive: false },
  { title: 'My Stats', icon: ChartLine, url: '/stats', isActive: false },
  { title: 'My Profile', icon: User, url: '/profile', isActive: true },
  { title: 'Following', icon: Users, url: '/following', isActive: false },
  { title: 'Help & Support', icon: HelpCircle, url: '/help', isActive: false },
];

export const ProfileSidebar = () => {
  return (
    <Sidebar className="border-r border-zinc-700/20">
      <SidebarContent className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <SidebarGroup className="pt-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={`px-4 py-2.5 rounded-xl ${
                      item.isActive 
                        ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <a href={item.url} className="flex items-center w-full">
                      <item.icon className={`w-5 h-5 mr-3 ${item.isActive ? 'text-emerald-500' : ''}`} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 mb-2">
            My Stats Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-4 space-y-3 mx-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Hands Played</span>
                <span className="text-emerald-500 font-medium">1,280</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Win Rate</span>
                <span className="text-emerald-500 font-medium">+5.2 BB/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Top Hand</span>
                <span className="text-zinc-200 font-medium">A♠A♥</span>
              </div>
              <Button className="w-full mt-2 py-2 bg-zinc-800/40 rounded-xl border border-zinc-700/30 text-zinc-200 text-sm hover:bg-zinc-800/60">
                View Full Stats
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
