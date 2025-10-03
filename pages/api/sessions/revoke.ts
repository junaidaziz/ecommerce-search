import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getDb } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

const prisma = getDb();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }

    const session = await getServerSession(req, res, authOptions(req, res));
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the session - only if it belongs to the current user
    const result = await prisma.loginSession.deleteMany({
      where: {
        uuid: sessionId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    return res.status(200).json({ message: 'Session revoked successfully' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to revoke session');
  }
}
