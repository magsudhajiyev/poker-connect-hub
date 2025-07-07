'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AddPasswordPage = () => {
  const router = useRouter();
  const { user, refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if user already has password or not authenticated
  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  const validatePassword = (password: string): string[] => {
    const issues = [];
    if (password.length < 8) {
      issues.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('One lowercase letter');
    }
    if (!/\d/.test(password)) {
      issues.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('One special character');
    }
    return issues;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate password
    const passwordIssues = validatePassword(formData.password);
    if (passwordIssues.length > 0) {
      newErrors.password = `Password must have: ${passwordIssues.join(', ')}`;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/add-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Refresh auth context to update user data
        await refreshAuth();

        // Redirect after short delay
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      } else {
        setErrors({
          submit: data.error?.message || 'Failed to add password. Please try again.',
        });
      }
    } catch (_error) {
      setErrors({
        submit: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/90 backdrop-blur-sm border-slate-700/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-semibold text-slate-200">Password Added Successfully!</h2>
              <p className="text-slate-400">
                You can now sign in using either Google or your email and password.
              </p>
              <p className="text-slate-500 text-sm">
                Redirecting to complete your profile setup...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/90 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-slate-800" />
          </div>
          <CardTitle className="text-xl text-slate-200">Secure Your Account</CardTitle>
          <CardDescription className="text-slate-400">
            Create a password to also sign in with email (optional but recommended)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
            <p className="text-slate-300 text-sm">
              Welcome! You're signed in with Google. Create a password for additional security and
              convenience.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/30 text-slate-200 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-emerald-500/20 pr-10"
                  placeholder="Create a strong password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700/50"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/30 text-slate-200 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-emerald-500/20 pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700/50"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-white font-medium py-2.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Password...
                  </>
                ) : (
                  'Add Password'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              >
                Skip for now
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-slate-800/30 rounded-lg">
            <p className="text-slate-400 text-xs text-center">
              Password requirements: 8+ characters, uppercase, lowercase, number, special character
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPasswordPage;
