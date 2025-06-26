import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoryTree, getCategoriesPaginated } from '../../lib/products';
import { handleApiError } from '../../lib/utils/handleApiError';
import type { CategoriesResponse, ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategoriesResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const { search = '', page, limit } = req.query;
      if (page || limit || search) {
        const pageNum = parseInt(String(page || '1'), 10);
        const limitNum = parseInt(String(limit || '20'), 10);
        const offset = (pageNum - 1) * limitNum;
        const categories = await getCategoriesPaginated(
          String(search || ''),
          limitNum,
          offset
        );
        return res.status(200).json({ categories });
      }
      const categories = await getCategoryTree();
      return res.status(200).json({ categories });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load categories');
  }
}
