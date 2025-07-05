import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';

export async function checkSuperAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions(req, res));
  return session?.user?.role === 'SUPER_ADMIN';
}
