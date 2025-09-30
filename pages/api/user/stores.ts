import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

const storeFollow: Record<string, string[]> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[]>
) {
  const session = await getServerSession(req, res, authOptions(req, res));
  if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED } as any);
  if (req.method !== 'GET')
    return res.status(405).json({ message: METHOD_NOT_ALLOWED } as any);
  const stores = storeFollow[session.user.email] || [];
  res.status(200).json(stores);
}
