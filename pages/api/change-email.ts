import type { NextApiRequest, NextApiResponse } from 'next';
import { changeEmail } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import type { ApiMessage } from '../../types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  if (req.method !== 'POST')
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });
  const { email, oldToken, newToken } = req.body as {
    email?: string;
    oldToken?: string;
    newToken?: string;
  };
  if (!email || !oldToken || !newToken)
    return res
      .status(400)
      .json({ message: 'email, oldToken and newToken required' });
  try {
    await changeEmail(session.user.email, oldToken, newToken, email);
    return res.status(200).json({ message: 'Email updated' });
  } catch (e) {
    return handleApiError(res, e, 'Error updating email');
  }
}
