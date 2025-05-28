
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, CheckCircle, User, Target, TrendingUp, Users, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-slate-950/80 backdrop-blur-xl border border-slate-800/50">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-slate-950">
          <GlobalSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const OnboardingContent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    experience: '',
    favoriteGame: '',
    playingGoals: [] as string[],
    bio: '',
    location: '',
    preferredStakes: ''
  });
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Welcome to PokerConnect!',
      subtitle: 'Let\'s set up your profile',
      icon: User
    },
    {
      title: 'Tell us about your poker experience',
      subtitle: 'This helps us personalize your experience',
      icon: Target
    },
    {
      title: 'What are your poker goals?',
      subtitle: 'Select all that apply',
      icon: TrendingUp
    },
    {
      title: 'Complete your profile',
      subtitle: 'Add some final details',
      icon: Users
    }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just getting started' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced player' },
    { value: 'professional', label: 'Professional', description: 'Play for a living' }
  ];

  const gameTypes = [
    'Texas Hold\'em',
    'Omaha',
    'Seven Card Stud',
    'Mixed Games',
    'Tournaments',
    'Cash Games'
  ];

  const goalOptions = [
    'Improve my game',
    'Connect with other players',
    'Share interesting hands',
    'Learn new strategies',
    'Track my progress',
    'Join poker discussions'
  ];

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      playingGoals: prev.playingGoals.includes(goal)
        ? prev.playingGoals.filter(g => g !== goal)
        : [...prev.playingGoals, goal]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate('/feed');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-slate-900" />
              </div>
              <p className="text-slate-300 text-lg">
                You're just a few steps away from joining the best poker community online!
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-slate-200">Choose a username</Label>
                <Input
                  id="username"
                  placeholder="Your poker handle"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-slate-200">Your poker experience level</Label>
                <div className="grid gap-3 mt-3">
                  {experienceLevels.map((level) => (
                    <Card 
                      key={level.value}
                      className={`cursor-pointer transition-all ${
                        formData.experience === level.value
                          ? 'bg-emerald-500/20 border-emerald-500/50'
                          : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, experience: level.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-slate-200 font-medium">{level.label}</h3>
                            <p className="text-slate-400 text-sm">{level.description}</p>
                          </div>
                          {formData.experience === level.value && (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-200">Favorite game type</Label>
                <Select value={formData.favoriteGame} onValueChange={(value) => setFormData(prev => ({ ...prev, favoriteGame: value }))}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select your favorite game" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {gameTypes.map((game) => (
                      <SelectItem key={game} value={game} className="text-slate-200 focus:bg-slate-700">
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
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200">What do you want to achieve on PokerConnect?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {goalOptions.map((goal) => (
                  <Badge
                    key={goal}
                    variant={formData.playingGoals.includes(goal) ? "default" : "secondary"}
                    className={`cursor-pointer p-3 text-center justify-center ${
                      formData.playingGoals.includes(goal)
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800/40 text-slate-300 border-slate-700/30 hover:bg-slate-800/60'
                    }`}
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
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="bio" className="text-slate-200">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-slate-200">Location (optional)</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="stakes" className="text-slate-200">Preferred stakes (optional)</Label>
                <Input
                  id="stakes"
                  placeholder="e.g., $1/$2, $0.25/$0.50"
                  value={formData.preferredStakes}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredStakes: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500"
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
    switch (currentStep) {
      case 0:
        return formData.username.trim().length > 0;
      case 1:
        return formData.experience && formData.favoriteGame;
      case 2:
        return formData.playingGoals.length > 0;
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <MobileSidebar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative">
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-emerald-500 text-slate-900'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <CardTitle className="text-2xl text-slate-200">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {steps[currentStep].subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium"
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Onboarding = () => {
  return (
    <SidebarProvider>
      <OnboardingContent />
    </SidebarProvider>
  );
};

export default Onboarding;
