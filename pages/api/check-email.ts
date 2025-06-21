import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser } from '../../lib/users';
import { handleApiError } from '../../lib/utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ exists: boolean } | { message: string }>
) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'email required' });
    }
    const user = await findUser(email);
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    return handleApiError(res, error, 'Failed to check email');
  }
}
