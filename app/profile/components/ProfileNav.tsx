'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share, BarChart3, ThumbsUp, Users, UserPlus } from 'lucide-react';

interface ProfileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileNav = ({ activeTab, onTabChange }: ProfileNavProps) => {
  return (
    <div className="border-b border-slate-700/20 overflow-x-auto">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="bg-transparent border-none h-auto p-0 space-x-0 w-full justify-start">
          <TabsTrigger 
            value="hands" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-slate-200 rounded-none px-3 sm:px-6 py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent text-xs sm:text-sm whitespace-nowrap"
          >
            <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Played </span>Hands
          </TabsTrigger>
          <TabsTrigger 
            value="stats" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-slate-200 rounded-none px-3 sm:px-6 py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent text-xs sm:text-sm whitespace-nowrap"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Stats
          </TabsTrigger>
          <TabsTrigger 
            value="likes" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-slate-200 rounded-none px-3 sm:px-6 py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent text-xs sm:text-sm whitespace-nowrap"
          >
            <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Likes
          </TabsTrigger>
          <TabsTrigger 
            value="following" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-slate-200 rounded-none px-3 sm:px-6 py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent text-xs sm:text-sm whitespace-nowrap"
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Following
          </TabsTrigger>
          <TabsTrigger 
            value="followers" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-slate-200 rounded-none px-3 sm:px-6 py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent text-xs sm:text-sm whitespace-nowrap"
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Followers
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};