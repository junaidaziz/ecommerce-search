import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByUuid, updateOrderStatus } from '@lib/orders';
import { stripe } from '@lib/stripe';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { logAudit } from '@lib/audit';
import type { ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  UUID_REQUIRED,
  CANCELLED,
  CANNOT_CANCEL_THIS_ORDER,
} from '@/constants/messages';

type NextApiRequestWithUser = NextApiRequest & { user?: { email?: string } };

async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  }
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) return res.status(400).json({ message: UUID_REQUIRED });
    const order = await getOrderByUuid(uuid);
    if (!order) return res.status(404).json({ message: NOT_FOUND });
    if (['delivered', 'completed'].includes(order.status)) {
      return res.status(400).json({ message: CANNOT_CANCEL_THIS_ORDER });
    }
    if (order.paymentMethod === 'card' && order.paymentReference) {
      await stripe.refunds.create({ payment_intent: order.paymentReference });
    }
    await updateOrderStatus(uuid, CANCELLED);
    logAudit('cancel_order', { uuid, by: req.user?.email });
    return res.status(200).json({ message: CANCELLED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to cancel order');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
