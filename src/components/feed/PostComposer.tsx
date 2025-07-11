'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Image, Smile, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { postsApi } from '@/services/postsApi';
import { toast } from '@/hooks/use-toast';
import { Post } from '@/models/post.model';

interface PostComposerProps {
  onPostCreated?: (post: Post) => void;
}

export const PostComposer = ({ onPostCreated }: PostComposerProps = {}) => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleShareHand = () => {
    router.push('/share-hand');
  };

  const handlePost = async () => {
    if (!content.trim() || isPosting) {
      return;
    }

    try {
      setIsPosting(true);
      const response = await postsApi.createPost({ content });

      if (response.success && response.data) {
        setContent('');
        toast({
          title: 'Posted successfully',
          description: 'Your post has been shared with the community.',
        });

        // Call the callback if provided
        if (onPostCreated) {
          onPostCreated(response.data);
        } else {
          // Fallback to refresh if no callback
          router.refresh();
        }
      } else {
        toast({
          title: 'Failed to post',
          description: response.error || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="bg-slate-800/40 border-slate-700/30 mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <UserAvatar src={user?.picture} name={user?.name} size="md" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-900/60 border-slate-700/30 text-slate-200 placeholder-slate-400 resize-none min-h-[50px] sm:min-h-[60px] focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 sm:mt-3 gap-2 sm:gap-0">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-200 p-1.5 sm:p-2 flex-shrink-0"
                >
                  <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Photo</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-200 p-1.5 sm:p-2 flex-shrink-0"
                >
                  <Smile className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Feeling</span>
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleShareHand}
                  className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 hover:from-emerald-600 hover:to-violet-600 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-initial"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="truncate">Share Hand</span>
                </Button>
                <Button
                  onClick={handlePost}
                  disabled={!content.trim() || isPosting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed px-3 sm:px-4 py-2 flex-shrink-0"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
