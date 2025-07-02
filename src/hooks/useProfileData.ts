import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingEndpoints } from '@/services/authApi';

interface ProfileData {
  userData: {
    name: string;
    username: string;
    email: string;
    picture: string;
    bio: string;
    location?: string;
    preferredStakes?: string;
  };
  stats: {
    handsShared: number;
    followers: number;
    following: number;
    likesReceived: number;
  };
  loading: boolean;
  error: Error | null;
}

export const useProfileData = (): ProfileData => {
  const { user } = useAuth();
  const [bio, setBio] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [preferredStakes, setPreferredStakes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await onboardingEndpoints.getStatus();

        if (response.data?.success && response.data?.data?.onboardingData) {
          const onboardingData = response.data.data.onboardingData;

          // Get all onboarding fields
          setUsername(onboardingData.username || '');
          setBio(onboardingData.otherInfo || '');
          setLocation(onboardingData.location || '');
          setPreferredStakes(onboardingData.preferredStakes || '');
        }
      } catch (err) {
        console.error('Failed to fetch onboarding data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [user]);

  // Generate username from email if not available
  const generateUsername = (email: string): string => {
    const emailPrefix = email.split('@')[0];
    return `@${emailPrefix.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  // Get user data with fallbacks
  const userData = {
    name: user?.name || 'Anonymous User',
    username: username ? `@${username}` : generateUsername(user?.email || 'user@example.com'),
    email: user?.email || '',
    picture: user?.picture || '',
    bio: bio || 'Passionate poker player. Sharing hands and learning from the community.',
    location: location || undefined, // Only show if provided
    preferredStakes: preferredStakes || undefined, // Only show if provided
  };

  // Dummy stats data - structured for future API integration
  const stats = {
    handsShared: 1280,
    followers: 3476,
    following: 521,
    likesReceived: 9824,
  };

  return {
    userData,
    stats,
    loading,
    error,
  };
};
