
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Tournament Player',
    avatar: 'SC',
    content: 'PokerConnect has revolutionized how I analyze my game. The community feedback is invaluable for improving my tournament strategy.',
    gradient: 'from-emerald-500 to-blue-500'
  },
  {
    name: 'Mike Rodriguez',
    role: 'Cash Game Specialist',
    avatar: 'MR',
    content: 'I love being able to share interesting spots and get multiple perspectives. It\'s like having a poker study group available 24/7.',
    gradient: 'from-blue-500 to-violet-500'
  },
  {
    name: 'Alex Thompson',
    role: 'Professional Player',
    avatar: 'AT',
    content: 'The stats tracking feature helped me identify several leaks in my game. My win rate has improved significantly since joining.',
    gradient: 'from-violet-500 to-pink-500'
  }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 px-4 bg-slate-900/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">What </span>
            <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">Players</span>
            <span className="text-white"> Are Saying</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-slate-900/60 border-slate-700/20 p-6 hover:scale-105 transition-all duration-500 hover:bg-slate-800/60 group animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` } as React.CSSProperties}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-slate-900 font-bold mr-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 group-hover:text-white transition-colors duration-300">{testimonial.name}</h4>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">"{testimonial.content}"</p>
              
              {/* Decorative quote marks */}
              <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                <span className="text-6xl text-emerald-500 leading-none">"</span>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Floating poker cards decoration */}
        <div className="relative mt-12 opacity-10">
          <div className="absolute left-10 top-0 animate-float">
            <div className="w-8 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center text-xl">A♠</div>
          </div>
          <div className="absolute right-20 top-0 animate-float" style={{ animationDelay: '1s' } as React.CSSProperties}>
            <div className="w-8 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center text-xl text-red-500">K♥</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
