'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit3, Settings, Check, Share, Users, UserPlus, UserMinus, ThumbsUp, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserProfileData } from '@/hooks/useUserProfileData';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileHeaderProps {
  userId?: string;
  isOwnProfile: boolean;
}

export const ProfileHeader = ({ userId, isOwnProfile }: ProfileHeaderProps) => {
  const router = useRouter();
  const { userData, stats: initialStats, loading } = useUserProfileData(userId);
  const { isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [stats, setStats] = useState(initialStats);

  // Update stats when initialStats changes
  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  // Fetch follow status on mount
  useEffect(() => {
    if (isAuthenticated && userId && !isOwnProfile) {
      fetchFollowStatus();
    }
  }, [userId, isAuthenticated, isOwnProfile]);

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow?_=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setIsFollowing(data.data.isFollowing);
        // Update stats with current counts from API
        setStats(prev => ({
          ...prev,
          followers: data.data.followersCount,
          following: data.data.followingCount,
        }));
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      // TODO: Could trigger login modal here
      alert('Please login to follow users');
      return;
    }

    setIsFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setIsFollowing(data.data.isFollowing);
        // Update stats with the actual counts from API
        setStats(prev => ({
          ...prev,
          followers: data.data.followersCount,
          following: data.data.followingCount,
        }));
      } else {
        alert(data.error?.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="bg-slate-900/60 rounded-xl border border-slate-700/20 p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col space-y-4 lg:space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20 lg:w-24 lg:h-24 border-2 border-slate-700/50">
              <AvatarImage src={userData.picture} />
              <AvatarFallback>{loading ? '...' : getInitials(userData.name)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-6 h-6 lg:w-7 lg:h-7 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-slate-800" />
            </div>
          </div>

          {/* Profile Info and Actions */}
          <div className="flex-1 text-center sm:text-left w-full min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-slate-200 truncate">
                  {loading ? 'Loading...' : userData.name}
                </h1>
                <p className="text-slate-400 text-sm lg:text-base break-words">
                  {loading ? '...' : userData.username}
                </p>
                <p className="text-slate-300 mt-2 text-sm lg:text-base leading-relaxed break-words">
                  {loading ? 'Loading bio...' : userData.bio}
                </p>

                {/* Location and Stakes Info */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs lg:text-sm">
                  {userData.location && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>{loading ? '...' : userData.location}</span>
                    </div>
                  )}
                  {userData.preferredStakes && (
                    <div className="text-slate-400">
                      <span className="text-slate-500">Stakes:</span>{' '}
                      {loading ? '...' : userData.preferredStakes}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 flex-shrink-0 w-full sm:w-auto">
                {isOwnProfile ? (
                  <>
                    <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-800 hover:from-emerald-600 hover:to-violet-600 text-sm w-full sm:w-auto">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSettingsClick}
                      className="border-slate-700/30 bg-slate-800/40 self-center sm:self-auto flex-shrink-0"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    className={isFollowing 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm w-full sm:w-auto'
                      : 'bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-800 hover:from-emerald-600 hover:to-violet-600 text-sm w-full sm:w-auto'
                    }
                  >
                    {isFollowLoading ? (
                      <>Loading...</>
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
          <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-0 min-w-0">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <Share className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm lg:text-lg font-semibold text-slate-200 truncate">
                {stats.handsShared.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 truncate">Hands Shared</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-0 min-w-0">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm lg:text-lg font-semibold text-slate-200 truncate">
                {stats.followers.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 truncate">Followers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-0 min-w-0">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-4 h-4 lg:w-5 lg:h-5 text-violet-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm lg:text-lg font-semibold text-slate-200 truncate">
                {stats.following.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 truncate">Following</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-0 min-w-0">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              <ThumbsUp className="w-4 h-4 lg:w-5 lg:h-5 text-pink-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm lg:text-lg font-semibold text-slate-200 truncate">
                {stats.likesReceived.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 truncate">Likes Received</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
