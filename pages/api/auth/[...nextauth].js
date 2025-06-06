// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

import { findUser, addUser } from '../../../lib/users.js';

export const authOptions = {
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
        if (
          !credentials ||
          typeof credentials.email !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          return null;
        }

        const user = findUser(credentials.email);
        if (user && user.password === credentials.password) {
          const { first_name, last_name, brand_name, gender, role } = user;
          return {
            id: user.email,
            email: user.email,
            name: `${first_name} ${last_name}`,
            brandName: brand_name,
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
      // When someone logs in with Google or GitHub for the first time, create them in our “DB”
      if (account.provider === 'google' || account.provider === 'github') {
        // profile.name, profile.given_name, etc. come from the OAuth provider
        const existing = findUser(user.email);
        if (!existing) {
          const nameParts = (profile?.name || '').split(' ') || [];
          addUser({
            email: user.email,
            password: '',
            first_name: profile?.given_name || nameParts[0] || '',
            last_name: profile?.family_name || nameParts.slice(1).join(' ') || '',
            brand_name: null,
            gender: profile?.gender || '',
            role: 'customer',
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // On initial sign‐in, `user` is populated. Attach its `role` to the JWT token.
      if (user) {
        token.role = user.role;
      } else if (!token.role) {
        // On subsequent requests, if token.role is missing, fetch it from our “DB”
        const dbU = findUser(token.email);
        if (dbU) {
          token.role = dbU.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Expose `role` on session.user
      if (session.user) {
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
