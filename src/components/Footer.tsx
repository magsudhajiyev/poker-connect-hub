import { Heart, Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

const FooterNext = () => {
  return (
    <footer className="bg-slate-950/80 border-t border-slate-800/30 backdrop-blur-xl">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Logo and tagline */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent mb-2">
              PokerConnect
            </h3>
            <p className="text-slate-400 text-sm">
              Elevating poker players worldwide
            </p>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/blog" 
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 text-sm"
            >
              Blog
            </Link>
            <Link 
              href="/privacy-policy" 
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 text-sm"
            >
              Privacy
            </Link>
            <Link 
              href="/terms-conditions" 
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 text-sm"
            >
              Terms
            </Link>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-800/30 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} PokerConnect. Made with{' '}
            <Heart className="inline-block w-4 h-4 text-red-500 fill-red-500" />{' '}
            for poker players
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterNext;