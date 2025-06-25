'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
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
        <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white hover:bg-slate-800/80">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-slate-900">
          <GlobalSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const IndexContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <div className="w-full">
        <MobileSidebar />
        <Header />
        <main className="pt-16 sm:pt-20 w-full">
          <div className="w-full overflow-x-hidden">
            <HeroSection />
            <section id="features" className="w-full">
              <FeaturesSection />
            </section>
            <section id="testimonials" className="w-full">
              <TestimonialsSection />
            </section>
            <div className="w-full">
              <StatsSection />
            </div>
            <section id="pricing" className="w-full">
              <PricingSection />
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <SidebarProvider>
      <IndexContent />
    </SidebarProvider>
  );
}