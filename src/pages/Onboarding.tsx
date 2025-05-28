
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ArrowLeft, ArrowRight, Users, TrendingUp, Lightbulb, UserPlus, Diamond, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExperience, setSelectedExperience] = useState('Advanced');
  const [selectedGameTypes, setSelectedGameTypes] = useState(['Texas Hold\'em']);
  const [selectedStakes, setSelectedStakes] = useState('$1/$2 - $2/$5');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [pokerQuestions, setPokerQuestions] = useState({
    favoriteHand: '',
    biggestWin: '',
    playStyle: ''
  });

  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const gameTypes = ['Texas Hold\'em', 'Omaha', 'Stud', 'Other'];
  const stakesOptions = ['$0.25/$0.50', '$0.50/$1', '$1/$2', '$2/$5', '$5/$10', '$10/$25', '$25/$50+'];

  const handleExperienceSelect = (level: string) => {
    setSelectedExperience(level);
  };

  const handleGameTypeToggle = (gameType: string) => {
    setSelectedGameTypes(prev => 
      prev.includes(gameType) 
        ? prev.filter(type => type !== gameType)
        : [...prev, gameType]
    );
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to feed
      console.log('Onboarding completed:', {
        experience: selectedExperience,
        gameTypes: selectedGameTypes,
        stakes: selectedStakes,
        bio,
        profileImage,
        pokerQuestions
      });
      navigate('/feed');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <>
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-xl mb-4">
              <UserPlus className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-medium text-zinc-200">Welcome to PokerConnect</h2>
            <p className="text-zinc-400 text-sm mt-1">Let's set up your poker profile</p>
          </div>

          <div className="text-center space-y-4">
            <p className="text-zinc-300">
              Join the ultimate poker community where you can share hands, track your progress, and connect with fellow players.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/30">
                <Users className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-zinc-200 font-medium">Connect</h3>
                <p className="text-zinc-400 text-sm">Find players at your level</p>
              </div>
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/30">
                <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-zinc-200 font-medium">Track</h3>
                <p className="text-zinc-400 text-sm">Monitor your progress</p>
              </div>
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/30">
                <Lightbulb className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-zinc-200 font-medium">Learn</h3>
                <p className="text-zinc-400 text-sm">Share and discuss hands</p>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <>
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-xl mb-4">
              <UserPlus className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-medium text-zinc-200">Poker Experience</h2>
            <p className="text-zinc-400 text-sm mt-1">Tell us about your poker journey</p>
          </div>

          {/* Experience Level Selection */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Experience Level</label>
            <div className="grid grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => handleExperienceSelect(level)}
                  className={`w-full h-[50px] rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                    selectedExperience === level
                      ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-gray-800 font-medium'
                      : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Game Types */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Preferred Game Types</label>
            <div className="grid grid-cols-2 gap-3">
              {gameTypes.map((gameType) => (
                <button
                  key={gameType}
                  onClick={() => handleGameTypeToggle(gameType)}
                  className={`w-full h-[50px] rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                    selectedGameTypes.includes(gameType)
                      ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-gray-800 font-medium'
                      : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {gameType}
                </button>
              ))}
            </div>
          </div>

          {/* Stakes */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Typical Stakes</label>
            <select 
              value={selectedStakes}
              onChange={(e) => setSelectedStakes(e.target.value)}
              className="w-full h-[50px] px-3 bg-zinc-800/60 rounded-xl border border-zinc-700/30 text-zinc-200"
            >
              {stakesOptions.map(stakes => (
                <option key={stakes} value={stakes} className="bg-zinc-800">{stakes}</option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Short Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-[100px] bg-zinc-800/60 border-zinc-700/30 text-zinc-200 placeholder:text-zinc-500 focus:border-emerald-500 resize-none"
              placeholder="Tell others a bit about yourself and your poker journey..."
            />
          </div>
        </>
      );
    }

    if (currentStep === 3) {
      return (
        <>
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-xl mb-4">
              <Camera className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-medium text-zinc-200">Profile & Questions</h2>
            <p className="text-zinc-400 text-sm mt-1">Complete your profile and answer some poker questions</p>
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800/60 border border-zinc-700/30 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-zinc-400" />
                )}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-zinc-800/60 border-zinc-700/30 text-zinc-200"
                />
                <p className="text-xs text-zinc-400 mt-1">Upload a profile picture (optional)</p>
              </div>
            </div>
          </div>

          {/* Poker Questions */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">What's your favorite starting hand?</label>
            <Input
              value={pokerQuestions.favoriteHand}
              onChange={(e) => setPokerQuestions(prev => ({...prev, favoriteHand: e.target.value}))}
              className="bg-zinc-800/60 border-zinc-700/30 text-zinc-200"
              placeholder="e.g., Pocket Aces, King-Queen suited..."
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">What's your biggest poker win?</label>
            <Input
              value={pokerQuestions.biggestWin}
              onChange={(e) => setPokerQuestions(prev => ({...prev, biggestWin: e.target.value}))}
              className="bg-zinc-800/60 border-zinc-700/30 text-zinc-200"
              placeholder="e.g., $500 in a tournament, $1000 cash game session..."
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">How would you describe your playing style?</label>
            <Textarea
              value={pokerQuestions.playStyle}
              onChange={(e) => setPokerQuestions(prev => ({...prev, playStyle: e.target.value}))}
              className="w-full h-[80px] bg-zinc-800/60 border-zinc-700/30 text-zinc-200 placeholder:text-zinc-500 focus:border-emerald-500 resize-none"
              placeholder="e.g., Tight-aggressive, loose-passive, bluff-heavy..."
            />
          </div>
        </>
      );
    }

    return null;
  };

  const getStepTitle = () => {
    if (currentStep === 1) return "Welcome";
    if (currentStep === 2) return "Complete Your Profile";
    if (currentStep === 3) return "Almost Done!";
    return "Welcome";
  };

  const getStepDescription = () => {
    if (currentStep === 1) return "Join the ultimate poker community";
    if (currentStep === 2) return "Let's get to know you better so we can personalize your experience";
    if (currentStep === 3) return "Just a few more details and you'll be ready to join the community";
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-700/20 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Diamond className="text-gray-800 w-4 h-4" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                PokerConnect
              </span>
            </div>
            
            {/* Back to Home Link */}
            <Link to="/" className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Onboarding Container */}
      <main className="pt-32 pb-16 px-4 md:px-0">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-medium ${
                currentStep >= 1 ? 'bg-emerald-500 text-gray-800' : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/30'
              }`}>1</div>
              <div className="w-16 h-0.5 bg-zinc-700/30">
                <div className={`h-full ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-zinc-700/30'} ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-medium ${
                currentStep >= 2 ? 'bg-emerald-500 text-gray-800' : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/30'
              }`}>2</div>
              <div className="w-16 h-0.5 bg-zinc-700/30">
                <div className={`h-full ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-zinc-700/30'} ${currentStep >= 3 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-medium ${
                currentStep >= 3 ? 'bg-emerald-500 text-gray-800' : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/30'
              }`}>3</div>
            </div>
          </div>

          {/* Onboarding Form Container */}
          <div className="bg-zinc-900/60 rounded-2xl border border-zinc-700/20 p-8">
            {/* Form Title */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                {getStepTitle()}
              </h1>
              <p className="text-zinc-400 mt-2">{getStepDescription()}</p>
            </div>
            
            {/* Current Step Content */}
            <div className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  variant="outline" 
                  className="bg-zinc-800/40 border-zinc-700/30 text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-emerald-500 to-violet-500 text-gray-800 font-medium hover:from-emerald-600 hover:to-violet-600"
                >
                  {currentStep === 3 ? 'Complete Setup' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-emerald-500' : 'bg-zinc-700/30'}`}></div>
                <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-zinc-700/30'}`}></div>
                <div className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-zinc-700/30'}`}></div>
              </div>
            </div>
          </div>

          {/* Skip for Now */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/feed')}
              className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </div>
      </main>

      {/* What to Expect Section */}
      <section className="py-16 bg-zinc-900/30 border-t border-b border-zinc-700/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
            What to Expect
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/60 rounded-2xl border border-zinc-700/20 p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">Connect with Players</h3>
              <p className="text-zinc-400 text-sm">Find and follow other poker players with similar interests and skill levels.</p>
            </div>
            
            <div className="bg-zinc-900/60 rounded-2xl border border-zinc-700/20 p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">Track Your Progress</h3>
              <p className="text-zinc-400 text-sm">Upload and analyze your poker stats to see your improvement over time.</p>
            </div>
            
            <div className="bg-zinc-900/60 rounded-2xl border border-zinc-700/20 p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">Share & Learn</h3>
              <p className="text-zinc-400 text-sm">Discuss interesting hands, strategies, and get feedback from the community.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Onboarding;
