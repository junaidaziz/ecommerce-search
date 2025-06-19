import { getOrdersForVendor } from '../../../lib/orders';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { vendor } = req.query;
  if (!vendor) {
    return res.status(400).json({ message: 'vendor required' });
  }
  const orders = getOrdersForVendor(vendor);
  const summary = {
    totalOrders: orders.length,
    totalRevenue: 0,
    topProducts: [],
  };
  const counts = {};
  orders.forEach((o) => {
    summary.totalRevenue += o.total || 0;
    o.items
      .filter((i) => i.VENDOR === vendor)
      .forEach((i) => {
        counts[i.ID] = (counts[i.ID] || 0) + i.qty;
      });
  });
  summary.topProducts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => ({ id, qty }));
  return res.status(200).json(summary);
}

