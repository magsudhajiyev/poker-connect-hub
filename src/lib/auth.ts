import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user id to session
      if (session?.user && user) {
        session.user.id = user.id;
        // Add any additional user properties
        session.user.hasCompletedOnboarding = (user as any).hasCompletedOnboarding || false;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (user) {
        token.id = user.id;
        token.hasCompletedOnboarding = (user as any).hasCompletedOnboarding || false;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
});