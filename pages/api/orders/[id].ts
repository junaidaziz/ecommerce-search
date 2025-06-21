import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById } from '../../../lib/orders';
import { updateOrderStatus } from '../../../lib/orders';
import { sendOrderStatusUpdate } from '../../../lib/email';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'id required' });
    }

    if (req.method === 'GET') {
      const result = await getOrderById(String(id));
      if (!result) return res.status(404).json({ message: 'Not found' });
      const { userEmail, ...order } = result;
      return res.status(200).json(order);
    }

    if (req.method === 'PATCH') {
      const { status } = req.body || {};
      if (!status || !['pending', 'shipped', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'invalid status' });
      }
      await updateOrderStatus(String(id), status);
      const result = await getOrderById(String(id));
      if (!result) return res.status(404).json({ message: 'Not found' });
      const { userEmail, ...order } = result;
      await sendOrderStatusUpdate(userEmail, order);
      return res.status(200).json(order);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage order');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
