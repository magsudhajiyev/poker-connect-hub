
import { Heart, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
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
          
          {/* Social links */}
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 pt-6 border-t border-slate-800/30 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <p className="text-slate-500 text-sm">
            © 2024 PokerConnect. All rights reserved.
          </p>
          <div className="flex items-center text-slate-500 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 mx-1 text-red-500" />
            <span>for poker players</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
