
import { 
  Rss, Flame, Share2, User, Users, HelpCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/feed' && location.pathname === '/feed') return true;
    if (path === '/profile' && location.pathname === '/profile') return true;
    if (path === '/share-hand' && location.pathname === '/share-hand') return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const menuItems = [
    {
      title: "Feed",
      url: "/feed",
      icon: Rss,
      onClick: () => handleNavigation('/feed')
    },
    {
      title: "Trending Hands",
      url: "#",
      icon: Flame,
      onClick: () => {}
    },
    {
      title: "Share Hand",
      url: "/share-hand",
      icon: Share2,
      onClick: () => handleNavigation('/share-hand')
    },
    {
      title: "My Profile",
      url: "/profile",
      icon: User,
      onClick: () => handleNavigation('/profile')
    },
    {
      title: "Following",
      url: "#",
      icon: Users,
      onClick: () => {}
    },
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle,
      onClick: () => {}
    }
  ];

  return (
    <Sidebar className="bg-slate-950 border-slate-800">
      <SidebarContent className="bg-slate-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400 uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    className={`text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors ${
                      isActive(item.url) 
                        ? 'text-zinc-200 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30' 
                        : ''
                    }`}
                  >
                    <button onClick={item.onClick} className="w-full flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isActive(item.url) ? 'text-emerald-500' : ''}`} />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-zinc-400 uppercase tracking-wider mb-2">
            My Stats Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Hands Played</span>
                <span className="text-emerald-500 font-medium text-sm">1,280</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Win Rate</span>
                <span className="text-emerald-500 font-medium text-sm">+5.2 BB/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Top Hand</span>
                <span className="text-zinc-200 font-medium text-sm">A♠A♥</span>
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
}
