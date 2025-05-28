
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import { GlobalSidebar, SidebarProvider } from '@/components/GlobalSidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-slate-950/80 backdrop-blur-xl border border-slate-800/50 text-slate-200 hover:bg-slate-800/60">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-slate-950 border-slate-800">
        <GlobalSidebar />
      </SheetContent>
    </Sheet>
  );
};

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <GlobalSidebar />
        <main className="flex-1 lg:ml-64">
          <MobileSidebar />
          <Header />
          <div className="pt-16 sm:pt-20">
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <StatsSection />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
