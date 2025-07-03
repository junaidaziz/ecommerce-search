import type { NextApiRequest, NextApiResponse } from 'next';
import { resetPassword } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  if (req.method !== 'POST')
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: 'token and password required' });
  try {
    await resetPassword(token, password);
    return res.status(200).json({ message: 'Password reset' });
  } catch (e) {
    return handleApiError(res, e, 'Error resetting password');
  }
}
