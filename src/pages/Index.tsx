
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
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
        <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-green-900/80 backdrop-blur-xl border border-green-800/50">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-green-950">
          <GlobalSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const IndexContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 relative">
      {/* Subtle card pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 0c16.569 0 30 13.431 30 30s-13.431 30-30 30S0 46.569 0 30 13.431 0 30 0zm0 6c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24S43.255 6 30 6zm0 4c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />
      <MobileSidebar />
      <Header />
      <main className="pt-16 sm:pt-20 relative z-10">
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <StatsSection />
        <section id="pricing">
          <PricingSection />
        </section>
      </main>
      <Footer />
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
