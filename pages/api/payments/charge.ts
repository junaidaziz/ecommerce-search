import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '../../../lib/utils/handleApiError';
import {
  createPaymentMethod,
  getPaymentMethod,
} from '../../../lib/paymentMethods';
import { recordPayment } from '../../../lib/payments';
import { addOrder } from '../../../lib/orders';
import type { OrderIdResponse, ApiMessage } from '../../../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrderIdResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = (session.user as any).id;
    const {
      items,
      cardNumber,
      expMonth,
      expYear,
      cvc,
      paymentMethodId,
      saveMethod,
      setDefault,
      total,
    } = req.body || {};
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'items required' });
    let tokenId: string | null = null;
    let methodId: number | null = paymentMethodId || null;
    if (paymentMethodId) {
      const existing = await getPaymentMethod(
        Number(paymentMethodId),
        Number(userId)
      );
      if (!existing)
        return res.status(404).json({ message: 'payment method not found' });
      tokenId = existing.token;
    }
    if (!paymentMethodId) {
      if (!cardNumber || !expMonth || !expYear || !cvc) {
        return res.status(400).json({ message: 'card details required' });
      }
      const token = await stripe.tokens.create({
        card: {
          number: cardNumber,
          exp_month: expMonth,
          exp_year: expYear,
          cvc,
        },
      });
      tokenId = token.id;
      if (saveMethod) {
        const method = await createPaymentMethod(Number(userId), {
          provider: 'stripe',
          cardLast4: token.card?.last4 || '',
          cardBrand: token.card?.brand || '',
          expMonth: token.card?.exp_month || expMonth,
          expYear: token.card?.exp_year || expYear,
          token: token.id,
          isDefault: !!setDefault,
        });
        methodId = method.id;
      }
    }
    const charge = await stripe.charges.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      source: tokenId || undefined,
      description: 'Order payment',
    });

    const orders = await addOrder({
      userEmail: session.user.email,
      items,
      total,
      status: charge.status === 'succeeded' ? 'completed' : 'pending',
    });
    const orderId =
      Array.isArray(orders) && orders.length > 0 ? orders[0].id : '';

    await recordPayment({
      amount: total,
      provider: 'stripe',
      status: charge.status,
      transactionId: charge.id,
      order: { connect: { id: orderId } },
      paymentMethod: methodId ? { connect: { id: methodId } } : undefined,
    });

    return res.status(200).json({ id: orderId });
  } catch (err) {
    return handleApiError(res, err, 'Payment failed');
  }
}
