import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { updateSessionActivity } from '@lib/sessions';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';

/**
 * Middleware to track session activity
 * This endpoint should be called periodically by the client to update session activity
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions(req, res));
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get session token from cookie
    const sessionToken = req.cookies['next-auth.session-token'] 
      || req.cookies['__Secure-next-auth.session-token'];

    if (sessionToken) {
      await updateSessionActivity(sessionToken);
    }

    return res.status(200).json({ message: 'Session activity updated' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to update session activity');
  }
}
