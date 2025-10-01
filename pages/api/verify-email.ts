import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '@/types';
import {
  TOKEN_REQUIRED,
  INVALID_TOKEN,
  EMAIL_VERIFIED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  const token = getQueryParam(req.query.token);
  if (!token) {
    return res.status(400).json({ message: TOKEN_REQUIRED });
  }
  try {
    const result = await verifyUser(token);
    if (result.count === 0) {
      return res.status(400).json({ message: INVALID_TOKEN });
    }
    return res.status(200).json({ message: EMAIL_VERIFIED });
  } catch (e) {
    return handleApiError(res, e, 'Error verifying email');
  }
}
