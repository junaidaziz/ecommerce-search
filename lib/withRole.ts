import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export function withRole(roles) {
  return (handler) => async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    const role = session?.user?.role;
    if (!session || !role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = session.user;
    return handler(req, res);
  };
}
