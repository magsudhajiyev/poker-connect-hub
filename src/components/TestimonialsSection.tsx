
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
    <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-16 md:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6">
            <span className="text-white">What </span>
            <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">Players</span>
            <span className="text-white"> Are Saying</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-slate-900/60 border-slate-700/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-slate-900 font-bold mr-3 sm:mr-4 text-sm sm:text-base`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm sm:text-base">{testimonial.name}</h4>
                  <p className="text-slate-400 text-xs sm:text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">"{testimonial.content}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
