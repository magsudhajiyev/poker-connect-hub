import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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
    `Please check your .env.local file.`
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
    async signIn({ user, account, profile }) {
      // Validate user has required fields
      if (!user?.email) {
        return false;
      }
      
      // Add any domain restrictions here if needed
      // Example: const allowedDomain = "@yourcompany.com";
      // if (!user.email.endsWith(allowedDomain)) return false;
      
      // Log sign-in attempts in development
      if (process.env.NODE_ENV === "development") {
        console.log("Sign-in attempt:", {
          email: user.email,
          provider: account?.provider,
          timestamp: new Date().toISOString(),
        });
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
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // Let NextAuth handle cookies with default configuration
  debug: process.env.NODE_ENV === "development",
});