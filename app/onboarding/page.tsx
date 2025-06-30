'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, ArrowRight, CheckCircle, User, Target, TrendingUp, Calendar } from 'lucide-react';
import { useRouter, redirect } from 'next/navigation';
import { onboardingEndpoints } from '@/services/authApi';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    playFrequency: '',
    experienceLevel: '',
    preferredFormat: '',
    favoriteVariant: '',
    learningGoals: '',
    interestedFeatures: [] as string[],
    otherInfo: '',
  });
  
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if not authenticated
  if (!user) {
    redirect('/auth/signin');
  }

  const steps = [
    {
      title: 'How often do you play poker?',
      subtitle: 'Help us understand your playing habits',
      icon: Calendar,
    },
    {
      title: 'What\'s your experience level?',
      subtitle: 'We\'ll customize your experience',
      icon: User,
    },
    {
      title: 'Game preferences',
      subtitle: 'Tell us what you enjoy playing',
      icon: Target,
    },
    {
      title: 'Your poker journey',
      subtitle: 'What brings you here?',
      icon: TrendingUp,
    },
  ];

  const playFrequencyOptions = [
    { value: 'daily', label: 'Daily', description: 'I play every day' },
    { value: 'weekly', label: 'Weekly', description: 'A few times a week' },
    { value: 'monthly', label: 'Monthly', description: 'A few times a month' },
    { value: 'rarely', label: 'Rarely', description: 'Occasionally for fun' },
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting my poker journey' },
    { value: 'intermediate', label: 'Intermediate', description: 'I know the basics and some strategy' },
    { value: 'advanced', label: 'Advanced', description: 'I play regularly and study the game' },
    { value: 'professional', label: 'Professional', description: 'Poker is my primary income' },
  ];

  const gameFormats = [
    { value: 'cash', label: 'Cash Games' },
    { value: 'tournament', label: 'Tournaments' },
    { value: 'both', label: 'Both' },
  ];

  const gameVariants = [
    { value: 'texas-holdem', label: 'Texas Hold\'em' },
    { value: 'omaha', label: 'Omaha' },
    { value: 'stud', label: 'Stud Games' },
    { value: 'mixed', label: 'Mixed Games' },
  ];

  const learningGoalOptions = [
    { value: 'improve-strategy', label: 'Improve Strategy', description: 'Level up my game' },
    { value: 'learn-basics', label: 'Learn Basics', description: 'Master fundamentals' },
    { value: 'go-pro', label: 'Go Professional', description: 'Make poker my career' },
    { value: 'fun', label: 'Have Fun', description: 'Enjoy and connect with others' },
  ];

  const features = [
    { value: 'hand-analysis', label: 'Hand Analysis', description: 'Review and improve your plays' },
    { value: 'community', label: 'Community', description: 'Connect with other players' },
    { value: 'statistics', label: 'Statistics', description: 'Track your performance' },
    { value: 'coaching', label: 'Coaching', description: 'Learn from the pros' },
  ];

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      interestedFeatures: prev.interestedFeatures.includes(feature)
        ? prev.interestedFeatures.filter((f) => f !== feature)
        : [...prev.interestedFeatures, feature],
    }));
  };

  const handleNext = async () => {
    setError('');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit onboarding data
      try {
        setIsSubmitting(true);
        
        // Validate required fields
        if (!formData.playFrequency || !formData.experienceLevel || 
            !formData.preferredFormat || !formData.favoriteVariant || 
            !formData.learningGoals || formData.interestedFeatures.length === 0) {
          setError('Please complete all required fields');
          return;
        }
        
        // Submit onboarding answers
        await onboardingEndpoints.submitAnswers(formData);
        
        // Navigate to feed
        router.push('/feed');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        setError('Failed to complete onboarding. Please try again.');
        
        // If it's a conflict error (already completed), navigate to feed
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number }};
          if (axiosError.response?.status === 409) {
            router.push('/feed');
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!formData.playFrequency;
      case 1:
        return !!formData.experienceLevel;
      case 2:
        return !!formData.preferredFormat && !!formData.favoriteVariant;
      case 3:
        return !!formData.learningGoals && formData.interestedFeatures.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="grid gap-2 lg:gap-3">
              {playFrequencyOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    formData.playFrequency === option.value
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60'
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      playFrequency: option.value,
                    }))
                  }
                >
                  <CardContent className="p-3 lg:p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm lg:text-base text-slate-200">
                        {option.label}
                      </h4>
                      <p className="text-xs lg:text-sm text-slate-400">
                        {option.description}
                      </p>
                    </div>
                    {formData.playFrequency === option.value && (
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="grid gap-2 lg:gap-3">
              {experienceLevels.map((level) => (
                <Card
                  key={level.value}
                  className={`cursor-pointer transition-all ${
                    formData.experienceLevel === level.value
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60'
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceLevel: level.value,
                    }))
                  }
                >
                  <CardContent className="p-3 lg:p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm lg:text-base text-slate-200">
                        {level.label}
                      </h4>
                      <p className="text-xs lg:text-sm text-slate-400">
                        {level.description}
                      </p>
                    </div>
                    {formData.experienceLevel === level.value && (
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <Label className="text-slate-200 text-sm lg:text-base">
                Preferred game format
              </Label>
              <Select
                value={formData.preferredFormat}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, preferredFormat: value }))
                }
              >
                <SelectTrigger className="mt-2 bg-slate-900/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {gameFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-200 text-sm lg:text-base">
                Favorite poker variant
              </Label>
              <Select
                value={formData.favoriteVariant}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, favoriteVariant: value }))
                }
              >
                <SelectTrigger className="mt-2 bg-slate-900/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {gameVariants.map((variant) => (
                    <SelectItem key={variant.value} value={variant.value}>
                      {variant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <Label className="text-slate-200 text-sm lg:text-base mb-3 block">
                What's your main goal?
              </Label>
              <div className="grid gap-2 lg:gap-3">
                {learningGoalOptions.map((goal) => (
                  <Card
                    key={goal.value}
                    className={`cursor-pointer transition-all ${
                      formData.learningGoals === goal.value
                        ? 'bg-emerald-500/20 border-emerald-500/50'
                        : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60'
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        learningGoals: goal.value,
                      }))
                    }
                  >
                    <CardContent className="p-3 lg:p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm lg:text-base text-slate-200">
                          {goal.label}
                        </h4>
                        <p className="text-xs lg:text-sm text-slate-400">
                          {goal.description}
                        </p>
                      </div>
                      {formData.learningGoals === goal.value && (
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-200 text-sm lg:text-base mb-3 block">
                Features you're interested in (select at least one)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                {features.map((feature) => (
                  <Badge
                    key={feature.value}
                    variant={formData.interestedFeatures.includes(feature.value) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all text-xs lg:text-sm py-2 lg:py-3 ${
                      formData.interestedFeatures.includes(feature.value)
                        ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-600'
                        : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/60'
                    }`}
                    onClick={() => toggleFeature(feature.value)}
                  >
                    <div className="text-center w-full">
                      <div className="font-medium">{feature.label}</div>
                      <div className="text-xs opacity-80 mt-0.5">{feature.description}</div>
                    </div>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="otherInfo" className="text-slate-200 text-sm lg:text-base">
                Anything else you'd like to share? (optional)
              </Label>
              <Textarea
                id="otherInfo"
                placeholder="Tell us more about your poker journey..."
                value={formData.otherInfo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherInfo: e.target.value,
                  }))
                }
                className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base min-h-[100px]"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Progress Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="flex justify-between items-center mb-3 lg:mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-200">Complete Your Profile</h1>
            <span className="text-xs lg:text-sm text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-violet-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="text-center pb-4 lg:pb-6">
            <div className="flex justify-center mb-3 lg:mb-4">
              {React.createElement(steps[currentStep].icon, {
                className: 'w-10 h-10 lg:w-12 lg:h-12 text-emerald-500',
              })}
            </div>
            <CardTitle className="text-xl lg:text-2xl text-slate-200">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-sm lg:text-base text-slate-400">
              {steps[currentStep].subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 lg:space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between gap-3 pt-4 lg:pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="border-slate-600 text-slate-300 hover:bg-slate-800/60 text-sm lg:text-base disabled:opacity-50"
              >
                <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium text-sm lg:text-base disabled:opacity-50"
              >
                {currentStep === steps.length - 1 ? (
                  isSubmitting ? 'Completing...' : 'Complete Setup'
                ) : (
                  'Next'
                )}
                {currentStep < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Onboarding;