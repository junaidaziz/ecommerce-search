import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUser, addUser } from '../../../lib/users';
import type { User as AppUser } from '../../../types/user';

// Extend the User type to include 'role'
declare module 'next-auth' {
  interface User extends AppUser {}
  interface Session {
    user?: AppUser & { [key: string]: any };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends AppUser {}
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error('NEXTAUTH_SECRET environment variable is not set');
}
if (!process.env.NEXTAUTH_URL) {
  console.error('NEXTAUTH_URL environment variable is not set');
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        const user = await findUser(credentials.email);
        if (
          user &&
          !user.disabled &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          const { firstName, lastName, brandName, gender, role } = user;
          return {
            id: user.email,
            email: user.email,
            name: `${firstName} ${lastName}`,
            brandName,
            gender,
            role,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        if (!user.email) {
          return false;
        }
        const existing = await findUser(user.email);
        if (existing && existing.disabled) {
          return false;
        }
        if (!existing) {
          const nameParts = (profile?.name || '').split(' ');
          await addUser({
            email: user.email,
            password: '',
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            brand_name: '',
            gender: '',
            role: 'USER',
          });
        }
      }
      if (user && user.disabled) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      } else if (!token.role) {
        if (typeof token.email === 'string') {
          const dbUser = await findUser(token.email);
          if (dbUser) token.role = dbUser.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
