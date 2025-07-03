import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { addOrder } from '@lib/orders';
import { sendOrderConfirmation } from '@lib/email';
import { handleApiError } from '@utils/handleApiError';
import type { OrderIdResponse, ApiMessage } from '../../../types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrderIdResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  }
  const { sessionId } = req.body || {};
  if (!sessionId)
    return res.status(400).json({ message: 'sessionId required' });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'payment not completed' });
    }
    const metadata = session.metadata || {};
    const orders = await addOrder({
      userEmail: metadata.email,
      items: JSON.parse(metadata.items || '[]'),
      total: (session.amount_total ?? 0) / 100,
      status: 'processing',
      paymentMethod: 'stripe',
    });
    const orderId =
      Array.isArray(orders) && orders.length > 0 ? orders[0].id : '';
    await sendOrderConfirmation(metadata.email, { id: orderId });
    return res.status(200).json({ id: orderId });
  } catch (e) {
    return handleApiError(res, e, 'stripe error');
  }
}
