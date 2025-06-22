import type { NextApiRequest, NextApiResponse } from 'next';
import { changeEmail } from '../../lib/users';
import { handleApiError } from '../../lib/utils/handleApiError';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import type { ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' });
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: 'Unauthorized' });
  const { email, token } = req.body as { email?: string; token?: string };
  if (!email || !token)
    return res.status(400).json({ message: 'email and token required' });
  try {
    await changeEmail(session.user.email, token, email);
    return res.status(200).json({ message: 'Email updated' });
  } catch (e) {
    return handleApiError(res, e, 'Error updating email');
  }
}
