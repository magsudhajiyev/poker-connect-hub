
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ProfileStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Total Hands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-200">1,280</div>
          <p className="text-xs text-emerald-500">+12% from last month</p>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-200">+5.2 BB/100</div>
          <p className="text-xs text-emerald-500">Above average</p>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">VPIP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-200">24.3%</div>
          <p className="text-xs text-slate-400">Tight aggressive</p>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900/60 border-slate-700/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">3-Bet %</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-200">8.7%</div>
          <p className="text-xs text-slate-400">Balanced range</p>
        </CardContent>
      </Card>
    </div>
  );
};
