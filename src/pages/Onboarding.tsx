import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, CheckCircle, User, Target, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
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
  const steps = [{
    title: 'Welcome to PokerConnect! 🎉',
    subtitle: 'Let\'s set up your profile',
    icon: User,
    emoji: '🎉'
  }, {
    title: 'Tell us about your poker experience 🃏',
    subtitle: 'This helps us personalize your experience',
    icon: Target,
    emoji: '🃏'
  }, {
    title: 'What are your poker goals? 🚀',
    subtitle: 'Select all that apply',
    icon: TrendingUp,
    emoji: '🚀'
  }, {
    title: 'Complete your profile ✨',
    subtitle: 'Add some final details',
    icon: Users,
    emoji: '✨'
  }];
  const experienceLevels = [{
    value: 'beginner',
    label: 'Beginner 🌱',
    description: 'Just getting started'
  }, {
    value: 'intermediate',
    label: 'Intermediate 🎲',
    description: 'Some experience'
  }, {
    value: 'advanced',
    label: 'Advanced ♠️',
    description: 'Experienced player'
  }, {
    value: 'professional',
    label: 'Professional 👑',
    description: 'Play for a living'
  }];
  const gameTypes = ['Texas Hold\'em 🤠', 'Omaha 🎯', 'Seven Card Stud 🎴', 'Mixed Games 🎪', 'Tournaments 🏆', 'Cash Games 💰'];
  const goalOptions = ['Improve my game 📚', 'Connect with other players 🤝', 'Share interesting hands 💡', 'Learn new strategies 🧠', 'Track my progress 📊', 'Join poker discussions 💬'];

  // Simulate username check
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    setIsCheckingUsername(true);
    setUsernameError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate some taken usernames
    const takenUsernames = ['admin', 'pokerking', 'cardshark', 'bluffer'];
    if (takenUsernames.includes(username.toLowerCase())) {
      setUsernameError('Username is already taken');
    }
    setIsCheckingUsername(false);
  };
  const handleUsernameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      username: value
    }));
    setUsernameError('');
    if (value.length >= 3) {
      checkUsername(value);
    }
  };
  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      playingGoals: prev.playingGoals.includes(goal) ? prev.playingGoals.filter(g => g !== goal) : [...prev.playingGoals, goal]
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
        return <div className="space-y-4 lg:space-y-6">
            <div className="text-center space-y-3 lg:space-y-4">
              
              <p className="text-slate-300 text-base lg:text-lg">
                You're just a few steps away from joining the best poker community online!
              </p>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <div>
                <Label htmlFor="username" className="text-slate-200 text-sm lg:text-base">Choose a username</Label>
                <Input id="username" placeholder="Your poker handle" value={formData.username} onChange={e => handleUsernameChange(e.target.value)} className={`mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base ${usernameError ? 'border-red-500 focus:border-red-500' : ''}`} />
                {usernameError && <p className="text-red-400 text-xs mt-1">{usernameError}</p>}
                {isCheckingUsername && <p className="text-slate-400 text-xs mt-1">Checking availability...</p>}
              </div>
            </div>
          </div>;
      case 1:
        return <div className="space-y-4 lg:space-y-6">
            <div className="text-center">
              
            </div>
            <div className="space-y-3 lg:space-y-4">
              <div>
                <Label className="text-slate-200 text-sm lg:text-base">Your poker experience level</Label>
                <div className="grid gap-2 lg:gap-3 mt-2 lg:mt-3">
                  {experienceLevels.map(level => <Card key={level.value} className={`cursor-pointer transition-all ${formData.experience === level.value ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60'}`} onClick={() => setFormData(prev => ({
                  ...prev,
                  experience: level.value
                }))}>
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-slate-200 font-medium text-sm lg:text-base">{level.label}</h3>
                            <p className="text-slate-400 text-xs lg:text-sm">{level.description}</p>
                          </div>
                          {formData.experience === level.value && <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />}
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
              </div>

              <div>
                <Label className="text-slate-200 text-sm lg:text-base">Favorite game type</Label>
                <Select value={formData.favoriteGame} onValueChange={value => setFormData(prev => ({
                ...prev,
                favoriteGame: value
              }))}>
                  <SelectTrigger className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 text-sm lg:text-base">
                    <SelectValue placeholder="Select your favorite game" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {gameTypes.map(game => <SelectItem key={game} value={game} className="text-slate-200 focus:bg-slate-700 text-sm lg:text-base">
                        {game}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>;
      case 2:
        return <div className="space-y-4 lg:space-y-6">
            <div className="text-center">
              
            </div>
            <div>
              <Label className="text-slate-200 text-sm lg:text-base">What do you want to achieve on PokerConnect?</Label>
              <div className="grid grid-cols-1 gap-2 lg:gap-3 mt-2 lg:mt-3">
                {goalOptions.map(goal => <Badge key={goal} variant={formData.playingGoals.includes(goal) ? "default" : "secondary"} className={`cursor-pointer p-2 lg:p-3 text-center justify-center text-xs lg:text-sm ${formData.playingGoals.includes(goal) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-800/40 text-slate-300 border-slate-700/30 hover:bg-slate-800/60'}`} onClick={() => toggleGoal(goal)}>
                    {goal}
                  </Badge>)}
              </div>
            </div>
          </div>;
      case 3:
        return <div className="space-y-4 lg:space-y-6">
            <div className="text-center">
              <div className="text-3xl lg:text-5xl mb-2">{steps[currentStep].emoji}</div>
            </div>
            <div className="grid gap-3 lg:gap-4">
              <div>
                <Label htmlFor="bio" className="text-slate-200 text-sm lg:text-base">Bio (optional)</Label>
                <Textarea id="bio" placeholder="Tell us a bit about yourself..." value={formData.bio} onChange={e => setFormData(prev => ({
                ...prev,
                bio: e.target.value
              }))} className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base min-h-[80px] lg:min-h-[100px]" />
              </div>

              <div>
                <Label htmlFor="location" className="text-slate-200 text-sm lg:text-base">Location (optional)</Label>
                <Input id="location" placeholder="City, Country" value={formData.location} onChange={e => setFormData(prev => ({
                ...prev,
                location: e.target.value
              }))} className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base" />
              </div>

              <div>
                <Label htmlFor="stakes" className="text-slate-200 text-sm lg:text-base">Preferred stakes (optional)</Label>
                <Input id="stakes" placeholder="e.g., $1/$2, $0.25/$0.50" value={formData.preferredStakes} onChange={e => setFormData(prev => ({
                ...prev,
                preferredStakes: e.target.value
              }))} className="mt-1 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-emerald-500 text-sm lg:text-base" />
              </div>
            </div>
          </div>;
      default:
        return null;
    }
  };
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.username.trim().length > 0 && !usernameError && !isCheckingUsername;
      case 1:
        return formData.experience && formData.favoriteGame;
      case 2:
        return formData.playingGoals.length > 0;
      case 3:
        return true;
      // Optional fields
      default:
        return false;
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-3 lg:p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 lg:w-64 lg:h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 lg:w-64 lg:h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl lg:max-w-2xl relative">
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-3 lg:space-y-4 pb-4 lg:pb-6">
            <div className="flex items-center justify-center space-x-1 lg:space-x-2 mb-3 lg:mb-4">
              {steps.map((step, index) => <div key={index} className="flex items-center">
                  <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium ${index <= currentStep ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && <div className={`w-8 lg:w-12 h-0.5 mx-1 lg:mx-2 ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                </div>)}
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
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="border-slate-600 text-slate-300 hover:bg-slate-700/50 text-sm lg:text-base px-3 lg:px-4 py-2">
                <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Back
              </Button>

              <Button onClick={handleNext} disabled={!isStepValid()} className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium text-sm lg:text-base px-3 lg:px-4 py-2">
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Onboarding;