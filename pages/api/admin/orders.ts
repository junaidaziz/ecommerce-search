import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllOrdersFiltered, updateOrderStatus } from '@lib/orders';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { Order, ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | ApiMessage>
) {
  try {
    if (req.method === 'GET') {
      const status = getQueryParam(req.query.status);
      const search = getQueryParam(req.query.search);
      const orders = await getAllOrdersFiltered({ status: status || undefined, search: search || undefined });
      return res.status(200).json(orders);
    }
    if (req.method === 'PATCH') {
      const uuid = getQueryParam(req.query.uuid);
      const { status } = req.body || {};
      if (!uuid || !status) {
        return res.status(400).json({ message: 'uuid and status required' });
      }
      await updateOrderStatus(uuid, status);
      return res.status(200).json({ message: 'updated' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (e) {
    return handleApiError(res, e, 'Failed to manage orders');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
