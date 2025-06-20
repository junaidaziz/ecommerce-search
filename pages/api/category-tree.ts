import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoryTree } from '../../lib/products';
import { handleApiError } from '../../lib/utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const data = await getCategoryTree();
      return res.status(200).json(data);
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load categories');
  }
}
