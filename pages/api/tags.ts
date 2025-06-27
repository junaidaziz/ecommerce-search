import type { NextApiRequest, NextApiResponse } from 'next';
import { getDistinctTags } from '@lib/products';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tags: string[] } | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const tags = await getDistinctTags(search);
    return res.status(200).json({ tags });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load tags');
  }
}
