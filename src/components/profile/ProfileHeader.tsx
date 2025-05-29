
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit3, Settings, Check, Share, Users, UserPlus, ThumbsUp } from 'lucide-react';

export const ProfileHeader = () => {
  return (
    <section className="bg-slate-900/60 rounded-xl border border-slate-700/20 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-slate-700/50">
              <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-800" />
            </div>
          </div>
          
          {/* Profile Info and Actions */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-200 truncate">Michael Johnson</h1>
                <p className="text-slate-400 text-sm sm:text-base">@pokerpro92</p>
                <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
                  Mid-stakes grinder focusing on NLH cash games. Sharing hands and learning from the community. Based in Las Vegas.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-800 hover:from-emerald-600 hover:to-violet-600 text-sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="icon" className="border-slate-700/30 bg-slate-800/40 self-center sm:self-auto">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <Share className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-semibold text-slate-200 truncate">1,280</p>
              <p className="text-xs text-slate-400 truncate">Hands Shared</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-semibold text-slate-200 truncate">3,476</p>
              <p className="text-xs text-slate-400 truncate">Followers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-semibold text-slate-200 truncate">521</p>
              <p className="text-xs text-slate-400 truncate">Following</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-semibold text-slate-200 truncate">9,824</p>
              <p className="text-xs text-slate-400 truncate">Likes Received</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
