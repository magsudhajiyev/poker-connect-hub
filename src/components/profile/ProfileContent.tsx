
import { ProfileStats } from './ProfileStats';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProfileContentProps {
  activeTab: string;
}

export const ProfileContent = ({ activeTab }: ProfileContentProps) => {
  if (activeTab === 'stats') {
    return <ProfileStats />;
  }

  if (activeTab === 'hands') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200">Recent Hands</h2>
          <div className="text-sm text-slate-400">Showing 24 of 1,280 hands</div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-700/20 hover:border-slate-600/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-400">Hand #{1280 - i}</div>
                  <div className="text-sm text-emerald-500">+$124</div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <div className="w-8 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-xs text-slate-200">A♠</div>
                    <div className="w-8 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-xs text-slate-200">K♥</div>
                  </div>
                  <div className="text-sm text-slate-400">vs 3 players</div>
                </div>
                <div className="text-xs text-slate-500">NL50 • 6-max • Position: BTN</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'followers') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200">Followers</h2>
          <div className="text-sm text-slate-400">3,476 followers</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-700/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${(i % 5) + 1}.jpg`} />
                    <AvatarFallback>U{i + 1}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">User {i + 1}</div>
                    <div className="text-sm text-slate-400">@user{i + 1}</div>
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-700/30">
                    Following
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          {activeTab === 'likes' && 'Liked Hands'}
          {activeTab === 'following' && 'Following'}
        </h3>
        <p className="text-slate-400">Content for {activeTab} will be displayed here.</p>
      </div>
    </div>
  );
};
