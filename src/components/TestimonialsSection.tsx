
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
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">Players</span> Are Saying
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-slate-900/60 border-slate-700/20 p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-slate-900 font-bold mr-4`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100">{testimonial.name}</h4>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">"{testimonial.content}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
