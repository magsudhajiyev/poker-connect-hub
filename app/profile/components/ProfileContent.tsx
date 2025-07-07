'use client';

import { ProfileStats } from './ProfileStats';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserMinus } from 'lucide-react';

interface ProfileContentProps {
  activeTab: string;
  userId?: string;
  isOwnProfile: boolean;
}

interface UserData {
  id: string;
  name: string;
  username: string;
  picture: string;
  followedAt: string;
}


export const ProfileContent = ({
  activeTab,
  userId,
  isOwnProfile,
}: ProfileContentProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [followers, setFollowers] = useState<UserData[]>([]);
  const [following, setFollowing] = useState<UserData[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followStatus, setFollowStatus] = useState<{ [key: string]: boolean }>({});

  // Use current user's ID if viewing own profile
  const profileUserId = userId || user?.id;

  // Fetch followers when tab is active
  useEffect(() => {
    if (activeTab === 'followers' && profileUserId) {
      fetchFollowers();
    }
  }, [activeTab, profileUserId]);

  // Fetch following when tab is active
  useEffect(() => {
    if (activeTab === 'following' && profileUserId) {
      fetchFollowing();
    }
  }, [activeTab, profileUserId]);

  const fetchFollowers = async () => {
    setFollowersLoading(true);
    try {
      const response = await fetch(`/api/users/${profileUserId}/followers?_=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setFollowers(data.data.followers);
        setFollowersCount(data.data.pagination.totalCount);
        
        // Fetch follow status for each follower if logged in
        if (user) {
          const statusPromises = data.data.followers.map((follower: UserData) =>
            fetch(`/api/users/${follower.id}/follow?_=${Date.now()}`).then(res => res.json()),
          );
          const statuses = await Promise.all(statusPromises);
          const statusMap: { [key: string]: boolean } = {};
          statuses.forEach((status, index) => {
            if (status.success) {
              statusMap[data.data.followers[index].id] = status.data.isFollowing;
            }
          });
          setFollowStatus(statusMap);
        }
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setFollowersLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setFollowingLoading(true);
    try {
      const response = await fetch(`/api/users/${profileUserId}/following?_=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setFollowing(data.data.following);
        setFollowingCount(data.data.pagination.totalCount);
        
        // Set all following users as followed
        const statusMap: { [key: string]: boolean } = {};
        data.data.following.forEach((user: UserData) => {
          statusMap[user.id] = true;
        });
        setFollowStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) {
      alert('Please login to follow users');
      return;
    }

    const isCurrentlyFollowing = followStatus[targetUserId];
    const method = isCurrentlyFollowing ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setFollowStatus(prev => ({
          ...prev,
          [targetUserId]: data.data.isFollowing,
        }));
        
        // Refresh the followers/following lists to reflect changes
        if (activeTab === 'followers') {
          fetchFollowers();
        } else if (activeTab === 'following') {
          fetchFollowing();
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const navigateToProfile = (profileUserId: string) => {
    router.push(`/profile/${profileUserId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  if (activeTab === 'stats') {
    return <ProfileStats />;
  }

  if (activeTab === 'hands') {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-200">Recent Hands</h2>
          <div className="text-xs sm:text-sm text-slate-400">Showing 24 of 1,280 hands</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-slate-900/60 border-slate-700/20 hover:border-slate-600/30 transition-colors"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm text-slate-400">Hand #{1280 - i}</div>
                  <div className="text-xs sm:text-sm text-emerald-500 font-medium">+$124</div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <div className="w-6 h-9 sm:w-8 sm:h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-xs text-slate-200">
                      A♠
                    </div>
                    <div className="w-6 h-9 sm:w-8 sm:h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-xs text-slate-200">
                      K♥
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">vs 3 players</div>
                </div>
                <div className="text-xs text-slate-500">NL50 • 6-max • Position: BTN</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'followers') {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-200">Followers</h2>
          <div className="text-xs sm:text-sm text-slate-400">
            {followersLoading ? 'Loading...' : `${followersCount} followers`}
          </div>
        </div>

        {followersLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Loading followers...</p>
          </div>
        ) : followers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No followers yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {followers.map((follower) => (
              <Card key={follower.id} className="bg-slate-900/60 border-slate-700/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar 
                      className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer"
                      onClick={() => navigateToProfile(follower.id)}
                    >
                      <AvatarImage src={follower.picture} />
                      <AvatarFallback>{getInitials(follower.name)}</AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigateToProfile(follower.id)}
                    >
                      <div className="font-medium text-slate-200 text-sm sm:text-base truncate">
                        {follower.name}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 truncate">
                        {follower.username}
                      </div>
                    </div>
                    {user && user.id !== follower.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFollowToggle(follower.id)}
                        className={followStatus[follower.id]
                          ? 'border-slate-700/30 bg-slate-800/40 text-xs sm:text-sm flex-shrink-0'
                          : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs sm:text-sm flex-shrink-0'
                        }
                      >
                        {followStatus[follower.id] ? (
                          <>
                            <UserMinus className="w-3 h-3 mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'following') {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-200">Following</h2>
          <div className="text-xs sm:text-sm text-slate-400">
            {followingLoading ? 'Loading...' : `${followingCount} following`}
          </div>
        </div>

        {followingLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Loading following...</p>
          </div>
        ) : following.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Not following anyone yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {following.map((user) => (
              <Card key={user.id} className="bg-slate-900/60 border-slate-700/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar 
                      className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer"
                      onClick={() => navigateToProfile(user.id)}
                    >
                      <AvatarImage src={user.picture} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigateToProfile(user.id)}
                    >
                      <div className="font-medium text-slate-200 text-sm sm:text-base truncate">
                        {user.name}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 truncate">
                        {user.username}
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFollowToggle(user.id)}
                        className="border-slate-700/30 bg-slate-800/40 text-xs sm:text-sm flex-shrink-0"
                      >
                        <UserMinus className="w-3 h-3 mr-1" />
                        Following
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center py-8 sm:py-12">
        <h3 className="text-base sm:text-lg font-medium text-slate-200 mb-2">
          {activeTab === 'likes' && 'Liked Hands'}
        </h3>
        <p className="text-slate-400 text-sm sm:text-base">
          Content for {activeTab} will be displayed here.
        </p>
      </div>
    </div>
  );
};
