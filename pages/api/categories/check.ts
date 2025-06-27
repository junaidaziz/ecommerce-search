import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesFlat } from '@lib/products';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage, Category } from '../../../types';

interface CheckResponse {
  exists: boolean;
  category?: Category;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const name = String(req.query.name || '').trim();
    if (!name) return res.status(400).json({ message: 'name required' });
    const categories = await getCategoriesFlat();
    const match = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (match) {
      return res.status(200).json({ exists: true, category: match });
    }
    return res.status(200).json({ exists: false });
  } catch (error) {
    return handleApiError(res, error, 'Failed to check category');
  }
}
