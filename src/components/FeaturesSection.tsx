
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
    <section id="features" className="py-24 px-4 bg-slate-900/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              Features
            </span>{' '}
            <span className="text-white">
              Designed for Poker Players
            </span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Everything you need to analyze, share, and improve your poker gameplay in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-slate-900/60 border-slate-700/20 p-6 hover:border-slate-600/50 transition-all duration-500 hover:scale-105 group card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <feature.icon className={`${feature.color} text-xl group-hover:animate-pulse`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-100 group-hover:text-white transition-colors duration-300">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                {feature.description}
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="text-emerald-500 w-5 h-5 transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
