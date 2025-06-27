import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getProductByUuid } from '@lib/db';
import { findUserById } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { CheckoutSessionResponse, ApiMessage } from '../../../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutSessionResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { items, email, shipping } = req.body || {};
  if (!items || !email) {
    return res.status(400).json({ message: 'items and email required' });
  }
  try {
    let stripeAccountId: string | undefined;
    if (items.length > 0) {
      const product = await getProductByUuid(
        String(items[0].uuid || items[0].id)
      );
      if (product) {
        const vendor = await findUserById(product.vendorId);
        if (vendor && vendor.stripeAccountId) {
          stripeAccountId = vendor.stripeAccountId;
        }
      }
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((it: any) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: it.title },
          unit_amount: Math.round(parseFloat(it.minPrice || 0) * 100),
        },
        quantity: it.qty,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout/cancel`,
      payment_intent_data: stripeAccountId
        ? { transfer_data: { destination: stripeAccountId } }
        : undefined,
      metadata: {
        email,
        shippingName: shipping?.name || '',
        shippingAddress: shipping?.address || '',
        items: JSON.stringify(items),
      },
    });
    return res.status(200).json({ url: session.url ?? '', id: session.id });
  } catch (e) {
    return handleApiError(res, e, 'stripe error');
  }
}
