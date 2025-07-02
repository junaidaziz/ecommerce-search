import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ name: string; address: string | null; country: string | null; email?: string } | { message: string }>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const dbUser = await findUser(session.user.email);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const name = `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim();
    return res.status(200).json({
      name,
      address: dbUser.address || null,
      country: dbUser.country || null,
      email: dbUser.email,
    });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load user info');
  }
}
