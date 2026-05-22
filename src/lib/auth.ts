import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './db';
import User from '../models/User';
import crypto from 'crypto';

export function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const hashedPassword = hashPassword(credentials.password);

        if (user.password !== hashedPassword) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isOnboarded: user.isOnboarded,
          subjects: user.subjects,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isOnboarded = (user as any).isOnboarded;
        token.subjects = (user as any).subjects;
      }
      
      // Handle session updates manually (like after onboarding or settings edit)
      if (trigger === 'update' && session) {
        token.isOnboarded = session.isOnboarded ?? token.isOnboarded;
        token.subjects = session.subjects ?? token.subjects;
        if (session.name) token.name = session.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isOnboarded = token.isOnboarded;
        (session.user as any).subjects = token.subjects;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'studypulse-super-secret-development-key-2026',
};
