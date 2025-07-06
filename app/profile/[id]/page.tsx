'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Calendar, Heart, MessageSquare, BookOpen, TrendingUp } from 'lucide-react';
import { UserProfile, sharedHandsApi } from '@/services/sharedHandsApi';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = params.id as string;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        return;
      }

      try {
        const response = await sharedHandsApi.getUserProfile(userId);

        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to load profile',
            variant: 'destructive',
          });
        }
      } catch (_error) {
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    }
    if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleHandClick = (handId: string) => {
    router.push(`/hand-view/${handId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-slate-700 h-48 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 h-32 rounded-lg"></div>
              <div className="bg-slate-700 h-32 rounded-lg"></div>
              <div className="bg-slate-700 h-32 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-slate-200 mb-2">User Not Found</h1>
              <p className="text-slate-400">The user profile you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <UserAvatar
                src={profile.user.image}
                name={profile.user.name}
                size="xl"
                className="flex-shrink-0"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-200 mb-2">{profile.user.name}</h1>
                <p className="text-slate-400 mb-4">{profile.user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Member since {formatDate(profile.user.createdAt)}
                  </Badge>
                  <Badge variant="secondary" className="bg-violet-500/20 text-violet-400">
                    {profile.user.authProvider === 'google' ? 'Google' : 'Email'} Account
                  </Badge>
                  {profile.user.hasCompletedOnboarding && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      Onboarded
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Hands</p>
                  <p className="text-2xl font-bold text-slate-200">{profile.stats.totalHands}</p>
                </div>
                <BookOpen className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold text-slate-200">{profile.stats.totalLikes}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Comments</p>
                  <p className="text-2xl font-bold text-slate-200">{profile.stats.totalComments}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Hands */}
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-200">Recent Hands</h2>
          </CardHeader>
          <CardContent>
            {profile.recentHands.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No public hands shared yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.recentHands.map((hand) => (
                  <div
                    key={hand._id}
                    onClick={() => handleHandClick(hand._id)}
                    className="bg-slate-700/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-200">{hand.title}</h3>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-400 text-xs"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {hand.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">{hand.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{formatTimeAgo(hand.createdAt)}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {hand.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {hand.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
