import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, never> | { message: string }>
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });
  if (req.method !== 'GET')
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  res.status(200).json({});
}
