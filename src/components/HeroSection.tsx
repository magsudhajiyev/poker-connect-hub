
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import FloatingCards from './FloatingCards';
import PokerChips from './PokerChips';

interface HeroSectionProps {
  onGetStartedClick: () => void;
}

const HeroSection = ({ onGetStartedClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
      
      {/* Floating Elements */}
      <FloatingCards />
      <PokerChips />
      
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Master Your </span>
            <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              Poker Game
            </span>
            <br />
            <span className="text-white">with AI Insights</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Share hands, get expert analysis, and connect with a community of poker enthusiasts. 
            Elevate your game with data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Button 
              onClick={onGetStartedClick}
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium px-8 py-4 text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-slate-600 text-slate-200 hover:bg-slate-800/50 px-8 py-4 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center space-x-8 text-slate-500 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Free Forever Plan</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
              <span>AI-Powered Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
