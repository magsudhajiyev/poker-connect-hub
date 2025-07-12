'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  MoreHorizontal,
  Trash2,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { Post } from '@/models/post.model';
import { postsApi } from '@/services/postsApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: Post;
  formatTimeAgo: (dateString: string) => string;
  onPostDeleted?: (postId: string) => void;
}

export const PostCard = ({ post, formatTimeAgo, onPostDeleted }: PostCardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  // Check if user has liked this post
  useEffect(() => {
    if (user && localPost.likes) {
      setIsLiked(localPost.likes.includes(user.id || ''));
    }
  }, [user, localPost.likes]);

  // Update local state when post prop changes
  useEffect(() => {
    setLocalPost(post);
    setEditContent(post.content);
    setLikesCount(post.likeCount || 0);
    setComments(post.comments || []);
  }, [post]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like posts',
        variant: 'destructive',
      });
      return;
    }

    if (isLiking) {
      return;
    }

    // Optimistic update - immediately update UI
    const wasLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!wasLiked);
    setLikesCount(wasLiked ? previousCount - 1 : previousCount + 1);

    try {
      setIsLiking(true);
      const response = await postsApi.toggleLike(localPost._id as string);

      if (response.success && response.data) {
        // Update with server response
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likeCount);

        // Update local post likes array
        const updatedLikes = response.data.liked
          ? [...(localPost.likes || []), user.id || '']
          : (localPost.likes || []).filter((id) => id !== user.id);
        setLocalPost({ ...localPost, likes: updatedLikes, likeCount: response.data.likeCount });
      } else {
        // Revert on error
        setIsLiked(wasLiked);
        setLikesCount(previousCount);
        toast({
          title: 'Error',
          description: 'Failed to update like',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount(previousCount);
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

    if (!newComment.trim() || isCommenting) {
      return;
    }

    try {
      setIsCommenting(true);
      const response = await postsApi.addComment(post._id as string, newComment.trim());

      if (response.success && response.data) {
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
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await postsApi.deletePost(localPost._id as string);
      if (response.success) {
        toast({
          title: 'Post deleted',
          description: 'Your post has been deleted successfully.',
        });
        if (onPostDeleted) {
          onPostDeleted(localPost._id as string);
        }
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete post',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(localPost.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(localPost.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || isEditSaving) {
      return;
    }

    if (editContent === localPost.content) {
      setIsEditing(false);
      return;
    }

    try {
      setIsEditSaving(true);
      const response = await postsApi.editPost(localPost._id as string, editContent);

      if (response.success && response.data) {
        setLocalPost({ ...localPost, content: editContent });
        setIsEditing(false);
        toast({
          title: 'Post updated',
          description: 'Your post has been updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update post',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = typeof localPost.userId === 'object' ? localPost.userId._id : localPost.userId;
    if (userId) {
      router.push(`/profile/${userId}`);
    }
  };

  // Extract user info from populated or string userId
  const authorInfo = typeof localPost.userId === 'object' ? localPost.userId : null;
  const authorName = (authorInfo as any)?.name || 'Anonymous';
  const authorPicture = (authorInfo as any)?.picture || '';
  const isOwner = user && authorInfo && user.id === (authorInfo as any)?._id;

  return (
    <Card className="bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60 transition-colors">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <UserAvatar
          src={authorPicture}
          name={authorName}
          size="md"
          className="mr-2 sm:mr-3 flex-shrink-0 hover:ring-2 hover:ring-emerald-400/50 transition-all duration-200 cursor-pointer"
          onClick={handleUserClick}
        />
        <div className="flex-1 min-w-0">
          <h3
            className="text-slate-200 font-medium text-sm sm:text-base truncate hover:text-emerald-400 cursor-pointer transition-colors"
            onClick={handleUserClick}
          >
            {authorName}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            {formatTimeAgo(localPost.createdAt.toString())}
          </p>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                className="text-slate-200 hover:bg-slate-700 cursor-pointer"
                onClick={handleEdit}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-slate-700/30 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-emerald-500 min-h-[80px] text-sm sm:text-base"
                maxLength={500}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{editContent.length}/500 characters</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || isEditSaving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                  >
                    {isEditSaving ? (
                      <>
                        <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-200 text-sm sm:text-base whitespace-pre-wrap break-words">
              {localPost.content}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
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
              const commentUserName = (commentUser as any)?.name || 'Anonymous';

              const handleCommentUserClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                const commentUserId = (commentUser as any)?._id;
                if (commentUserId) {
                  router.push(`/profile/${commentUserId}`);
                }
              };

              return (
                <div key={comment._id?.toString() || index} className="flex space-x-3">
                  <UserAvatar
                    src={(commentUser as any)?.picture || ''}
                    name={commentUserName}
                    size="xs"
                    className="flex-shrink-0 hover:ring-2 hover:ring-emerald-400/50 transition-all duration-200 cursor-pointer"
                    onClick={handleCommentUserClick}
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
                      {formatTimeAgo(comment.createdAt.toString())}
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
                  className="bg-slate-700/30 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-emerald-500 min-h-[60px] flex-1 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isCommenting}
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
