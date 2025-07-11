'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileTopBar } from '@/components/shared/ProfileTopBar';
import { useSidebar } from '@/components/sidebar/SidebarContext';
import { PostComposer } from '@/components/feed/PostComposer';
import { FeedPostCard } from '@/components/feed/FeedPostCard';
import { PostCard } from '@/components/feed/PostCard';
// import { SamplePostCard } from '@/components/feed/SamplePostCard';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { sharedHandsApi, SharedHand } from '@/services/sharedHandsApi';
import { postsApi } from '@/services/postsApi';
import { Post } from '@/models/post.model';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const FeedMainContent = () => {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const [sharedHands, setSharedHands] = useState<SharedHand[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [handsPage, setHandsPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMoreHands, setHasMoreHands] = useState(true);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [feedItems, setFeedItems] = useState<
    Array<{ type: 'hand' | 'post'; item: SharedHand | Post; date: Date }>
  >([]);

  const fetchHands = async (pageNum: number) => {
    try {
      const response = await sharedHandsApi.getSharedHands({
        page: pageNum,
        limit: 10,
      });

      if (response.success && response.data) {
        const { hands } = response.data;
        setHasMoreHands(hands.length === 10);
        return hands;
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to load hands',
        variant: 'destructive',
      });
    }
    return [];
  };

  const fetchPosts = async (pageNum: number) => {
    try {
      const response = await postsApi.listPosts({
        page: pageNum,
        pageSize: 10,
      });

      if (response.success && response.data) {
        const { posts } = response.data;
        setHasMorePosts(posts.length === 10);
        return posts;
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    }
    return [];
  };

  const fetchFeedData = async (initial = false) => {
    try {
      setIsLoading(true);

      const [handsData, postsData] = await Promise.all([
        fetchHands(initial ? 1 : handsPage),
        fetchPosts(initial ? 1 : postsPage),
      ]);

      if (initial) {
        setSharedHands(handsData);
        setPosts(postsData);
      } else {
        setSharedHands((prev) => [...prev, ...handsData]);
        setPosts((prev) => [...prev, ...postsData]);
      }

      // Combine and sort all items by date
      const allItems = [...sharedHands, ...handsData, ...posts, ...postsData];

      const combined = allItems.map((item) => {
        if ('gameType' in item) {
          // It's a hand
          return {
            type: 'hand' as const,
            item: item as SharedHand,
            date: new Date(item.createdAt),
          };
        } else {
          // It's a post
          return {
            type: 'post' as const,
            item: item as Post,
            date: new Date(item.createdAt),
          };
        }
      });

      // Sort by date (newest first)
      combined.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Remove duplicates
      const uniqueItems = combined.filter((item, index, self) => {
        return (
          index ===
          self.findIndex((i) => {
            if (item.type === 'hand' && i.type === 'hand') {
              return (item.item as SharedHand)._id === (i.item as SharedHand)._id;
            } else if (item.type === 'post' && i.type === 'post') {
              return (item.item as Post)._id === (i.item as Post)._id;
            }
            return false;
          })
        );
      });

      setFeedItems(uniqueItems);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to load feed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHandClick = (handId: string) => {
    router.push(`/hand-view/${handId}`);
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

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((p) => p._id !== postId));
    setFeedItems(
      feedItems.filter((item) => !(item.type === 'post' && (item.item as Post)._id === postId)),
    );
  };

  const handlePostCreated = (newPost: Post) => {
    // Add to posts array
    setPosts([newPost, ...posts]);

    // Add to feed items at the beginning
    const newFeedItem = {
      type: 'post' as const,
      item: newPost,
      date: new Date(newPost.createdAt),
    };

    setFeedItems([newFeedItem, ...feedItems]);
  };

  const loadMore = async () => {
    if (!isLoading && (hasMoreHands || hasMorePosts)) {
      const nextHandsPage = handsPage + 1;
      const nextPostsPage = postsPage + 1;
      setHandsPage(nextHandsPage);
      setPostsPage(nextPostsPage);
      await fetchFeedData(false);
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
    >
      {/* Mobile Header */}
      <FeedHeader />

      {/* Desktop Profile Top Bar */}
      <div className="hidden lg:block">
        <ProfileTopBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-14 lg:pt-0 overflow-hidden">
        <div className="w-full h-full overflow-y-auto">
          <div className="px-4 lg:px-6 py-4 lg:py-6">
            <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">
                  Your Poker Feed
                </h1>
              </div>

              {/* Post Composer */}
              <PostComposer onPostCreated={handlePostCreated} />

              <div className="space-y-4 sm:space-y-6">
                {isLoading && feedItems.length === 0 ? (
                  // Loading skeletons
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-slate-900/50 rounded-lg p-6">
                        <Skeleton className="h-4 w-1/4 mb-4" />
                        <Skeleton className="h-20 w-full mb-4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {feedItems.map((feedItem) => {
                      if (feedItem.type === 'hand') {
                        const hand = feedItem.item as SharedHand;
                        return (
                          <FeedPostCard
                            key={`hand-${hand._id}`}
                            hand={hand}
                            onHandClick={handleHandClick}
                            formatTimeAgo={formatTimeAgo}
                          />
                        );
                      } else {
                        const post = feedItem.item as Post;
                        return (
                          <PostCard
                            key={`post-${post._id}`}
                            post={post}
                            formatTimeAgo={formatTimeAgo}
                            onPostDeleted={handlePostDeleted}
                          />
                        );
                      }
                    })}

                    {/* Load more button */}
                    {(hasMoreHands || hasMorePosts) && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={loadMore}
                          disabled={isLoading}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}

                    {/* Show message when no content */}
                    {!isLoading && feedItems.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-slate-400">
                          No posts or hands shared yet. Be the first to share!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
