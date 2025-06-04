
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { SharedHand } from '@/stores/sharedHandsStore';

interface HandViewCardProps {
  hand: SharedHand;
}

export const HandViewCard = ({ hand }: HandViewCardProps) => {
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
    <Card className="bg-slate-800/40 border-slate-700/30 w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <Avatar className="w-12 h-12 mr-4 flex-shrink-0">
          <AvatarImage src={hand.authorAvatar} />
          <AvatarFallback>{hand.authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-200 font-medium text-lg truncate">{hand.authorName}</h3>
          <p className="text-slate-400">{formatTimeAgo(hand.createdAt)}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 mb-3 break-words">
            {hand.formData.title || 'Poker Hand Analysis'}
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed break-words">
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
            <div className="min-w-0">
              <span className="text-slate-400">Game Type:</span>
              <span className="text-slate-200 ml-2 break-words">{hand.formData.gameType}</span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Stakes:</span>
              <span className="text-slate-200 ml-2">{hand.formData.smallBlind}/{hand.formData.bigBlind}</span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Position:</span>
              <span className="text-slate-200 ml-2">{hand.formData.heroPosition}</span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Stack Size:</span>
              <span className="text-slate-200 ml-2">{hand.formData.stackSize} BB</span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Format:</span>
              <span className="text-slate-200 ml-2">{hand.formData.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
          <div className="flex items-center space-x-4 sm:space-x-6">
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
  );
};
