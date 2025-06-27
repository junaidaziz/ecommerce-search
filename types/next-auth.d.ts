import 'next-auth';
import 'next-auth/jwt';
import type { Role } from '@prisma/client';
import type { User as AppUser } from './user';

declare module 'next-auth' {
  interface Session {
    user?: AppUser & {
      name?: string | null;
      role?: Role | string;
      brandId?: number;
    };
  }

  interface User extends AppUser {
    name?: string | null;
    role?: Role | string;
    brandId?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends AppUser {
    name?: string | null;
    role?: Role | string;
    brandId?: number;
  }
}
