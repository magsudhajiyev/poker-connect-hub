'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileTopBar } from './ProfileTopBar';
import { useSidebar } from '@/components/sidebar/SidebarContext';
import { PostComposer } from './PostComposer';
import { FeedPostCard } from './FeedPostCard';
import { SamplePostCard } from './SamplePostCard';
import { FeedHeader } from './FeedHeader';
import { sharedHandsStore, SharedHand } from '@/stores/sharedHandsStore';

export const FeedMainContent = () => {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const [sharedHands, setSharedHands] = useState<SharedHand[]>([]);

  useEffect(() => {
    // Initial load
    setSharedHands(sharedHandsStore.getHands());

    // Subscribe to updates
    const unsubscribe = sharedHandsStore.subscribe(() => {
      setSharedHands(sharedHandsStore.getHands());
    });
    return unsubscribe;
  }, []);

  const handleHandClick = (handId: string) => {
    router.push(`/hand-view?id=${handId}`);
  };

  const formatTimeAgo = (date: Date) => {
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
                {sharedHands.map((hand) => (
                  <FeedPostCard
                    key={hand.id}
                    hand={hand}
                    onHandClick={handleHandClick}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}

                {/* Sample static posts for demo */}
                {[1, 2].map((item) => (
                  <SamplePostCard key={`sample-${item}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
