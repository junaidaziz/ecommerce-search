import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '../../../lib/utils/handleApiError';
import {
  listPaymentMethods,
  createPaymentMethod,
} from '../../../lib/paymentMethods';
import type { PaymentMethod, ApiMessage } from '../../../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentMethod[] | PaymentMethod | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = (session.user as any).id;
    if (!userId) return res.status(400).json({ message: 'Invalid user' });

    if (req.method === 'GET') {
      const methods = await listPaymentMethods(Number(userId));
      return res.status(200).json(methods as unknown as PaymentMethod[]);
    }

    if (req.method === 'POST') {
      const { cardNumber, expMonth, expYear, cvc, isDefault } = req.body || {};
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
      const method = await createPaymentMethod(Number(userId), {
        provider: 'stripe',
        cardLast4: token.card?.last4 || '',
        cardBrand: token.card?.brand || '',
        expMonth: token.card?.exp_month || expMonth,
        expYear: token.card?.exp_year || expYear,
        token: token.id,
        isDefault: !!isDefault,
      });
      return res.status(201).json(method as unknown as PaymentMethod);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return handleApiError(res, err, 'Failed to manage payment methods');
  }
}
