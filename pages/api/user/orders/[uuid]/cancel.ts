import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getOrderByUuid, updateOrderStatus } from '@lib/orders';
import { stripe } from '@lib/stripe';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { logAudit } from '@lib/audit';
import type { ApiMessage } from '../../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) return res.status(400).json({ message: 'uuid required' });
    const order = await getOrderByUuid(uuid);
    if (!order || order.userEmail !== session.user.email) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (['shipped', 'delivered', 'completed'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }
    if (order.paymentMethod === 'card' && order.paymentReference) {
      await stripe.refunds.create({ payment_intent: order.paymentReference });
    }
    await updateOrderStatus(uuid, 'cancelled');
    logAudit('cancel_order', { uuid, by: session.user.email });
    return res.status(200).json({ message: 'cancelled' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to cancel order');
  }
}
