import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendor } from '../../../lib/orders';
import { handleApiError } from '../../../lib/utils/handleApiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { vendor } = req.query;
    if (!vendor) {
      return res.status(400).json({ message: 'vendor required' });
    }
    const orders = await getOrdersForVendor(vendor as string);
    return res.status(200).json(orders);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get orders');
  }
}
