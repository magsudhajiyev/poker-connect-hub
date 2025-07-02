'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import { GlobalSidebar, SidebarProvider } from '@/components/GlobalSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white hover:bg-slate-800/80"
        >
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
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log('🏠 HomePage rendered:', {
    hasUser: Boolean(user),
    userEmail: user?.email,
    loading,
    isAuthenticated,
    hasCompletedOnboarding: user?.hasCompletedOnboarding,
    hasCompletedOnboardingType: typeof user?.hasCompletedOnboarding,
  });

  // Redirect authenticated users based on onboarding status
  useEffect(() => {
    console.log('🏠 HomePage useEffect triggered:', {
      loading,
      isAuthenticated,
      hasUser: Boolean(user),
      userEmail: user?.email,
      hasCompletedOnboarding: user?.hasCompletedOnboarding,
    });

    // Don't redirect while still loading auth state
    if (loading) {
      console.log('⏳ HomePage: Still loading, skipping redirect');
      return;
    }

    // If user is authenticated, redirect based on onboarding status
    if (isAuthenticated && user) {
      console.log('🏠 HomePage: Authenticated user detected:', {
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        hasCompletedOnboardingType: typeof user.hasCompletedOnboarding,
        isAuthenticated,
      });

      if (user.hasCompletedOnboarding === true) {
        console.log('📍 HomePage: Redirecting authenticated user to feed (onboarding complete)');
        router.push('/feed');
      } else {
        console.log(
          '📍 HomePage: Redirecting authenticated user to onboarding (onboarding not complete)',
          {
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            hasCompletedOnboardingType: typeof user.hasCompletedOnboarding,
          },
        );
        router.push('/onboarding');
      }
    } else {
      console.log('🏠 HomePage: User not authenticated or no user data');
    }
  }, [user, loading, isAuthenticated, router]);

  // Show loading or landing page
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <IndexContent />
    </SidebarProvider>
  );
}
