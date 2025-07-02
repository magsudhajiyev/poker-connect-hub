import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file.',
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('🔐 NextAuth signIn callback triggered:', {
        provider: account?.provider,
        email: user?.email,
        name: user?.name,
        hasUserData: Boolean(user),
        hasAccountData: Boolean(account),
      });

      // Validate user has required fields
      if (!user?.email) {
        console.error('❌ NextAuth signIn: No email provided');
        return false;
      }

      // Sync with backend for Google OAuth
      if (account?.provider === 'google') {
        console.log('🔄 NextAuth: Google OAuth detected, starting backend sync...', {
          googleId: account.providerAccountId,
          email: user.email,
          name: user.name,
          hasImage: Boolean(user.image),
        });

        try {
          const syncPayload = {
            email: user.email,
            name: user.name || '',
            googleId: account.providerAccountId,
            picture: user.image || '',
          };
          console.log('📤 NextAuth: Sending sync request to backend:', syncPayload);

          // Sync with backend to create user and get JWT tokens
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/sync`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(syncPayload),
            },
          );

          console.log('📥 NextAuth: Backend sync response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ NextAuth: Backend sync failed:', errorText);
            // Continue with NextAuth-only authentication
            console.warn('⚠️ NextAuth: Continuing with NextAuth session only (no backend)');
            return true;
          }

          const data = await response.json();
          console.log('✅ NextAuth: Backend sync successful, response data:', {
            success: data.success,
            hasUser: Boolean(data.data?.user),
            userEmail: data.data?.user?.email,
            hasCompletedOnboarding: data.data?.user?.hasCompletedOnboarding,
            hasTokens: Boolean(data.data?.tokens),
          });

          // Store hasCompletedOnboarding in the token for later use
          if (user && data.data?.user) {
            (user as any).hasCompletedOnboarding = data.data.user.hasCompletedOnboarding;
            console.log('💾 NextAuth: Storing onboarding status in user object:', {
              email: user.email,
              hasCompletedOnboarding: data.data.user.hasCompletedOnboarding,
              userObjectUpdated: Boolean((user as any).hasCompletedOnboarding),
            });
          }

          return true;
        } catch (error) {
          console.error('💥 NextAuth: Error during backend sync:', error);
          // Continue with NextAuth-only authentication
          console.warn('⚠️ NextAuth: Backend not available, continuing with NextAuth session only');
          return true;
        }
      }

      console.log('✅ NextAuth: Non-Google sign in, proceeding');
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('🎫 NextAuth JWT callback triggered:', {
        hasToken: Boolean(token),
        hasUser: Boolean(user),
        hasAccount: Boolean(account),
        isInitialSignIn: Boolean(account && user),
      });

      // Initial sign in
      if (account && user) {
        const jwtPayload = {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          googleId: account.provider === 'google' ? account.providerAccountId : undefined,
          hasCompletedOnboarding: (user as any).hasCompletedOnboarding,
        };

        console.log('🎫 NextAuth JWT: Creating initial JWT token:', {
          email: jwtPayload.email,
          hasGoogleId: Boolean(jwtPayload.googleId),
          hasCompletedOnboarding: jwtPayload.hasCompletedOnboarding,
          hasCompletedOnboardingType: typeof jwtPayload.hasCompletedOnboarding,
        });

        return jwtPayload;
      }

      console.log('🎫 NextAuth JWT: Returning existing token:', {
        email: token.email,
        hasCompletedOnboarding: (token as any).hasCompletedOnboarding,
      });

      return token;
    },
    async session({ session, token }) {
      console.log('🔒 NextAuth session callback triggered:', {
        hasSession: Boolean(session),
        hasToken: Boolean(token),
        tokenEmail: token?.email,
        tokenHasCompletedOnboarding: (token as any)?.hasCompletedOnboarding,
      });

      // Add token data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        (session.user as any).googleId = (token as any).googleId;
        (session.user as any).hasCompletedOnboarding = (token as any).hasCompletedOnboarding;

        console.log('🔒 NextAuth session: Session updated with token data:', {
          email: session.user.email,
          hasGoogleId: Boolean((session.user as any).googleId),
          hasCompletedOnboarding: (session.user as any).hasCompletedOnboarding,
          hasCompletedOnboardingType: typeof (session.user as any).hasCompletedOnboarding,
        });
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
});
