'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Target,
  TrendingUp,
  Users,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onboardingEndpoints } from '@/services/authApi';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  // Password setup state
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAddingPassword, setIsAddingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    experience: '',
    favoriteGame: '',
    playingGoals: [] as string[],
    bio: '',
    location: '',
    preferredStakes: '',
    // Password setup fields
    password: '',
    confirmPassword: '',
  });
  const router = useRouter();
  const { user, loading, refreshAuth } = useAuth();
  const checkUsernameTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle authentication and onboarding status
  useEffect(() => {
    // Wait for auth context to load
    if (loading) {
      return;
    }

    // Add a delay before checking user to ensure auth context is fully loaded
    // This prevents the race condition where user is null during initial load
    const checkAuthTimer = setTimeout(() => {
      // If not authenticated after loading and delay, redirect to signin
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // If user has already completed onboarding, redirect to feed
      if (user.hasCompletedOnboarding) {
        router.push('/feed');
        return;
      }

      // User is authenticated and needs onboarding
      setIsInitializing(false);
    }, 500); // Give auth context time to sync with cookies

    return () => clearTimeout(checkAuthTimer);
  }, [user, loading, router]);

  // Show loading while checking auth status
  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If we reach here without a user, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // Check if user needs password setup (Google user without password)
  const needsPasswordSetup = user && !user.hasPassword;

  const steps = [
    // Conditionally include password setup step for Google users
    ...(needsPasswordSetup
      ? [
          {
            title: 'Secure Your Account 🔐',
            subtitle: 'Create a password for additional security (optional)',
            icon: Lock,
            emoji: '🔐',
          },
        ]
      : []),
    {
      title: 'Welcome to PokerConnect! 🎉',
      subtitle: "Let's set up your profile",
      icon: User,
      emoji: '🎉',
    },
    {
      title: 'Tell us about your poker experience 🃏',
      subtitle: 'This helps us personalize your experience',
      icon: Target,
      emoji: '🃏',
    },
    {
      title: 'What are your poker goals? 🚀',
      subtitle: 'Select all that apply',
      icon: TrendingUp,
      emoji: '🚀',
    },
    {
      title: 'Complete your profile ✨',
      subtitle: 'Add some final details',
      icon: Users,
      emoji: '✨',
    },
  ];
  const experienceLevels = [
    {
      value: 'beginner',
      label: 'Beginner 🌱',
      description: 'Just getting started',
    },
    {
      value: 'intermediate',
      label: 'Intermediate 🎲',
      description: 'Some experience',
    },
    {
      value: 'advanced',
      label: 'Advanced ♠️',
      description: 'Experienced player',
    },
    {
      value: 'professional',
      label: 'Professional 👑',
      description: 'Play for a living',
    },
  ];
  const gameTypes = [
    "Texas Hold'em 🤠",
    'Omaha 🎯',
    'Seven Card Stud 🎴',
    'Mixed Games 🎪',
    'Tournaments 🏆',
    'Cash Games 💰',
  ];
  const goalOptions = [
    'Improve my game 📚',
    'Connect with other players 🤝',
    'Share interesting hands 💡',
    'Learn new strategies 🧠',
    'Track my progress 📊',
    'Join poker discussions 💬',
  ];

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const issues = [];
    if (password.length < 8) {
      issues.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('One lowercase letter');
    }
    if (!/\d/.test(password)) {
      issues.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('One special character');
    }
    return issues;
  };

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and dashes');
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      const response = await onboardingEndpoints.checkUsername(username);

      if (response.data?.success) {
        if (!response.data.data.available) {
          setUsernameError('Username is already taken');
        }
      }
    } catch (_error) {
      // Don't set error state, allow user to continue
      // Network issues shouldn't block onboarding
    } finally {
      setIsCheckingUsername(false);
    }
  };
  const handleUsernameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      username: value,
    }));
    setUsernameError('');

    // Clear any existing timeout
    if (checkUsernameTimeoutRef.current) {
      clearTimeout(checkUsernameTimeoutRef.current);
    }

    // Set validation error immediately for invalid format
    if (value.length > 0) {
      if (value.length < 3) {
        setUsernameError('Username must be at least 3 characters');
        return;
      }

      if (value.length > 20) {
        setUsernameError('Username must be less than 20 characters');
        return;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        setUsernameError('Username can only contain letters, numbers, underscores, and dashes');
        return;
      }
    }

    // Debounce the API call
    if (value.length >= 3) {
      setIsCheckingUsername(true);
      checkUsernameTimeoutRef.current = setTimeout(() => {
        checkUsername(value);
      }, 500);
    }
  };
  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      playingGoals: prev.playingGoals.includes(goal)
        ? prev.playingGoals.filter((g) => g !== goal)
        : [...prev.playingGoals, goal],
    }));
  };
  const handleNext = async () => {
    // Handle password setup step
    if (needsPasswordSetup && currentStep === 0) {
      if (formData.password) {
        // User wants to add password - validate and submit
        const passwordIssues = validatePassword(formData.password);
        if (passwordIssues.length > 0) {
          setPasswordErrors({ password: `Password must have: ${passwordIssues.join(', ')}` });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setPasswordErrors({ confirmPassword: 'Passwords do not match' });
          return;
        }

        setIsAddingPassword(true);
        setPasswordErrors({});

        try {
          const response = await fetch('/api/auth/add-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              password: formData.password,
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Refresh auth context to update user data
            await refreshAuth();
            // After password setup, move to step 1 (username step)
            // Since needsPasswordSetup will become false after refreshAuth,
            // we need to set currentStep to 1 to show the first regular step
            setCurrentStep(1);
          } else {
            setPasswordErrors({
              password: data.error?.message || 'Failed to add password. Please try again.',
            });
          }
        } catch (_error) {
          setPasswordErrors({
            password: 'Network error. Please check your connection and try again.',
          });
        } finally {
          setIsAddingPassword(false);
        }
      } else {
        // User skipped password - move to step 1 (username step)
        setCurrentStep(1);
      }
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        // Map game types to backend enums
        const mapGameType = (game: string | undefined): string => {
          if (!game || game.trim() === '') {
            return 'texas-holdem';
          }

          if (game.includes("Texas Hold'em")) {
            return 'texas-holdem';
          }
          if (game.includes('Omaha')) {
            return 'omaha';
          }
          if (game.includes('Stud')) {
            return 'stud';
          }
          if (game.includes('Mixed')) {
            return 'mixed';
          }
          if (game.includes('Tournament')) {
            return 'texas-holdem';
          } // Default for tournament
          if (game.includes('Cash')) {
            return 'texas-holdem';
          } // Default for cash

          return 'texas-holdem'; // Default fallback
        };

        // Map goals to learning goals and features
        const mapLearningGoal = (goals: string[]): string => {
          if (goals.some((g) => g.includes('Improve'))) {
            return 'improve-strategy';
          }
          if (goals.some((g) => g.includes('Learn'))) {
            return 'learn-basics';
          }
          if (goals.some((g) => g.includes('professional'))) {
            return 'go-pro';
          }
          return 'fun'; // Default
        };

        const mapInterestedFeatures = (goals: string[]): string[] => {
          const features: string[] = [];
          goals.forEach((goal) => {
            if (goal.includes('Improve') || goal.includes('strategies')) {
              features.push('hand-analysis');
            }
            if (goal.includes('Connect') || goal.includes('discussions')) {
              features.push('community');
            }
            if (goal.includes('Track') || goal.includes('progress')) {
              features.push('statistics');
            }
            if (goal.includes('Learn')) {
              features.push('coaching');
            }
          });

          // Remove duplicates and ensure at least one feature
          const uniqueFeatures = [...new Set(features)];
          return uniqueFeatures.length > 0 ? uniqueFeatures : ['hand-analysis'];
        };

        // Map preferred format based on stakes or game preference
        const mapPreferredFormat = (): string => {
          if (formData.favoriteGame?.includes('Tournament')) {
            return 'tournament';
          }
          if (formData.favoriteGame?.includes('Cash')) {
            return 'cash';
          }
          if (formData.preferredStakes) {
            // If they specified stakes, they probably prefer cash games
            return 'cash';
          }
          return 'both'; // Default
        };

        // Map the original form data to backend structure
        const onboardingData = {
          username: formData.username, // Add username
          playFrequency: 'weekly', // Default since original doesn't have this
          experienceLevel: formData.experience || 'intermediate',
          preferredFormat: mapPreferredFormat(),
          favoriteVariant: mapGameType(formData.favoriteGame),
          learningGoals: mapLearningGoal(formData.playingGoals),
          interestedFeatures: mapInterestedFeatures(formData.playingGoals),
          location: formData.location || undefined, // Add location if provided
          preferredStakes: formData.preferredStakes || undefined, // Add stakes if provided
          otherInfo: formData.bio || '',
        };

        // Submit onboarding data
        const response = await onboardingEndpoints.submitAnswers(onboardingData);

        // If the response includes new tokens, they have already been set as cookies
        // The response should have updated user data with hasCompletedOnboarding: true
        if (response.data?.success) {
          // Give cookies time to be set properly
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Force a page reload to ensure all auth state is refreshed with new tokens
          // This is more reliable than just calling refreshAuth() which uses old tokens
          window.location.href = '/feed';
        } else {
          throw new Error('Onboarding submission did not return success');
        }
      } catch (error) {
        // Handle different error types
        if ((error as any).response?.status === 401) {
          // Authentication error
          alert('Your session has expired. Please sign in again.');
          router.push('/auth/signin');
        } else if ((error as any).response?.data?.message) {
          // Validation error
          const errorMessage = Array.isArray((error as any).response.data.message)
            ? (error as any).response.data.message.join('\n')
            : (error as any).response.data.message;
          alert(
            `Failed to complete onboarding:\n${errorMessage}\n\nPlease check the console for more details.`,
          );
        } else if ((error as any).message) {
          alert(`Failed to complete onboarding: ${(error as any).message}`);
        } else {
          alert('Failed to complete onboarding. Please try again.');
        }

        // Don't navigate away on error unless it's an auth error
      }
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const renderStepContent = () => {
    // If user needs password setup, show password step as step 0, then normal steps
    // If user doesn't need password setup, show normal steps starting from 0

    if (needsPasswordSetup && currentStep === 0) {
      // Password setup step (only for Google users without passwords)
      return (
        <div className="space-y-4 lg:space-y-6">
          <div className="text-center space-y-3 lg:space-y-4">
            <p className="text-slate-300 text-base lg:text-lg">
              Welcome! You're signed in with Google. Create a password for additional security.
            </p>
            <p className="text-slate-400 text-sm lg:text-base">
              This is optional - you can continue with Google sign-in only.
            </p>
          </div>
          <div className="space-y-3 lg:space-y-4">
            <div>
              <Label htmlFor="password" className="text-slate-200 text-sm lg:text-base">
                Password (optional)
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700/50"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
              {passwordErrors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordErrors.password}
                </p>
              )}
            </div>

            {formData.password && (
              <div>
                <Label htmlFor="confirmPassword" className="text-slate-200 text-sm lg:text-base">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700/50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-slate-400 text-xs text-center">
                Password requirements: 8+ characters, uppercase, lowercase, number, special
                character
              </p>
            </div>
          </div>
        </div>
      );
    }

    // For all other steps, calculate the actual step based on whether password setup was shown
    const actualStep = needsPasswordSetup ? currentStep - 1 : currentStep;

    switch (actualStep) {
      case 0:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="text-center space-y-3 lg:space-y-4">
              <p className="text-slate-300 text-base lg:text-lg">
                You're just a few steps away from joining the best poker community online!
              </p>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <div>
                <Label htmlFor="username" className="text-slate-200 text-sm lg:text-base">
                  Choose a username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="Your poker handle"
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base pr-10 ${
                      usernameError
                        ? 'border-red-500 focus:border-red-500'
                        : formData.username.length >= 3 && !isCheckingUsername && !usernameError
                          ? 'border-emerald-500'
                          : ''
                    }`}
                  />
                  {/* Status icon */}
                  <div className="absolute right-3 top-3.5">
                    {isCheckingUsername && (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    )}
                    {!isCheckingUsername && formData.username.length >= 3 && !usernameError && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                    {!isCheckingUsername && usernameError && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                {usernameError && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {usernameError}
                  </p>
                )}
                {isCheckingUsername && (
                  <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking availability...
                  </p>
                )}
                {!isCheckingUsername && formData.username.length >= 3 && !usernameError && (
                  <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Username is available
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="text-center"></div>
            <div className="space-y-3 lg:space-y-4">
              <div>
                <Label className="text-slate-200 text-sm lg:text-base">
                  Your poker experience level
                </Label>
                <div className="grid gap-2 lg:gap-3 mt-2 lg:mt-3">
                  {experienceLevels.map((level) => (
                    <Card
                      key={level.value}
                      className={`cursor-pointer transition-all ${formData.experience === level.value ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60'}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          experience: level.value,
                        }))
                      }
                    >
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-slate-200 font-medium text-sm lg:text-base">
                              {level.label}
                            </h3>
                            <p className="text-slate-400 text-xs lg:text-sm">{level.description}</p>
                          </div>
                          {formData.experience === level.value && (
                            <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-200 text-sm lg:text-base">Favorite game type</Label>
                <Select
                  value={formData.favoriteGame}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      favoriteGame: value,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 text-sm lg:text-base">
                    <SelectValue placeholder="Select your favorite game" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {gameTypes.map((game) => (
                      <SelectItem
                        key={game}
                        value={game}
                        className="text-slate-200 focus:bg-slate-700 text-sm lg:text-base"
                      >
                        {game}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="text-center"></div>
            <div>
              <Label className="text-slate-200 text-sm lg:text-base">
                What do you want to achieve on PokerConnect?
              </Label>
              <div className="grid grid-cols-1 gap-2 lg:gap-3 mt-2 lg:mt-3">
                {goalOptions.map((goal) => (
                  <Badge
                    key={goal}
                    variant={formData.playingGoals.includes(goal) ? 'default' : 'secondary'}
                    className={`cursor-pointer p-2 lg:p-3 text-center justify-center text-xs lg:text-sm ${formData.playingGoals.includes(goal) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-800/40 text-slate-300 border-slate-700/30 hover:bg-slate-800/60'}`}
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="text-center"></div>
            <div className="grid gap-3 lg:gap-4">
              <div>
                <Label htmlFor="bio" className="text-slate-200 text-sm lg:text-base">
                  Bio (optional)
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base min-h-[80px] lg:min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-slate-200 text-sm lg:text-base">
                  Location (optional)
                </Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base"
                />
              </div>

              <div>
                <Label htmlFor="stakes" className="text-slate-200 text-sm lg:text-base">
                  Preferred stakes (optional)
                </Label>
                <Input
                  id="stakes"
                  placeholder="e.g., $1/$2, $0.25/$0.50"
                  value={formData.preferredStakes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredStakes: e.target.value,
                    }))
                  }
                  className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  const isStepValid = () => {
    // Handle password setup step
    if (needsPasswordSetup && currentStep === 0) {
      // Password setup step - allow proceeding with or without password
      if (formData.password) {
        // If password provided, validate it
        const passwordIssues = validatePassword(formData.password);
        const passwordsMatch = formData.password === formData.confirmPassword;
        return passwordIssues.length === 0 && passwordsMatch;
      }
      // If no password provided, allow proceeding (optional)
      return true;
    }

    // For all other steps, calculate the actual step based on whether password setup was shown
    const actualStep = needsPasswordSetup ? currentStep - 1 : currentStep;

    switch (actualStep) {
      case 0:
        return formData.username.trim().length > 0 && !usernameError && !isCheckingUsername;
      case 1: {
        const isValid =
          formData.experience && formData.favoriteGame && formData.favoriteGame.trim() !== '';
        return isValid;
      }
      case 2:
        return formData.playingGoals.length > 0;
      case 3:
        return true;
      // Optional fields
      default:
        return false;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-3 lg:p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 lg:w-64 lg:h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 lg:w-64 lg:h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl lg:max-w-2xl relative">
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-3 lg:space-y-4 pb-4 lg:pb-6">
            <div className="flex items-center justify-center space-x-1 lg:space-x-2 mb-3 lg:mb-4">
              {steps.map((_step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium ${index <= currentStep ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 lg:w-12 h-0.5 mx-1 lg:mx-2 ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <CardTitle className="text-xl lg:text-2xl text-slate-200">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm lg:text-base">
              {steps[currentStep].subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 lg:space-y-6 px-4 lg:px-6">
            {renderStepContent()}

            <div className="flex justify-between pt-4 lg:pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 text-sm lg:text-base px-3 lg:px-4 py-2"
              >
                <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isAddingPassword}
                className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium text-sm lg:text-base px-3 lg:px-4 py-2"
              >
                {isAddingPassword ? (
                  <>
                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 animate-spin" />
                    Adding Password...
                  </>
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Onboarding;
