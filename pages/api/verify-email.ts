import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  const token = getQueryParam(req.query.token);
  if (!token) return res.status(400).json({ message: 'token required' });
  try {
    await verifyUser(token);
    return res.status(200).json({ message: 'Email verified' });
  } catch (e) {
    return handleApiError(res, e, 'Error verifying email');
  }
}
