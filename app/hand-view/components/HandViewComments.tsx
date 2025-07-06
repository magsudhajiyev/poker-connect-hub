'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { SharedHand } from '@/services/sharedHandsApi';
import { useAuth } from '@/contexts/AuthContext';

interface HandViewCommentsProps {
  hand?: SharedHand;
}

export const HandViewComments = ({ hand }: HandViewCommentsProps) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(hand?.comments || []);

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

  const handleAddComment = () => {
    if (comment.trim() && user) {
      const newComment = {
        userId: {
          _id: user.id || '',
          name: user.name || 'Anonymous',
          picture: user.picture || '',
        },
        content: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      setComments([...comments, newComment]);
      setComment('');
      // TODO: Call API to add comment
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
                disabled={!comment.trim()}
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

              return (
                <div key={index} className="flex space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={userPicture} />
                    <AvatarFallback>{userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-slate-700/30 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-300 text-sm font-medium">{userName}</p>
                        <p className="text-slate-400 text-xs">
                          {formatTimeAgo(commentItem.createdAt)}
                        </p>
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
