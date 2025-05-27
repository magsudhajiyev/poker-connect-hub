
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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">Fastest Growing</span> Poker Community
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-900/60 border-slate-700/20 p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm md:text-base">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
