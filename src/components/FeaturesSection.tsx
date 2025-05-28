
import { Card } from '@/components/ui/card';
import { ArrowRight, BarChart3, Share2, Users, TrendingUp, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Share2,
    title: 'Hand Sharing',
    description: 'Share your most interesting hands with the community. Get feedback, analysis, and insights from players of all levels.',
    color: 'text-emerald-500'
  },
  {
    icon: BarChart3,
    title: 'Stats Tracking',
    description: 'Import your hand histories and track your performance over time. Identify leaks and see your progress with intuitive visualizations.',
    color: 'text-blue-500'
  },
  {
    icon: Users,
    title: 'Community Feedback',
    description: 'Get instant feedback on your plays from the community. Learn from others\' experiences and improve your decision-making.',
    color: 'text-violet-500'
  },
  {
    icon: TrendingUp,
    title: 'Trending Hands',
    description: 'Discover the most discussed and interesting hands from the community. Learn from edge cases and unusual situations.',
    color: 'text-pink-500'
  },
  {
    icon: Users,
    title: 'Follow Players',
    description: 'Connect with like-minded players. Follow experts and friends to see their shared hands and learn from their approach.',
    color: 'text-emerald-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile Access',
    description: 'Access your stats and the community from anywhere. Share hands and get feedback right from the poker table.',
    color: 'text-blue-500'
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-16 md:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
            <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              Features
            </span>{' '}
            <span className="text-white">
              Designed for Poker Players
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Everything you need to analyze, share, and improve your poker gameplay in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-slate-900/60 border-slate-700/20 p-4 sm:p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`${feature.color} text-lg sm:text-xl`} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-slate-100">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
