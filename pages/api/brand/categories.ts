import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesFlat, createCategory } from '../../../lib/products';
import { handleApiError } from '../../../lib/utils/handleApiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { name, parentId } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name required' });
    const exists = (await getCategoriesFlat()).find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (!exists) {
      try {
        await createCategory(name, parentId || null);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'depth') {
          return res.status(400).json({ message: 'max depth exceeded' });
        }
        throw e;
      }
    }
    return res.status(201).json({ message: 'ok' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to create category');
  }
}
