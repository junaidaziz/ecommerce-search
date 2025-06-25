import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByUuid, updateOrderStatus } from '../../../lib/orders';
import { sendOrderStatusUpdate } from '../../../lib/email';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { Order, ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order | ApiMessage>
): Promise<void> {
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) {
      return res.status(400).json({ message: 'uuid required' });
    }

    if (req.method === 'GET') {
      const result = await getOrderByUuid(String(uuid));
      if (!result) return res.status(404).json({ message: 'Not found' });
      const { userEmail, ...order } = result;
      return res.status(200).json(order);
    }

    if (req.method === 'PATCH') {
      const { status } = req.body || {};
      if (!status || !['pending', 'shipped', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'invalid status' });
      }
      await updateOrderStatus(String(uuid), status);
      const result = await getOrderByUuid(String(uuid));
      if (!result) return res.status(404).json({ message: 'Not found' });
      const { userEmail, ...order } = result;
      await sendOrderStatusUpdate(userEmail, {
        id: order.id,
        status: order.status,
      });
      return res.status(200).json(order);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage order');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
