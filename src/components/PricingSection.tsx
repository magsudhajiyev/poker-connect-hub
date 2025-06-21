
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for getting started',
      features: [
        'Basic hand analysis',
        'Community access',
        'Limited hand sharing',
        'Basic statistics',
      ],
      popular: false,
    },
    {
      name: 'Standard',
      monthlyPrice: 20,
      annualPrice: 16, // 20% discount
      description: 'Great for regular players',
      features: [
        'Advanced hand analysis',
        'Unlimited hand sharing',
        'Detailed statistics',
        'Priority support',
        'Export capabilities',
      ],
      popular: true,
    },
    {
      name: 'Pro',
      monthlyPrice: 70,
      annualPrice: 56, // 20% discount
      description: 'For serious poker professionals',
      features: [
        'All Standard features',
        'AI-powered insights',
        'Custom analytics',
        'Private coaching sessions',
        'Tournament tracking',
        'White-label options',
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            <span className="text-white">Choose Your </span>
            <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">Perfect Plan</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Unlock your poker potential with our comprehensive analysis tools
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-slate-900/60 border-slate-700/20 hover:scale-105 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-emerald-500/50 bg-slate-800/80' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-white mb-2">{plan.name}</CardTitle>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-400 ml-1">
                      {plan.monthlyPrice > 0 ? '/month' : ''}
                    </span>
                  </div>
                  {isAnnual && plan.monthlyPrice > 0 && (
                    <div className="text-slate-500 text-sm mt-1">
                      <span className="line-through">${plan.monthlyPrice}/month</span>
                      <span className="text-emerald-400 ml-2">billed annually</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-slate-900' 
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {plan.monthlyPrice === 0 ? 'Get Started' : 'Choose Plan'}
                </Button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
