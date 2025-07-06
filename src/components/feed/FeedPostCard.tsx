'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Send } from 'lucide-react';
import { SharedHand, sharedHandsApi } from '@/services/sharedHandsApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface FeedPostCardProps {
  hand: SharedHand;
  onHandClick: (handId: string) => void;
  formatTimeAgo: (dateString: string) => string;
}

export const FeedPostCard = ({ hand, onHandClick, formatTimeAgo }: FeedPostCardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(hand.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(hand.comments || []);
  const [isLiking, setIsLiking] = useState(false);

  // Check if user has liked this hand
  useEffect(() => {
    if (user && hand.likes) {
      setIsLiked(hand.likes.includes(user.id || ''));
    }
  }, [user, hand.likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

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

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await sharedHandsApi.addComment(hand._id, newComment.trim());

      if (response.success && response.data) {
        // Add the new comment to the list
        setComments([...comments, response.data.comment]);
        setNewComment('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add comment',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleCardClick = () => {
    onHandClick(hand._id);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = typeof hand.userId === 'object' ? hand.userId._id : hand.userId;
    if (userId) {
      router.push(`/profile/${userId}`);
    }
  };

  // Extract user info from populated or string userId
  const authorInfo = typeof hand.userId === 'object' ? hand.userId : null;
  const authorName = authorInfo?.name || 'Anonymous';
  const authorPicture = authorInfo?.picture || '';

  return (
    <Card className="bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60 transition-colors">
      <CardHeader
        className="flex flex-row items-center space-y-0 pb-3 cursor-pointer"
        onClick={handleCardClick}
      >
        <UserAvatar
          src={authorPicture}
          name={authorName}
          size="md"
          className="mr-2 sm:mr-3 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3
            className="text-slate-200 font-medium text-sm sm:text-base truncate hover:text-emerald-400 cursor-pointer transition-colors"
            onClick={handleUserClick}
          >
            {authorName}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">{formatTimeAgo(hand.createdAt)}</p>
        </div>
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-400 text-xs flex-shrink-0"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">
            {hand.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}
          </span>
          <span className="sm:hidden">{hand.gameFormat === 'mtt' ? 'MTT' : 'Cash'}</span>
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3 cursor-pointer" onClick={handleCardClick}>
          <h4 className="text-slate-200 font-medium mb-2 text-sm sm:text-base break-words">
            {hand.title || 'Poker Hand Analysis'}
          </h4>
          <p className="text-slate-300 mb-3 text-sm sm:text-base line-clamp-2 break-words">
            {hand.description || `${hand.gameType} hand analysis`}
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
            {(hand.tags || []).slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-violet-500/20 text-violet-400 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {(hand.tags || []).length > 2 && (
              <Badge variant="secondary" className="bg-slate-500/20 text-slate-400 text-xs">
                +{(hand.tags || []).length - 2}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`p-1 sm:p-2 transition-all duration-200 ${
                isLiked ? 'text-red-500 hover:text-red-400' : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <Heart
                className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 transition-all duration-200 ${
                  isLiked ? 'fill-current scale-110' : ''
                }`}
              />
              <span className="text-xs sm:text-sm">{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentClick}
              className={`p-1 sm:p-2 ${
                showComments ? 'text-slate-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">{comments.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 p-1 sm:p-2"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 p-1 sm:p-2"
          >
            <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-3 border-t border-slate-700/30 pt-4">
            {/* Existing Comments */}
            {comments.map((comment, index) => {
              const commentUser = typeof comment.userId === 'object' ? comment.userId : null;
              const commentUserName = commentUser?.name || 'Anonymous';
              const commentUserId = commentUser?._id;

              const handleCommentUserClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (commentUserId) {
                  router.push(`/profile/${commentUserId}`);
                }
              };

              return (
                <div key={index} className="flex space-x-3">
                  <UserAvatar
                    src={commentUser?.picture || ''}
                    name={commentUserName}
                    size="xs"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-slate-700/30 rounded-lg px-3 py-2">
                      <p
                        className="text-slate-300 text-sm font-medium hover:text-emerald-400 cursor-pointer transition-colors"
                        onClick={handleCommentUserClick}
                      >
                        {commentUserName}
                      </p>
                      <p className="text-slate-200 text-sm mt-1 break-words">{comment.content}</p>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      {formatTimeAgo(comment.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Comment Input */}
            <div className="flex space-x-3">
              <UserAvatar
                src={user?.picture}
                name={user?.name}
                size="xs"
                className="flex-shrink-0"
              />
              <div className="flex-1 flex space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-slate-700/30 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-emerald-500 min-h-[60px] flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
