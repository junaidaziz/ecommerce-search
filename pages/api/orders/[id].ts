import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById } from '../../../lib/orders';
import { updateOrderStatus } from '../../../lib/orders';
import { sendOrderStatusUpdate } from '../../../lib/email';
import { withRole } from '../../../lib/withRole';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'id required' });
  }

  if (req.method === 'GET') {
    const order = await getOrderById(String(id));
    if (!order) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json(order);
  }

  if (req.method === 'PATCH') {
    const { status } = req.body || {};
    if (!status || !['pending', 'shipped', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'invalid status' });
    }
    await updateOrderStatus(String(id), status);
    const order = await getOrderById(String(id));
    await sendOrderStatusUpdate(order.user_email, order);
    return res.status(200).json(order);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
