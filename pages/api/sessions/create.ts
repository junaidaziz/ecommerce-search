import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { trackLoginSession } from '@lib/sessions';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import crypto from 'crypto';

/**
 * Create a new login session record
 * This should be called by the client after successful login
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

    // Find user by email
    const user = await findUser(session.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get or create session token from cookie
    let sessionToken = req.cookies['next-auth.session-token'] 
      || req.cookies['__Secure-next-auth.session-token'];
    
    // If no session token exists, generate one
    // This shouldn't normally happen, but we handle it gracefully
    if (!sessionToken) {
      sessionToken = crypto.randomBytes(32).toString('hex');
    }

    // Track the login session
    await trackLoginSession(user.id, sessionToken, req);

    return res.status(200).json({ message: 'Session created successfully' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to create session');
  }
}
