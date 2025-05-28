
import { useState } from 'react';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp } from 'lucide-react';

const FeedContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-200 mb-2">Your Poker Feed</h1>
              <p className="text-slate-400">Stay updated with the latest hands from your community</p>
            </div>

            {/* Sample feed items */}
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="bg-slate-800/40 border-slate-700/30">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={`https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${item}.jpg`} />
                      <AvatarFallback>P{item}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-slate-200 font-medium">Player {item}</h3>
                      <p className="text-slate-400 text-sm">2 hours ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot Hand
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">
                      Just hit a sick bluff with 7-2 offsuit on the river! Sometimes you gotta trust your reads 🎯
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                          <Heart className="w-4 h-4 mr-1" />
                          24
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          8
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const Feed = () => {
  return (
    <SidebarProvider>
      <FeedContent />
    </SidebarProvider>
  );
};

export default Feed;
