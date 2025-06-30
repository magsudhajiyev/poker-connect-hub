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
      // Validate user has required fields
      if (!user?.email) {
        return false;
      }

      // Only sync with backend for Google OAuth
      if (account?.provider === 'google') {
        try {
          // Sync with backend to create user and get JWT tokens
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/backend/auth/google/sync`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                email: user.email,
                name: user.name || '',
                googleId: account.providerAccountId,
                picture: user.image || '',
              }),
            },
          );

          if (!response.ok) {
            console.error('Failed to sync with backend:', await response.text());
            return false;
          }

          const data = await response.json();
          console.log('Google user synced with backend:', data);

          // Store hasCompletedOnboarding in the token for later use
          if (user) {
            (user as any).hasCompletedOnboarding = data.user?.hasCompletedOnboarding || false;
          }

          return true;
        } catch (error) {
          console.error('Error syncing with backend:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          hasCompletedOnboarding: (user as any).hasCompletedOnboarding || false,
        };
      }

      return token;
    },
    async session({ session, token }) {
      // Add token data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        (session.user as any).hasCompletedOnboarding =
          (token as any).hasCompletedOnboarding || false;
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
