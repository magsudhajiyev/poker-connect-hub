'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { SharedHand, sharedHandsApi } from '@/services/sharedHandsApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface HandViewCardProps {
  hand: SharedHand;
}

export const HandViewCard = ({ hand }: HandViewCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(hand.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  // Check if user has liked this hand
  useEffect(() => {
    if (user && hand.likes) {
      setIsLiked(hand.likes.includes(user.id || ''));
    }
  }, [user, hand.likes]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like hands',
        variant: 'destructive',
      });
      return;
    }

    if (isLiking) {
      return;
    }

    try {
      setIsLiking(true);
      const response = await sharedHandsApi.toggleLike(hand._id, user?.email);

      if (response.success && response.data) {
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likeCount);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update like',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    }
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const authorInfo = typeof hand.userId === 'object' ? hand.userId : null;
  const authorName = authorInfo?.name || 'Anonymous';
  const authorPicture = authorInfo?.picture || '';

  const handleUserClick = () => {
    toast({
      title: 'User Profiles',
      description: 'User profile viewing is coming soon!',
    });
  };

  return (
    <Card className="bg-slate-800/40 border-slate-700/30 w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <UserAvatar
          src={authorPicture}
          name={authorName}
          size="lg"
          className="mr-4 flex-shrink-0 hover:ring-2 hover:ring-emerald-400/50 transition-all duration-200"
          onClick={handleUserClick}
        />
        <div className="flex-1 min-w-0">
          <h3
            className="text-slate-200 font-medium text-lg truncate hover:text-emerald-400 cursor-pointer transition-colors"
            onClick={handleUserClick}
          >
            {authorName}
          </h3>
          <p className="text-slate-400">{formatTimeAgo(hand.createdAt)}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 mb-3 break-words">
            {hand.title || 'Poker Hand Analysis'}
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed break-words">
            {hand.description || `${hand.gameType} hand analysis`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(hand.tags || []).map((tag) => (
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
              <span className="text-slate-200 ml-2 break-words">{hand.gameType}</span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Stakes:</span>
              <span className="text-slate-200 ml-2">
                {hand.analysis?.smallBlind || 'N/A'}/{hand.analysis?.bigBlind || 'N/A'}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Position:</span>
              <span className="text-slate-200 ml-2">{hand.positions?.heroPosition || 'N/A'}</span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Table Size:</span>
              <span className="text-slate-200 ml-2">{hand.tableSize} Players</span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400">Format:</span>
              <span className="text-slate-200 ml-2">
                {hand.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`transition-all duration-200 ${
                isLiked ? 'text-red-500 hover:text-red-400' : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <Heart
                className={`w-5 h-5 mr-2 transition-all duration-200 ${
                  isLiked ? 'fill-current scale-110' : ''
                }`}
              />
              {likesCount}
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
              <MessageCircle className="w-5 h-5 mr-2" />
              {hand.commentCount || 0}
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
