import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesFlat, createCategory } from '../../../lib/products';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { withRole } from '../../../lib/withRole';
import type { ApiMessage, Category } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string; category?: Category }>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name required' });
    const exists = (await getCategoriesFlat()).find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    const category = exists || (await createCategory(name));
    return res
      .status(exists ? 200 : 201)
      .json({ message: 'ok', category });
  } catch (error) {
    return handleApiError(res, error, 'Failed to create category');
  }
}

export default withRole(['BRAND'])(handler);
