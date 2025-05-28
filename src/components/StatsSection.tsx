
import { Card } from '@/components/ui/card';

const StatsSection = () => {
  const stats = [
    { number: '10,000+', label: 'Active Players' },
    { number: '150K+', label: 'Hands Shared' },
    { number: '50K+', label: 'Comments & Feedback' },
    { number: '95%', label: 'User Satisfaction' }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            <span className="text-white">Join the </span>
            <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">Fastest Growing</span>
            <span className="text-white"> Poker Community</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-900/60 border-slate-700/20 p-3 sm:p-4 md:p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent mb-1 sm:mb-2">
                {stat.number}
              </div>
              <div className="text-slate-400 text-xs sm:text-sm md:text-base">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
