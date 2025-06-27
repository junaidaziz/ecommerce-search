import type { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '@utils/handleApiError';
import type { TrendingResponse } from '../../types';

const trendingKeywords = [
  'iPhone 14',
  'Wireless Earbuds',
  'Gaming Laptop',
  'Smart Watch',
  'Portable Charger',
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendingResponse>
): void {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ keywords: [] });
    }
    res.status(200).json({ keywords: trendingKeywords });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load trending keywords');
  }
}
