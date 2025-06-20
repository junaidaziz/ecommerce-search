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
    const summary = {
      totalOrders: orders.length,
      totalRevenue: 0,
      topProducts: [],
    };
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      summary.totalRevenue += o.total || 0;
      o.items
        .filter((i) => i.VENDOR === vendor)
        .forEach((i) => {
          counts[i.ID] = (counts[i.ID] || 0) + i.qty;
        });
    });
    summary.topProducts = Object.entries(counts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([id, qty]) => ({ id, qty }));
    return res.status(200).json(summary);
  } catch (error) {
    return handleApiError(res, error, 'Failed to load analytics');
  }
}

