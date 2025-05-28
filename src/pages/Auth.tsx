import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Mock authentication - check if email and password are provided
    if (formData.email && formData.password) {
      if (!isLogin) {
        // For registration, also check confirm password
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
      }
      
      console.log(isLogin ? 'Login successful!' : 'Registration successful!');
      // Redirect to onboarding page
      navigate('/onboarding');
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-700/20 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 text-lg font-bold">♦</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                PokerConnect
              </span>
            </div>
            
            {/* Back to Home Link */}
            <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Auth Container */}
      <main className="pt-32 pb-16 px-4 md:px-0">
        <div className="max-w-md mx-auto">
          {/* Auth Form Container */}
          <div className="bg-slate-900/60 rounded-2xl shadow-2xl border border-slate-700/20 p-8">
            {/* Toggle Section */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-1 bg-slate-800/40 p-1 rounded-xl">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isLogin
                      ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    !isLogin
                      ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>
            
            {/* Form Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-slate-400 mt-1">
                {isLogin ? 'Sign in to your account to continue' : 'Join the poker community today'}
              </p>
            </div>
            
            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="block text-sm text-slate-400 mb-1">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-[50px] pl-10 pr-4 bg-slate-800/60 rounded-xl border-slate-700/30 text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="password" className="block text-sm text-slate-400">
                    Password
                  </Label>
                  {isLogin && (
                    <span className="text-sm text-violet-500 hover:text-violet-400 cursor-pointer">
                      Forgot Password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-[50px] pl-10 pr-12 bg-slate-800/60 rounded-xl border-slate-700/30 text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password for Register */}
              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm text-slate-400 mb-1">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-[50px] pl-10 pr-4 bg-slate-800/60 rounded-xl border-slate-700/30 text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Remember Me (Login only) */}
              {isLogin && (
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded border mr-2 flex items-center justify-center transition-colors ${
                      rememberMe
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-slate-800/60 border-slate-700/30 hover:border-slate-600'
                    }`}
                  >
                    {rememberMe && <span className="text-slate-900 text-xs">✓</span>}
                  </button>
                  <span className="text-sm text-slate-400">Remember me for 30 days</span>
                </div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 rounded-xl text-slate-900 font-medium transition-all duration-300"
              >
                {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-slate-700/30"></div>
              <span className="px-4 text-sm text-slate-400">OR</span>
              <div className="flex-1 h-px bg-slate-700/30"></div>
            </div>
            
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-[50px] bg-slate-800/40 rounded-xl border-slate-700/30 text-slate-200 hover:bg-slate-800/60"
              >
                <span className="text-lg mr-2">G</span>
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-[50px] bg-slate-800/40 rounded-xl border-slate-700/30 text-slate-200 hover:bg-slate-800/60"
              >
                <span className="text-lg mr-2">f</span>
                Continue with Facebook
              </Button>
            </div>
            
            {/* Toggle Link */}
            <p className="mt-6 text-center text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-violet-500 hover:text-violet-400 cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-slate-700/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 text-xs font-bold">♦</span>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                PokerConnect
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-slate-400 hover:text-slate-200 cursor-pointer">Terms & Conditions</span>
              <span className="text-sm text-slate-400 hover:text-slate-200 cursor-pointer">Privacy Policy</span>
              <span className="text-sm text-slate-400 hover:text-slate-200 cursor-pointer">Help & Support</span>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span className="text-slate-400 hover:text-slate-200 cursor-pointer">𝕏</span>
              <span className="text-slate-400 hover:text-slate-200 cursor-pointer">📷</span>
              <span className="text-slate-400 hover:text-slate-200 cursor-pointer">🎮</span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">
            © 2023 PokerConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
