import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesFlat, createCategory } from '../../../lib/products';
import { handleApiError } from '../../../lib/utils/handleApiError';
import type { ApiMessage } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
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
    if (!exists) {
      await createCategory(name);
    }
    return res.status(201).json({ message: 'ok' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to create category');
  }
}
