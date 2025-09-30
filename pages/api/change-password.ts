import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { findUser, updateUserProfile } from '@lib/users';
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
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: 'currentPassword and newPassword required' });

    const user = await findUser(session.user.email);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUserProfile(session.user.email, { password: hashed });
    return res.status(200).json({ message: 'Password updated' });
  } catch (e) {
    return handleApiError(res, e, 'Failed to update password');
  }
}
