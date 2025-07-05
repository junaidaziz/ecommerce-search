import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUser, addUser } from '@lib/users';
import { assignUserRoleIfMissing } from '@lib/db/user';
import type { Role } from '@prisma/client';
import type { User as AppUser } from '@/types';

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

export function authOptions(req: NextApiRequest, res: NextApiResponse): AuthOptions {
  return {
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
          const { id, firstName, lastName, brandName, gender, role } = user;
          return {
            id: user.email,
            email: user.email,
            name: `${firstName} ${lastName}`,
            brandName,
            gender,
            role,
            brandId: id,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        account &&
        (account.provider === 'google' || account.provider === 'github')
      ) {
        if (!user.email) {
          return false;
        }
        const roleCookie = req.cookies.signupRole as string | undefined;
        const existing = await findUser(user.email);
        if (existing && existing.disabled) {
          return false;
        }
        if (!existing) {
          const nameParts = (profile?.name || '').split(' ');
          await addUser({
            email: user.email,
            password: '',
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            brandName: '',
            gender: '',
            role: (roleCookie || 'USER') as Role,
          });
          if (!roleCookie) return '/select-role';
        } else if (roleCookie && existing.role !== roleCookie) {
          await assignUserRoleIfMissing(user.email, roleCookie as Role);
        }
        if (roleCookie) {
          res.setHeader('Set-Cookie', 'signupRole=; Path=/; Max-Age=0');
        }
      }
      if (user && (user as any).disabled) {
        return false;
      }
      return true;
    },
   async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        if ('brandId' in user && typeof (user as any).brandId === 'number') {
          token.brandId = (user as any).brandId;
        } else if (typeof user.email === 'string') {
          const dbUser = await findUser(user.email);
          if (dbUser) token.brandId = dbUser.id;
          if (dbUser) token.profileImage = dbUser.profileImage;
        }
      } else {
        if (token.brandId === undefined && typeof token.email === 'string') {
          const dbUser = await findUser(token.email);
          if (dbUser) {
            token.brandId = dbUser.id;
            if (!token.role) token.role = dbUser.role;
            token.profileImage = dbUser.profileImage;
          }
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        if (typeof token.brandId === 'number') {
          (session.user as { brandId?: number }).brandId = token.brandId;
        }
        (session.user as { profileImage?: string }).profileImage = token.profileImage as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions(req, res));
}
