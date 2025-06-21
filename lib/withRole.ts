import { getServerSession } from 'next-auth/next';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

interface AuthedNextApiRequest extends NextApiRequest {
  user?: {
    email?: string | null;
    role?: string;
    [key: string]: unknown;
  };
}

export function withRole(roles: string[]) {
  return (handler: NextApiHandler) =>
    async (req: AuthedNextApiRequest, res: NextApiResponse) => {
      const session = await getServerSession(req, res, authOptions);
      const role = session?.user?.role;
      if (!session || !role || !roles.includes(role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = session.user;
      return handler(req, res);
    };
}
