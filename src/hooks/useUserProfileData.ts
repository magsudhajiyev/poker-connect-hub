import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingEndpoints } from '@/services/authApi';
import { sharedHandsApi } from '@/services/sharedHandsApi';

interface ProfileData {
  userData: {
    _id: string;
    name: string;
    username: string;
    email: string;
    picture: string;
    bio: string;
    location?: string;
    preferredStakes?: string;
    authProvider?: string;
    createdAt?: string;
    hasCompletedOnboarding?: boolean;
  };
  stats: {
    handsShared: number;
    followers: number;
    following: number;
    likesReceived: number;
    totalComments?: number;
  };
  loading: boolean;
  error: Error | null;
}

export const useUserProfileData = (userId?: string): ProfileData => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    userData: {
      _id: '',
      name: '',
      username: '',
      email: '',
      picture: '',
      bio: '',
    },
    stats: {
      handsShared: 0,
      followers: 0,
      following: 0,
      likesReceived: 0,
    },
    loading: true,
    error: null,
  });

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      setProfileData((prev) => ({ ...prev, loading: true, error: null }));

      try {
        if (isOwnProfile && user) {
          // Fetch own profile data from onboarding API
          const response = await onboardingEndpoints.getStatus();

          if (response.data?.success && response.data?.data?.onboardingData) {
            const onboardingData = response.data.data.onboardingData;

            setProfileData((prev) => ({
              ...prev,
              userData: {
                _id: user.id || '',
                name: user.name || 'Anonymous User',
                username: onboardingData.username
                  ? `@${onboardingData.username.toLowerCase()}`
                  : `@${user.email?.split('@')[0] || 'user'}`,
                email: user.email || '',
                picture: user.picture || '',
                bio:
                  onboardingData.otherInfo ||
                  'Passionate poker player. Sharing hands and learning from the community.',
                location: onboardingData.location || undefined,
                preferredStakes: onboardingData.preferredStakes || undefined,
                createdAt: user.createdAt,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
              },
              // Temporary dummy stats for own profile
              stats: {
                handsShared: 1280,
                followers: 3476,
                following: 521,
                likesReceived: 9824,
              },
              loading: false,
            }));
          }
        } else if (userId) {
          // Fetch other user's profile data
          const response = await sharedHandsApi.getUserProfile(userId);

          if (response.success && response.data) {
            const { user: userData, stats } = response.data;

            setProfileData({
              userData: {
                _id: userData._id,
                name: userData.name || 'Anonymous User',
                username: `@${userData.email?.split('@')[0] || 'user'}`,
                email: userData.email || '',
                picture: userData.image || '',
                bio: 'Passionate poker player. Sharing hands and learning from the community.',
                authProvider: userData.authProvider,
                createdAt: userData.createdAt,
                hasCompletedOnboarding: userData.hasCompletedOnboarding,
              },
              stats: {
                handsShared: stats.totalHands,
                followers: 0, // To be implemented
                following: 0, // To be implemented
                likesReceived: stats.totalLikes,
                totalComments: stats.totalComments,
              },
              loading: false,
              error: null,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setProfileData((prev) => ({
          ...prev,
          loading: false,
          error: err as Error,
        }));
      }
    };

    fetchProfileData();
  }, [userId, user, isOwnProfile]);

  return profileData;
};
