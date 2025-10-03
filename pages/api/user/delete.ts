import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { deleteUser, findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'DELETE')
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    
    const session = await getServerSession(req, res, authOptions(req, res));
    if (!session?.user?.email) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }

    const user = await findUser(session.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent super admins from deleting their account
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Super admins cannot delete their account' });
    }

    // Delete the account permanently
    await deleteUser(session.user.email);
    
    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (e) {
    return handleApiError(res, e, 'Failed to delete account');
  }
}
