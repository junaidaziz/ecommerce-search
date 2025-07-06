import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { USER_ROLES } from '@/types';

export async function checkSuperAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions(req, res));
  return session?.user?.role === USER_ROLES.SUPER_ADMIN;
}
