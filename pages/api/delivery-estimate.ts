import type { NextApiRequest, NextApiResponse } from 'next';
import { estimateDelivery, formatDelivery } from '../../lib/delivery';
import { handleApiError } from '../../lib/utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const country = (req.query.country as string) || '';
    if (!country) return res.status(400).json({ message: 'country required' });
    const date = estimateDelivery(country);
    return res.status(200).json({ date: formatDelivery(date) });
  } catch (e) {
    return handleApiError(res, e, 'delivery estimate error');
  }
}
