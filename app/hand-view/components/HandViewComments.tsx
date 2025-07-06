'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Trash2 } from 'lucide-react';
import { SharedHand, sharedHandsApi } from '@/services/sharedHandsApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface HandViewCommentsProps {
  hand?: SharedHand;
}

export const HandViewComments = ({ hand }: HandViewCommentsProps) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(hand?.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddComment = async () => {
    if (!comment.trim() || !user || !hand?._id) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await sharedHandsApi.addComment(hand._id, comment.trim());

      if (response.success && response.data) {
        // Add the new comment to the list
        setComments([...comments, response.data.comment]);
        setComment('');
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, index: number) => {
    if (!hand?._id || !user) {
      return;
    }

    try {
      const response = await sharedHandsApi.deleteComment(hand._id, commentId);

      if (response.success) {
        // Remove the comment from the list
        const newComments = [...comments];
        newComments.splice(index, 1);
        setComments(newComments);

        toast({
          title: 'Success',
          description: 'Comment deleted',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to delete comment',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-slate-800/40 border-slate-700/30 w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-200">Comments ({comments.length})</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        <div className="space-y-2">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.picture || ''} />
              <AvatarFallback>{user?.name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <Textarea
                placeholder="Share your thoughts on this hand..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 min-h-[100px] flex-1"
              />
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim() || isSubmitting || !user}
                className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Comments */}
        <div className="space-y-4 pt-4">
          {comments.length === 0 ? (
            <p className="text-slate-400 text-center">
              No comments yet. Be the first to share your analysis!
            </p>
          ) : (
            comments.map((commentItem, index) => {
              const commentUser =
                typeof commentItem.userId === 'object' ? commentItem.userId : null;
              const userName = commentUser?.name || 'Anonymous';
              const userPicture = commentUser?.picture || '';
              const isOwnComment = user && commentUser && commentUser._id === user.id;
              const commentId = (commentItem as any)._id;

              return (
                <div key={index} className="flex space-x-3 group">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={userPicture} />
                    <AvatarFallback>{userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-slate-700/30 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-300 text-sm font-medium">{userName}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-slate-400 text-xs">
                            {formatTimeAgo(commentItem.createdAt)}
                          </p>
                          {isOwnComment && commentId && (
                            <Button
                              onClick={() => handleDeleteComment(commentId, index)}
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-200 text-sm break-words">{commentItem.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
