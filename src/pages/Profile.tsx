
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Rss, Flame, ChartLine, User, Users, HelpCircle
} from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileNav } from '@/components/profile/ProfileNav';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('hands');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        {/* Left Sidebar - Same as Feed page */}
        <aside className="hidden lg:block w-64 fixed h-[calc(100vh-4rem)] overflow-y-auto border-r border-zinc-700/20 pt-6">
          <nav className="px-4 space-y-1">
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <Rss className="w-5 h-5 mr-3" />
              <span>Feed</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <Flame className="w-5 h-5 mr-3" />
              <span>Trending Hands</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <ChartLine className="w-5 h-5 mr-3" />
              <span>My Stats</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-200 rounded-xl bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-zinc-700/30 cursor-pointer">
              <User className="w-5 h-5 text-emerald-500 mr-3" />
              <span>My Profile</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <Users className="w-5 h-5 mr-3" />
              <span>Following</span>
            </div>
            <div className="flex items-center px-4 py-2.5 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/40 cursor-pointer">
              <HelpCircle className="w-5 h-5 mr-3" />
              <span>Help & Support</span>
            </div>
          </nav>
          
          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 mb-2">My Stats Overview</h3>
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-700/20 p-4 space-y-3">
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
          </div>
        </aside>

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
