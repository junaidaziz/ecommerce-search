import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '@/types';
import { EMAIL_REQUIRED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ exists: boolean } | ApiMessage>
): Promise<void> {
  try {
    const email = getQueryParam(req.query.email);
    if (!email) {
      return res.status(400).json({ message: EMAIL_REQUIRED });
    }
    const user = await findUser(email);
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    return handleApiError(res, error, 'Failed to check email');
  }
}
