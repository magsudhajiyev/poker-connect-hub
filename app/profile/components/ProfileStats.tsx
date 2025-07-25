'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileData } from '@/hooks/useProfileData';

export const ProfileStats = () => {
  const { stats } = useProfileData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">
            Total Hands
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-xl sm:text-2xl font-bold text-slate-200">
            {stats.handsShared.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-500">+12% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Win Rate</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-xl sm:text-2xl font-bold text-slate-200">+5.2 BB/100</div>
          <p className="text-xs text-emerald-500">Above average</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">VPIP</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-xl sm:text-2xl font-bold text-slate-200">24.3%</div>
          <p className="text-xs text-slate-400">Tight aggressive</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">3-Bet %</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-xl sm:text-2xl font-bold text-slate-200">8.7%</div>
          <p className="text-xs text-slate-400">Balanced range</p>
        </CardContent>
      </Card>
    </div>
  );
};
