import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoryTree } from '../../lib/products';
import { handleApiError } from '../../lib/utils/handleApiError';
import type { CategoriesResponse, ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategoriesResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const categories = await getCategoryTree();
      return res.status(200).json({ categories });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load categories');
  }
}
