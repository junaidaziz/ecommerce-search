import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllOrders } from '../../../lib/orders';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { AnalyticsData, ApiMessage, Order } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsData | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    const orders: Order[] = await getAllOrders();
    const summary: AnalyticsData = {
      totalOrders: orders.length,
      totalRevenue: 0,
      topProducts: [],
    };
    const counts: Record<string, number> = {};
    for (const o of orders) {
      summary.totalRevenue += o.total ?? 0;
      counts[o.product.id] = (counts[o.product.id] ?? 0) + o.quantity;
    }
    summary.topProducts = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, qty]): { id: string; qty: number } => ({ id, qty }));
    res.status(200).json(summary);
  } catch (error) {
    handleApiError(res, error, 'Failed to load analytics');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
