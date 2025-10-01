import { getServerSession } from 'next-auth/next';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { USER_ROLES } from '@/types';

export interface AuthedNextApiRequest extends NextApiRequest {
  user?: Session['user'];
}

export function withRole(roles: (string | keyof typeof USER_ROLES)[]) {
  return (handler: NextApiHandler) =>
    async (req: AuthedNextApiRequest, res: NextApiResponse) => {
      const session = await getServerSession(req, res, authOptions(req, res));
      const role = session?.user?.role as string | undefined;
      if (!session || !role || !roles.includes(role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = session.user;
      return handler(req, res);
    };
}
