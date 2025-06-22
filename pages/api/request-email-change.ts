import type { NextApiRequest, NextApiResponse } from 'next';
import { setResetToken, findUser } from '../../lib/users';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { handleApiError } from '../../lib/utils/handleApiError';
import type { ResetTokenResponse, ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetTokenResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ message: 'Method Not Allowed' });
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user)
      return res.status(401).json({ message: 'Unauthorized' });
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ message: 'email required' });
    if (await findUser(email))
      return res.status(409).json({ message: 'Email exists' });
    const token = crypto.randomBytes(6).toString('hex');
    const expires = Date.now() + 3600 * 1000;
    await setResetToken(session.user.email, token, expires);
    return res.status(200).json({ message: 'Code sent', token });
  } catch (e) {
    return handleApiError(res, e, 'Failed to request email change');
  }
}
