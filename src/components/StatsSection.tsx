
import { Card } from '@/components/ui/card';

const StatsSection = () => {
  const stats = [
    { number: '10,000+', label: 'Active Players' },
    { number: '150K+', label: 'Hands Shared' },
    { number: '50K+', label: 'Comments & Feedback' },
    { number: '95%', label: 'User Satisfaction' }
  ];

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Join the </span>
            <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent animate-glow">Fastest Growing</span>
            <span className="text-white"> Poker Community</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-slate-900/60 border-slate-700/20 p-6 text-center hover:scale-110 transition-all duration-500 hover:bg-slate-800/60 group animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` } as React.CSSProperties}
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300 tabular-nums">
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm md:text-base group-hover:text-slate-300 transition-colors duration-300">{stat.label}</div>
              
              {/* Add poker chip decoration */}
              <div className="mt-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Decorative poker elements */}
        <div className="relative mt-16">
          <div className="absolute left-1/2 transform -translate-x-1/2 opacity-20">
            <div className="flex space-x-4 animate-bounce">
              <span className="text-4xl">♠</span>
              <span className="text-4xl text-red-500">♥</span>
              <span className="text-4xl text-red-500">♦</span>
              <span className="text-4xl">♣</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
