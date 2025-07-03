import type { NextApiRequest, NextApiResponse } from 'next';
import { setResetToken, findUser, updateUserProfile } from '@lib/users';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';
import type { EmailChangeTokensResponse, ApiMessage } from '../../types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  EMAIL_REQUIRED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailChangeTokensResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ message: EMAIL_REQUIRED });
    if (await findUser(email))
      return res.status(409).json({ message: 'Email exists' });
    const oldToken = crypto.randomBytes(6).toString('hex');
    const newToken = crypto.randomBytes(6).toString('hex');
    const expires = Date.now() + 3600 * 1000;
    await setResetToken(session.user.email, oldToken, expires);
    await updateUserProfile(session.user.email, {
      verificationToken: newToken,
    });
    return res.status(200).json({ message: 'Codes sent', oldToken, newToken });
  } catch (e) {
    return handleApiError(res, e, 'Failed to request email change');
  }
}
