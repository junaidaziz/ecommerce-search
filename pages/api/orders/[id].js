import { getOrderById } from '../../../lib/orders.js';
import { updateOrderStatus } from '../../../lib/orders.js';
import { sendOrderStatusUpdate } from '../../../lib/email.js';
import { withRole } from '../../../lib/withRole';

async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'id required' });
  }

  if (req.method === 'GET') {
    const order = getOrderById(String(id));
    if (!order) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json(order);
  }

  if (req.method === 'PATCH') {
    const { status } = req.body || {};
    if (!status || !['pending', 'shipped', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'invalid status' });
    }
    updateOrderStatus(String(id), status);
    const order = getOrderById(String(id));
    await sendOrderStatusUpdate(order.user_email, order);
    return res.status(200).json(order);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
