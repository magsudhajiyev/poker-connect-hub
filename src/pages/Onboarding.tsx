
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ArrowLeft, ArrowRight, Users, TrendingUp, Lightbulb, UserPlus, Diamond } from 'lucide-react';
import { Link } from 'react-router-dom';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(3);
  const [selectedExperience, setSelectedExperience] = useState('Advanced');
  const [selectedGameTypes, setSelectedGameTypes] = useState(['Texas Hold\'em']);
  const [bio, setBio] = useState('');

  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const gameTypes = ['Texas Hold\'em', 'Omaha', 'Stud', 'Other'];

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
              <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-gray-800 font-medium">1</div>
              <div className="w-16 h-0.5 bg-zinc-700/30">
                <div className="w-full h-full bg-emerald-500"></div>
              </div>
              <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-gray-800 font-medium">2</div>
              <div className="w-16 h-0.5 bg-zinc-700/30">
                <div className="w-full h-full bg-emerald-500"></div>
              </div>
              <div className="w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center text-gray-800 font-medium">3</div>
              <div className="w-16 h-0.5 bg-zinc-700/30">
                <div className="w-0 h-full bg-emerald-500"></div>
              </div>
              <div className="w-7 h-7 bg-zinc-800/60 rounded-full flex items-center justify-center text-zinc-400 font-medium border border-zinc-700/30">4</div>
            </div>
          </div>

          {/* Onboarding Form Container */}
          <div className="bg-zinc-900/60 rounded-2xl border border-zinc-700/20 p-8">
            {/* Form Title */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                Complete Your Profile
              </h1>
              <p className="text-zinc-400 mt-2">Let's get to know you better so we can personalize your experience</p>
            </div>
            
            {/* Current Step Content */}
            <div className="space-y-6">
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
                <div className="w-full h-[50px] pl-3 pr-2 bg-zinc-800/60 rounded-xl border border-zinc-700/30 flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-200 text-[15px]">$1/$2 - $2/$5</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </div>
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

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" className="bg-zinc-800/40 border-zinc-700/30 text-zinc-200 hover:bg-zinc-800/60">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-gray-800 font-medium hover:from-emerald-600 hover:to-violet-600">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-700/30"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-700/30"></div>
                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-700/30"></div>
              </div>
            </div>
          </div>

          {/* Skip for Now */}
          <div className="mt-6 text-center">
            <span className="text-zinc-400 hover:text-zinc-200 cursor-pointer">Skip for now</span>
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
