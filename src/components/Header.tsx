
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onGetStartedClick: () => void;
}

const Header = ({ onGetStartedClick }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-xl flex items-center justify-center">
              <span className="text-slate-900 text-lg sm:text-xl font-bold">♦</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              PokerConnect
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="text-slate-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/#pricing" className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/blog" className="text-slate-300 hover:text-white transition-colors">
              Blog
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link to="/auth" className="text-slate-300 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Button 
              onClick={onGetStartedClick}
              className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 font-medium"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
