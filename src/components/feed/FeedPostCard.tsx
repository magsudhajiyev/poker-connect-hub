
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp } from 'lucide-react';
import { SharedHand } from '@/stores/sharedHandsStore';

interface FeedPostCardProps {
  hand: SharedHand;
  onHandClick: (handId: string) => void;
  formatTimeAgo: (date: Date) => string;
}

export const FeedPostCard = ({ hand, onHandClick, formatTimeAgo }: FeedPostCardProps) => {
  return (
    <Card 
      className="bg-slate-800/40 border-slate-700/30 cursor-pointer hover:bg-slate-800/60 transition-colors" 
      onClick={() => onHandClick(hand.id)}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 flex-shrink-0">
          <AvatarImage src={hand.authorAvatar} />
          <AvatarFallback>{hand.authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-200 font-medium text-sm sm:text-base truncate">{hand.authorName}</h3>
          <p className="text-slate-400 text-xs sm:text-sm">{formatTimeAgo(hand.createdAt)}</p>
        </div>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs flex-shrink-0">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">{hand.formData.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}</span>
          <span className="sm:hidden">{hand.formData.gameFormat === 'mtt' ? 'MTT' : 'Cash'}</span>
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3">
          <h4 className="text-slate-200 font-medium mb-2 text-sm sm:text-base break-words">
            {hand.formData.title || 'Poker Hand Analysis'}
          </h4>
          <p className="text-slate-300 mb-3 text-sm sm:text-base line-clamp-2 break-words">
            {hand.formData.description || `${hand.formData.gameType} hand from ${hand.formData.heroPosition} vs ${hand.formData.villainPosition}`}
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
            {hand.tags.slice(0, 2).map(tag => (
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
  );
};
