
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PokerChipConfetti from './PokerChipConfetti';

const HeroSection = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfetti(true);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    navigate('/auth');
  };

  return (
    <>
      <PokerChipConfetti isActive={showConfetti} onComplete={handleConfettiComplete} />
      <section className="pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 text-center lg:text-left animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight">
                <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                  Connect, Share & Improve
                </span>{' '}
                <span className="text-white font-extrabold drop-shadow-lg">
                  Your Poker Game
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Join the ultimate social platform built exclusively for poker players. Share hands, track stats, and learn from the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleGetStartedClick}
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/20 text-sm sm:text-base"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Account
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-slate-800/40 border-slate-700/30 text-slate-200 hover:bg-slate-800/60 transition-all duration-300 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="mt-6 sm:mt-8 md:mt-10 flex items-center justify-center lg:justify-start space-x-3">
                <div className="flex -space-x-3 sm:-space-x-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg">
                    JD
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg">
                    SM
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg">
                    AL
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg">
                    MR
                  </div>
                </div>
                <span className="text-slate-400 text-sm sm:text-[15px]">Join 10,000+ poker players</span>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 sm:w-40 sm:h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-violet-500/20 rounded-full blur-3xl"></div>
              
              {/* Pile of overlapping screenshots - made bigger with feed page added */}
              <div className="relative z-10 max-w-lg mx-auto h-96 sm:h-[26rem] lg:h-[28rem]">
                {/* Feed page screenshot - bottom layer (new addition) */}
                <div className="absolute top-16 left-8 w-72 h-52 sm:w-80 sm:h-60 transform rotate-[-12deg] transition-transform duration-300 hover:rotate-[-8deg] hover:scale-105">
                  <div className="w-full h-full bg-slate-900/90 rounded-xl border border-slate-700/30 shadow-2xl overflow-hidden">
                    <div className="bg-slate-950/80 h-8 flex items-center px-3 border-b border-slate-700/30">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="ml-2 text-xs text-slate-400">Feed</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {/* Post header */}
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                        <div className="h-2 bg-slate-700 rounded w-16"></div>
                        <div className="h-1 bg-emerald-500 rounded w-8 text-xs"></div>
                      </div>
                      {/* Post content */}
                      <div className="h-1.5 bg-slate-700 rounded w-full"></div>
                      <div className="h-1.5 bg-slate-700 rounded w-2/3"></div>
                      {/* Cards display */}
                      <div className="flex space-x-1 my-2">
                        <div className="w-4 h-6 bg-white rounded text-xs flex items-center justify-center text-black font-bold">A♠</div>
                        <div className="w-4 h-6 bg-white rounded text-xs flex items-center justify-center text-red-500 font-bold">K♥</div>
                      </div>
                      {/* Like and comment section */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/30">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span className="text-xs text-slate-400">24</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-xs text-slate-400">8</span>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-slate-600 rounded"></div>
                      </div>
                      {/* Comments preview */}
                      <div className="space-y-2 mt-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="flex-1">
                            <div className="h-1 bg-slate-600 rounded w-12 mb-1"></div>
                            <div className="h-1 bg-slate-600 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="flex-1">
                            <div className="h-1 bg-slate-600 rounded w-10 mb-1"></div>
                            <div className="h-1 bg-slate-600 rounded w-14"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hand sharing page screenshot - second layer */}
                <div className="absolute top-8 left-2 w-80 h-60 sm:w-96 sm:h-72 transform rotate-[-8deg] transition-transform duration-300 hover:rotate-[-4deg] hover:scale-105">
                  <div className="w-full h-full bg-slate-900/90 rounded-xl border border-slate-700/30 shadow-2xl overflow-hidden">
                    <div className="bg-slate-950/80 h-10 flex items-center px-4 border-b border-slate-700/30">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="ml-3 text-sm text-slate-400">Share Hand</span>
                    </div>
                    <div className="p-4">
                      {/* Hole cards */}
                      <div className="flex justify-center space-x-2 mb-4">
                        <div className="w-8 h-12 bg-white rounded shadow-md flex items-center justify-center text-black font-bold text-sm">
                          A<span className="text-black">♠</span>
                        </div>
                        <div className="w-8 h-12 bg-white rounded shadow-md flex items-center justify-center text-red-500 font-bold text-sm">
                          K<span className="text-red-500">♥</span>
                        </div>
                      </div>
                      {/* Community cards */}
                      <div className="flex justify-center space-x-1 mb-4">
                        <div className="w-6 h-8 bg-white rounded text-xs flex items-center justify-center font-semibold">
                          A<span className="text-black">♣</span>
                        </div>
                        <div className="w-6 h-8 bg-white rounded text-xs flex items-center justify-center font-semibold">
                          K<span className="text-red-500">♦</span>
                        </div>
                        <div className="w-6 h-8 bg-white rounded text-xs flex items-center justify-center font-semibold">
                          2<span className="text-black">♠</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Position</span>
                          <span className="text-xs text-slate-300">Button</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Action</span>
                          <span className="text-xs text-emerald-400">Bet $50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hand analysis screenshot - third layer */}
                <div className="absolute top-0 right-0 w-80 h-60 sm:w-96 sm:h-72 transform rotate-[6deg] transition-transform duration-300 hover:rotate-[3deg] hover:scale-105">
                  <div className="w-full h-full bg-slate-900/90 rounded-xl border border-slate-700/30 shadow-2xl overflow-hidden">
                    <div className="bg-slate-950/80 h-10 flex items-center px-4 border-b border-slate-700/30">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="ml-3 text-sm text-slate-400">Hand Analysis</span>
                    </div>
                    <div className="p-4">
                      <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                        <div className="text-sm text-emerald-400 mb-2">Recent Hand Analysis</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Two Pair, Aces up</span>
                          <span className="text-sm bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">+$245</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-slate-700 rounded w-full"></div>
                        <div className="h-2 bg-slate-700 rounded w-2/3"></div>
                        <div className="flex space-x-2 mt-3">
                          <div className="h-1.5 bg-violet-500 rounded w-8"></div>
                          <div className="h-1.5 bg-emerald-500 rounded w-8"></div>
                          <div className="h-1.5 bg-blue-500 rounded w-8"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced feed detail screenshot - top layer */}
                <div className="absolute top-12 left-6 w-76 h-56 sm:w-88 sm:h-68 transform rotate-[2deg] transition-transform duration-300 hover:rotate-[1deg] hover:scale-105">
                  <div className="w-full h-full bg-slate-900/90 rounded-xl border border-slate-700/30 shadow-2xl overflow-hidden">
                    <div className="bg-slate-950/80 h-10 flex items-center px-4 border-b border-slate-700/30">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="ml-3 text-sm text-slate-400">Social Feed</span>
                    </div>
                    <div className="p-3">
                      {/* Post header */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                        <div className="text-xs text-slate-300 font-medium">ProPlayer23</div>
                        <div className="text-xs text-slate-500">2h ago</div>
                      </div>
                      {/* Post content */}
                      <div className="text-xs text-slate-200 mb-2">Sick bluff with 72o! Sometimes you gotta trust your reads 🎯</div>
                      {/* Engagement */}
                      <div className="flex items-center space-x-6 py-2 border-y border-slate-700/20">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3">❤️</div>
                          <span className="text-xs text-slate-400">156</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3">💬</div>
                          <span className="text-xs text-slate-400">23</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3">🔄</div>
                          <span className="text-xs text-slate-400">8</span>
                        </div>
                      </div>
                      {/* Comments */}
                      <div className="space-y-2.5 mt-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="flex-1">
                            <div className="text-xs text-slate-300 font-medium">PokerAce</div>
                            <div className="text-xs text-slate-400">Nice read! What gave it away?</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="flex-1">
                            <div className="text-xs text-slate-300 font-medium">ChipLeader</div>
                            <div className="text-xs text-slate-400">7-2 is my favorite hand now! 😂</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
