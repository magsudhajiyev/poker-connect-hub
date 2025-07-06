'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileTopBar } from '@/components/shared/ProfileTopBar';
import { useSidebar } from '@/components/sidebar/SidebarContext';
import { PostComposer } from '@/components/feed/PostComposer';
import { FeedPostCard } from '@/components/feed/FeedPostCard';
// import { SamplePostCard } from '@/components/feed/SamplePostCard';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { sharedHandsApi, SharedHand } from '@/services/sharedHandsApi';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const FeedMainContent = () => {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const [sharedHands, setSharedHands] = useState<SharedHand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHands = async (pageNum: number, append = false) => {
    try {
      setIsLoading(true);
      const response = await sharedHandsApi.getSharedHands({
        page: pageNum,
        limit: 10,
      });

      if (response.success && response.data) {
        const { hands } = response.data;
        if (append) {
          setSharedHands((prev) => [...prev, ...hands]);
        } else {
          setSharedHands(hands);
        }
        setHasMore(hands.length === 10);
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load hands',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to load hands',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHands(1);
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

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHands(nextPage, true);
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
              <PostComposer />

              <div className="space-y-4 sm:space-y-6">
                {isLoading && sharedHands.length === 0 ? (
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
                    {sharedHands.map((hand) => (
                      <FeedPostCard
                        key={hand._id}
                        hand={hand}
                        onHandClick={handleHandClick}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}

                    {/* Load more button */}
                    {hasMore && (
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

                    {/* Show message when no hands */}
                    {!isLoading && sharedHands.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-slate-400">
                          No hands shared yet. Be the first to share!
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
