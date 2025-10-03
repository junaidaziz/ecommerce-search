import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByUuid, updateOrderStatus } from '@lib/orders';
import { sendOrderStatusUpdate } from '@lib/email';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { Order, ApiMessage } from '@/types';
import { USER_ROLES } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  UUID_REQUIRED,
  CANCELLED,
} from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order | ApiMessage>
): Promise<void> {
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) {
      return res.status(400).json({ message: UUID_REQUIRED });
    }

    if (req.method === 'GET') {
      const result = await getOrderByUuid(String(uuid));
      if (!result) return res.status(404).json({ message: NOT_FOUND });
      const { userEmail, ...order } = result;
      return res.status(200).json(order);
    }

    if (req.method === 'PATCH') {
      const { status } = req.body || {};
      const allowed = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'completed',
        CANCELLED,
        'returned',
      ];
      if (!status || !allowed.includes(status)) {
        return res.status(400).json({ message: 'invalid status' });
      }
      await updateOrderStatus(String(uuid), status);
      const result = await getOrderByUuid(String(uuid));
      if (!result) return res.status(404).json({ message: NOT_FOUND });
      const { userEmail, ...order } = result;
      await sendOrderStatusUpdate(userEmail, {
        id: order.id,
        status: order.status,
      });
      return res.status(200).json(order);
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage order');
  }
}

export default withRole([USER_ROLES.BRAND, USER_ROLES.SUPER_ADMIN])(handler);
