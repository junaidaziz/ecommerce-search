import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getCategoryTree,
  getCategoriesPaginated,
  createCategory,
  getCategoriesFlat,
} from '@lib/products';
import { handleApiError } from '@utils/handleApiError';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import type {
  CategoriesResponse,
  CategoryResponse,
  ApiMessage,
  Category,
} from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategoriesResponse | CategoryResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const { search = '', page, limit } = req.query || {};
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
    if (req.method === 'POST') {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { name, slug } = req.body as Partial<Category>;
      if (!name) return res.status(400).json({ message: 'name required' });
      const exists = (await getCategoriesFlat()).find(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() ||
          (slug && c.slug?.toLowerCase() === String(slug).toLowerCase())
      );
      if (exists) {
        return res
          .status(409)
          .json({ message: 'category exists', category: exists });
      }
      const category = await createCategory(name, slug);
      return res.status(201).json({ category });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load categories');
  }
}
