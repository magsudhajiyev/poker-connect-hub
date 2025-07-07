'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, X, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AddPasswordPromptProps {
  onDismiss?: () => void;
  autoShow?: boolean;
}

export const AddPasswordPrompt = ({
  onDismiss,
  autoShow: _autoShow = true,
}: AddPasswordPromptProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user already has password or is not authenticated
  if (!user || user.hasPassword || isDismissed) {
    return null;
  }

  // Only show for Google users without passwords
  if (user.hasPassword !== false) {
    return null;
  }

  const handleAddPassword = () => {
    router.push('/auth/add-password');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="bg-gradient-to-r from-emerald-950/20 to-violet-950/20 border-emerald-500/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-200">Secure Your Account</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Add a password to sign in with email
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">
            You're currently signed in with Google. Create a password to also sign in with your
            email address.
          </p>

          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Lock className="w-3 h-3" />
            <span>Optional • You can continue using Google sign-in</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddPassword}
              className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-white text-sm"
            >
              Add Password
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-sm"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
