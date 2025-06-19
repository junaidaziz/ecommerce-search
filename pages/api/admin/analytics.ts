import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllOrders } from '../../../lib/orders';
import { withRole } from '../../../lib/withRole';

function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const orders = getAllOrders();
  const summary = {
    totalOrders: orders.length,
    totalRevenue: 0,
    topProducts: [],
  };
  const counts = {};
  orders.forEach((o) => {
    summary.totalRevenue += o.total || 0;
    o.items.forEach((i) => {
      counts[i.ID] = (counts[i.ID] || 0) + i.qty;
    });
  });
  summary.topProducts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => ({ id, qty }));
  return res.status(200).json(summary);
}

export default withRole(['SUPER_ADMIN'])(handler);

