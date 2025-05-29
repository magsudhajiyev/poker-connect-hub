
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import PokerChipConfetti from '@/components/PokerChipConfetti';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-slate-950/80 backdrop-blur-xl border border-slate-800/50">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-slate-950">
          <GlobalSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const IndexContent = () => {
  const { isCollapsed } = useSidebar();
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    setShowConfetti(true);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <MobileSidebar />
      <Header onGetStartedClick={handleGetStartedClick} />
      <main className="pt-16 sm:pt-20">
        <HeroSection onGetStartedClick={handleGetStartedClick} />
        <FeaturesSection />
        <TestimonialsSection />
        <StatsSection />
        <PricingSection onGetStartedClick={handleGetStartedClick} />
      </main>
      <Footer />
      <PokerChipConfetti 
        isActive={showConfetti} 
        onComplete={handleConfettiComplete} 
      />
    </div>
  );
};

const Index = () => {
  return (
    <SidebarProvider>
      <IndexContent />
    </SidebarProvider>
  );
};

export default Index;
