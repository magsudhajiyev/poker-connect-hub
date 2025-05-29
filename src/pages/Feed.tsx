
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Menu } from 'lucide-react';
import { sharedHandsStore, SharedHand } from '@/stores/sharedHandsStore';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-slate-950">
          <GlobalSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const FeedContent = () => {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const [sharedHands, setSharedHands] = useState<SharedHand[]>([]);

  useEffect(() => {
    // Initial load
    setSharedHands(sharedHandsStore.getHands());
    
    // Subscribe to updates
    const unsubscribe = sharedHandsStore.subscribe(() => {
      setSharedHands(sharedHandsStore.getHands());
    });

    return unsubscribe;
  }, []);

  const handleHandClick = (handId: string) => {
    navigate(`/hand-view?id=${handId}`);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <h1 className="text-lg font-semibold text-slate-200 lg:hidden">Feed</h1>
          </div>
          <div className="lg:hidden">
            {/* Add any additional mobile header content here */}
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <ProfileTopBar />
      </div>
      
      <div className="flex pt-16 lg:pt-0">
        <div className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
          <GlobalSidebar />
        </div>

        <div className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <main className="px-2 sm:px-4 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">Your Poker Feed</h1>
                <p className="text-slate-400 text-sm sm:text-base">Stay updated with the latest hands from your community</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {sharedHands.map((hand) => (
                  <Card 
                    key={hand.id} 
                    className="bg-slate-800/40 border-slate-700/30 cursor-pointer hover:bg-slate-800/60 transition-colors"
                    onClick={() => handleHandClick(hand.id)}
                  >
                    <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3">
                        <AvatarImage src={hand.authorAvatar} />
                        <AvatarFallback>{hand.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-200 font-medium text-sm sm:text-base truncate">{hand.authorName}</h3>
                        <p className="text-slate-400 text-xs sm:text-sm">{formatTimeAgo(hand.createdAt)}</p>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">{hand.formData.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}</span>
                        <span className="sm:hidden">{hand.formData.gameFormat === 'mtt' ? 'MTT' : 'Cash'}</span>
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="mb-3">
                        <h4 className="text-slate-200 font-medium mb-2 text-sm sm:text-base">
                          {hand.formData.title || 'Poker Hand Analysis'}
                        </h4>
                        <p className="text-slate-300 mb-3 text-sm sm:text-base line-clamp-2">
                          {hand.formData.description || `${hand.formData.gameType} hand from ${hand.formData.heroPosition} vs ${hand.formData.villainPosition}`}
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                          {hand.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-violet-500/20 text-violet-400 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {hand.tags.length > 2 && (
                            <Badge variant="secondary" className="bg-slate-500/20 text-slate-400 text-xs">
                              +{hand.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 p-1 sm:p-2">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">{hand.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-1 sm:p-2">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">{hand.comments}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-1 sm:p-2">
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-1 sm:p-2">
                          <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {sharedHands.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400 mb-4 text-sm sm:text-base">No hands shared yet</p>
                    <Button onClick={() => navigate('/share-hand')} className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 text-sm sm:text-base">
                      Share Your First Hand
                    </Button>
                  </div>
                )}

                {/* Sample static posts for demo */}
                {[1, 2].map((item) => (
                  <Card key={`sample-${item}`} className="bg-slate-800/40 border-slate-700/30">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3">
                        <AvatarImage src={`https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${item + 1}.jpg`} />
                        <AvatarFallback>P{item}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-200 font-medium text-sm sm:text-base">Player {item}</h3>
                        <p className="text-slate-400 text-xs sm:text-sm">{item}h ago</p>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Hot Hand</span>
                        <span className="sm:hidden">Hot</span>
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-300 mb-4 text-sm sm:text-base">
                        Just hit a sick bluff with 7-2 offsuit on the river! Sometimes you gotta trust your reads 🎯
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 p-1 sm:p-2">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">{24 + item}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-1 sm:p-2">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">{8 + item}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-1 sm:p-2">
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-1 sm:p-2">
                          <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
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
