import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getCategoryTree,
  getCategoriesPaginated,
} from '../../lib/products';
import { handleApiError } from '../../lib/utils/handleApiError';
import type { CategoriesResponse, ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategoriesResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const q = typeof req.query?.q === 'string' ? req.query.q : '';
      const page = parseInt(String((req.query?.page as string) || '1'), 10);
      const perPage = parseInt(String((req.query?.perPage as string) || '20'), 10);
      if (q || req.query?.page || req.query?.perPage) {
        const { categories, total } = await getCategoriesPaginated(
          q,
          perPage,
          (page - 1) * perPage
        );
        return res.status(200).json({ categories, total, page });
      }
      const categories = await getCategoryTree();
      return res.status(200).json({ categories });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load categories');
  }
}
