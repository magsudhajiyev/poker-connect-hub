
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
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
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/20 text-sm sm:text-base"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Account
                </Button>
              </Link>
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
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=48&h=48&fit=crop&crop=face" 
                  alt="User 1" 
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 object-cover shadow-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=48&h=48&fit=crop&crop=face" 
                  alt="User 2" 
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 object-cover shadow-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=48&h=48&fit=crop&crop=face" 
                  alt="User 3" 
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 object-cover shadow-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=48&h=48&fit=crop&crop=face" 
                  alt="User 4" 
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-slate-900 object-cover shadow-lg"
                />
              </div>
              <span className="text-slate-400 text-sm sm:text-[15px]">Join 10,000+ poker players</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 sm:w-40 sm:h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-violet-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 bg-slate-900/60 rounded-2xl border border-slate-700/20 shadow-2xl overflow-hidden max-w-md mx-auto">
              <div className="p-4 sm:p-6">
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm text-slate-400">Recent Hand</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">+$245</span>
                  </div>
                  <div className="flex justify-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
                    <div className="w-10 h-12 sm:w-12 sm:h-16 bg-gradient-to-b from-white to-slate-100 rounded-lg flex items-center justify-center text-slate-900 font-bold text-xs sm:text-sm">A♠</div>
                    <div className="w-10 h-12 sm:w-12 sm:h-16 bg-gradient-to-b from-white to-slate-100 rounded-lg flex items-center justify-center text-red-500 font-bold text-xs sm:text-sm">K♥</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-2">Board</div>
                    <div className="flex justify-center space-x-1">
                      <div className="w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-b from-white to-slate-100 rounded text-slate-900 text-xs flex items-center justify-center">A♣</div>
                      <div className="w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-b from-white to-slate-100 rounded text-red-500 text-xs flex items-center justify-center">K♦</div>
                      <div className="w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-b from-white to-slate-100 rounded text-slate-900 text-xs flex items-center justify-center">2♠</div>
                      <div className="w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-b from-white to-slate-100 rounded text-red-500 text-xs flex items-center justify-center">7♥</div>
                      <div className="w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-b from-white to-slate-100 rounded text-slate-900 text-xs flex items-center justify-center">3♣</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Position</span>
                    <span className="text-slate-200">Button</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Action</span>
                    <span className="text-emerald-400">Bet $50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
