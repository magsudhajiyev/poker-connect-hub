
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit3, Settings, Check, Share, Users, UserPlus, ThumbsUp } from 'lucide-react';

export const ProfileHeader = () => {
  return (
    <section className="bg-slate-900/60 rounded-xl border border-slate-700/20 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-slate-700/50">
            <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" />
            <AvatarFallback>MJ</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <Check className="w-3 h-3 text-slate-800" />
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-200">Michael Johnson</h1>
              <p className="text-slate-400">@pokerpro92</p>
              <p className="text-slate-300 mt-2 max-w-lg">
                Mid-stakes grinder focusing on NLH cash games. Sharing hands and learning from the community. Based in Las Vegas.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-800 hover:from-emerald-600 hover:to-violet-600">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="icon" className="border-slate-700/30 bg-slate-800/40">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center">
                <Share className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-200">1,280</p>
                <p className="text-xs text-slate-400">Hands Shared</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-200">3,476</p>
                <p className="text-xs text-slate-400">Followers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-200">521</p>
                <p className="text-xs text-slate-400">Following</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-200">9,824</p>
                <p className="text-xs text-slate-400">Likes Received</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
