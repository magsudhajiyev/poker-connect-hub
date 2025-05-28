
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, TrendingUp, Menu } from 'lucide-react';
import { sharedHandsStore, SharedHand } from '@/stores/sharedHandsStore';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
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

const HandViewContent = () => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [hand, setHand] = useState<SharedHand | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const handId = urlParams.get('id');
    
    if (handId) {
      const foundHand = sharedHandsStore.getHand(handId);
      setHand(foundHand);
    }
  }, [location.search]);

  if (!hand) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-200 mb-4">Hand not found</h1>
          <Button onClick={() => navigate('/feed')} className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

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
      {/* Mobile Header */}
      <div className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 lg:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <h1 className="text-lg font-semibold text-slate-200">Hand Analysis</h1>
          </div>
        </div>
      </div>

      <div className="flex pt-16 lg:pt-0">
        <div className="hidden lg:block">
          <GlobalSidebar />
        </div>

        <main className={`flex-1 px-2 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/feed')}
                className="border-slate-700/50 text-slate-300 w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Feed
              </Button>
              
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 w-fit">
                <TrendingUp className="w-3 h-3 mr-1" />
                {hand.formData.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}
              </Badge>
            </div>

            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <Avatar className="w-12 h-12 mr-4">
                  <AvatarImage src={hand.authorAvatar} />
                  <AvatarFallback>{hand.authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-slate-200 font-medium text-lg">{hand.authorName}</h3>
                  <p className="text-slate-400">{formatTimeAgo(hand.createdAt)}</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-200 mb-3">
                    {hand.formData.title || 'Poker Hand Analysis'}
                  </h1>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {hand.formData.description || `${hand.formData.gameType} hand analysis from ${hand.formData.heroPosition} vs ${hand.formData.villainPosition}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hand.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-violet-500/20 text-violet-400">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/30">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">Hand Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Game Type:</span>
                      <span className="text-slate-200 ml-2">{hand.formData.gameType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Stakes:</span>
                      <span className="text-slate-200 ml-2">{hand.formData.smallBlind}/{hand.formData.bigBlind}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Position:</span>
                      <span className="text-slate-200 ml-2">{hand.formData.heroPosition}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Players:</span>
                      <span className="text-slate-200 ml-2">{hand.formData.tableSize}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Stack Size:</span>
                      <span className="text-slate-200 ml-2">{hand.formData.stackSize} BB</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Format:</span>
                      <span className="text-slate-200 ml-2">{hand.formData.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                  <div className="flex items-center space-x-6">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                      <Heart className="w-5 h-5 mr-2" />
                      {hand.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {hand.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-200">Comments</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share your thoughts on this hand..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 min-h-[100px]"
                  />
                  <Button 
                    disabled={!comment.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
                  >
                    Post Comment
                  </Button>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-slate-400 text-center">No comments yet. Be the first to share your analysis!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const HandView = () => {
  return (
    <SidebarProvider>
      <HandViewContent />
    </SidebarProvider>
  );
};

export default HandView;
