import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { assignUserRoleIfMissing } from '@lib/db/user';
import type { Role } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions(req, res));
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { role } = req.body as { role?: Role };
  if (role !== 'USER' && role !== 'BRAND') {
    return res.status(400).json({ message: 'Invalid role' });
  }
  await assignUserRoleIfMissing(session.user.email, role);
  return res.status(200).json({ message: 'ok' });
}
