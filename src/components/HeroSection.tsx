
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import PokerChips from './PokerChips';
import FloatingCards from './FloatingCards';

const HeroSection = () => {
  return (
    <section className="pt-40 pb-24 px-4 relative overflow-hidden">
      <FloatingCards />
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="md:w-1/2 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Connect, Share & Improve
              </span>{' '}
              <span className="text-white font-extrabold drop-shadow-lg">
                Your Poker Game
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed animate-slide-up">
              Join the ultimate social platform built exclusively for poker players. Share hands, track stats, and learn from the community.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-scale-in">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-[56px] px-8 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/20 group"
                >
                  <UserPlus className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Create Account
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto h-[56px] px-8 bg-slate-800/40 border-slate-700/30 text-slate-200 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 group"
              >
                <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-10 flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.5s' } as React.CSSProperties}>
              <div className="flex -space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-slate-900 hover:scale-110 transition-transform duration-300"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-slate-900 hover:scale-110 transition-transform duration-300"></div>
                <div className="w-8 h-8 bg-violet-500 rounded-full border-2 border-slate-900 hover:scale-110 transition-transform duration-300"></div>
                <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-slate-900 hover:scale-110 transition-transform duration-300"></div>
              </div>
              <span className="text-slate-400 text-[15px]">Join 10,000+ poker players</span>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' } as React.CSSProperties}></div>
            <div className="relative z-10 bg-slate-900/60 rounded-2xl border border-slate-700/20 shadow-2xl overflow-hidden hover:scale-105 transition-all duration-500 group">
              <div className="p-6">
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4 group-hover:bg-slate-800/70 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">Recent Hand</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded animate-pulse">+$245</span>
                  </div>
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="w-12 h-16 bg-gradient-to-b from-white to-slate-100 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm hover:rotate-6 transition-transform duration-300 cursor-pointer">A♠</div>
                    <div className="w-12 h-16 bg-gradient-to-b from-white to-slate-100 rounded-lg flex items-center justify-center text-red-500 font-bold text-sm hover:rotate-6 transition-transform duration-300 cursor-pointer">K♥</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-2">Board</div>
                    <div className="flex justify-center space-x-1">
                      <div className="w-8 h-10 bg-gradient-to-b from-white to-slate-100 rounded text-slate-900 text-xs flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">A♣</div>
                      <div className="w-8 h-10 bg-gradient-to-b from-white to-slate-100 rounded text-red-500 text-xs flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">K♦</div>
                      <div className="w-8 h-10 bg-gradient-to-b from-white to-slate-100 rounded text-slate-900 text-xs flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">2♠</div>
                      <div className="w-8 h-10 bg-gradient-to-b from-white to-slate-100 rounded text-red-500 text-xs flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">7♥</div>
                      <div className="w-8 h-10 bg-gradient-to-b from-white to-slate-100 rounded text-slate-900 text-xs flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">3♣</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Position</span>
                    <span className="text-slate-200">Button</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Action</span>
                    <span className="text-emerald-400">Bet $50</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Poker chips floating around */}
            <div className="absolute -bottom-8 -left-8 animate-bounce" style={{ animationDelay: '2s' } as React.CSSProperties}>
              <PokerChips />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
