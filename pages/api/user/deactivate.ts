import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { setUserDisabled, findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    
    const session = await getServerSession(req, res, authOptions(req, res));
    if (!session?.user?.email) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }

    const user = await findUser(session.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent super admins from deactivating their account
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Super admins cannot deactivate their account' });
    }

    // Deactivate the account by setting disabled to true
    await setUserDisabled(session.user.email, true);
    
    return res.status(200).json({ message: 'Account deactivated successfully' });
  } catch (e) {
    return handleApiError(res, e, 'Failed to deactivate account');
  }
}
