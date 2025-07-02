import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByUuid, updateOrderStatus } from '@lib/orders';
import { stripe } from '@lib/stripe';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { logAudit } from '@lib/audit';
import type { ApiMessage } from '../../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) return res.status(400).json({ message: 'uuid required' });
    const order = await getOrderByUuid(uuid);
    if (!order) return res.status(404).json({ message: 'Not found' });
    if (['delivered', 'completed'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }
    if (order.paymentMethod === 'card' && order.paymentReference) {
      await stripe.refunds.create({ payment_intent: order.paymentReference });
    }
    await updateOrderStatus(uuid, 'cancelled');
    logAudit('cancel_order', { uuid, by: req.user?.email });
    return res.status(200).json({ message: 'cancelled' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to cancel order');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
