import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { handleApiError } from '@utils/handleApiError';
import type { CheckoutSessionResponse, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutSessionResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  }
  const { items, lineItems, orderId, email, shipping } = req.body || {};
  if ((!items && !lineItems) || !email || !orderId) {
    return res
      .status(400)
      .json({ message: 'orderId, email and items required' });
  }
  try {
    const stripeLineItems = lineItems
      ? lineItems
      : items.map((it: any) => ({
          price_data: {
            currency: 'usd',
            product_data: { name: it.title },
            unit_amount: Math.round(parseFloat(it.minPrice || 0) * 100),
          },
          quantity: it.qty,
        }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout/cancel`,
      metadata: {
        email,
        orderId,
        shippingName: shipping?.name || '',
        shippingAddress: shipping?.address || '',
        items: JSON.stringify(items || lineItems),
      },
    });
    return res.status(200).json({ url: session.url ?? '', id: session.id });
  } catch (e) {
    return handleApiError(res, e, 'stripe error');
  }
}
