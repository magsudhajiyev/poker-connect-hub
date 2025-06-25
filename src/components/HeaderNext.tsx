'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PokerChipConfetti from './PokerChipConfetti';

const HeaderNext = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setShowConfetti(true);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    router.push('/auth');
  };

  const handleNavClick = (sectionId: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <>
      <PokerChipConfetti isActive={showConfetti} onComplete={handleConfettiComplete} />
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-xl flex items-center justify-center">
                <span className="text-slate-900 text-lg sm:text-xl font-bold">♦</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                PokerConnect
              </span>
            </Link>
            
            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
              <button onClick={() => handleNavClick('features')} className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Features</button>
              <button onClick={() => handleNavClick('testimonials')} className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Community</button>
              <button onClick={() => handleNavClick('testimonials')} className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Testimonials</button>
              <button onClick={() => handleNavClick('pricing')} className="text-slate-400 hover:text-slate-200 transition-colors text-[15px]">Pricing</button>
            </nav>
            
            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-slate-200 hover:text-slate-100 text-sm lg:text-[15px] px-3 lg:px-4">
                  Sign In
                </Button>
              </Link>
              <Button 
                onClick={handleGetStartedClick}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900 text-sm lg:text-[15px] font-medium flex items-center gap-2 transition-all duration-300"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden lg:inline">Get Started</span>
                <span className="lg:hidden">Start</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-400 hover:text-slate-200 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700/50">
              <nav className="flex flex-col space-y-4">
                <button onClick={() => handleNavClick('features')} className="text-slate-400 hover:text-slate-200 transition-colors py-2 text-left">Features</button>
                <button onClick={() => handleNavClick('testimonials')} className="text-slate-400 hover:text-slate-200 transition-colors py-2 text-left">Community</button>
                <button onClick={() => handleNavClick('testimonials')} className="text-slate-400 hover:text-slate-200 transition-colors py-2 text-left">Testimonials</button>
                <button onClick={() => handleNavClick('pricing')} className="text-slate-400 hover:text-slate-200 transition-colors py-2 text-left">Pricing</button>
                <div className="flex flex-col space-y-3 pt-4">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="text-slate-200 w-full justify-start">Sign In</Button>
                  </Link>
                  <Button 
                    onClick={handleGetStartedClick}
                    className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default HeaderNext;