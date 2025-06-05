import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUser, addUser } from '../../../lib/users.js';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize(credentials) {
        const user = findUser(credentials.email);
        if (user && user.password === credentials.password) {
          const { first_name, last_name, brand_name, gender, role } = user;
          return {
            id: user.email,
            email: user.email,
            name: `${first_name} ${last_name}`,
            brandName: brand_name,
            gender,
            role
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        const existing = findUser(user.email);
        if (!existing) {
          addUser({
            email: user.email,
            password: '',
            first_name: profile?.given_name || '',
            last_name: profile?.family_name || '',
            brand_name: null,
            gender: profile?.gender || '',
            role: 'user'
          });
        }
      }
      return true;
    },
    session({ session }) {
      const dbUser = findUser(session.user.email);
      if (dbUser) {
        session.user.role = dbUser.role;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt'
  }
};

export default NextAuth(authOptions);

