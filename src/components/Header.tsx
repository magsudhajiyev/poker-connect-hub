
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bars, UserPlus } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-xl flex items-center justify-center">
              <span className="text-slate-900 text-xl font-bold">♦</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              PokerConnect
            </span>
          </div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Features</a>
            <a href="#community" className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Community</a>
            <a href="#testimonials" className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Testimonials</a>
            <a href="#pricing" className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Pricing</a>
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:block text-slate-200 hover:text-slate-100 text-[15px]">
              Sign In
            </Button>
            <Button className="hidden md:flex px-6 py-3 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 text-[15px] font-medium items-center gap-2 transition-all duration-300">
              <UserPlus className="w-4 h-4" />
              <span>Get Started</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-400 hover:text-slate-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Bars className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/50">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-slate-400 hover:text-slate-200 transition-colors">Features</a>
              <a href="#community" className="text-slate-400 hover:text-slate-200 transition-colors">Community</a>
              <a href="#testimonials" className="text-slate-400 hover:text-slate-200 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-slate-400 hover:text-slate-200 transition-colors">Pricing</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" className="text-slate-200">Sign In</Button>
                <Button className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
