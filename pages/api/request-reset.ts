import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser, setResetToken } from '@lib/users';
import crypto from 'crypto';
import { handleApiError } from '@utils/handleApiError';
import type { ResetTokenResponse, ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  USER_NOT_FOUND,
  EMAIL_REQUIRED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetTokenResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: EMAIL_REQUIRED });
    const user = await findUser(email);
    if (!user) return res.status(404).json({ message: USER_NOT_FOUND });
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600 * 1000; // 1 hour
    await setResetToken(email, token, expires);
    return res.status(200).json({ message: 'Reset email sent', token });
  } catch (error) {
    return handleApiError(res, error, 'Failed to request reset');
  }
}
