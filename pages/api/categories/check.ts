import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesFlat } from '@lib/products';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage, Category } from '@/types';
import { METHOD_NOT_ALLOWED, NAME_REQUIRED } from '@/constants/messages';

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
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const name = String(req.query.name || '').trim();
    if (!name) return res.status(400).json({ message: NAME_REQUIRED });
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
