import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { addOrder } from '../../../lib/orders';
import { sendOrderConfirmation } from '../../../lib/email';
import { handleApiError } from '../../../lib/utils/handleApiError';
import type { OrderIdResponse, ApiMessage } from '../../../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrderIdResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ message: 'sessionId required' });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'payment not completed' });
    }
    const metadata = session.metadata || {};
    const orderId = addOrder({
      userEmail: metadata.email,
      items: JSON.parse(metadata.items || '[]'),
      total: session.amount_total / 100,
      status: 'completed',
    });
    await sendOrderConfirmation(metadata.email, { id: orderId });
    return res.status(200).json({ id: orderId });
  } catch (e) {
    return handleApiError(res, e, 'stripe error');
  }
}
