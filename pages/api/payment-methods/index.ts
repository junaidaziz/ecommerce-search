import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { paymentProvider } from '@lib/paymentProvider';
import {
  addPaymentMethod,
  getPaymentMethodsForUser,
} from '@lib/paymentMethods';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });
    let userId = session.user.brandId;
    if (typeof userId !== 'number') {
      const user = await findUser(session.user.email);
      userId = user?.id;
    }
    if (!userId) return res.status(401).json({ message: UNAUTHORIZED });
    if (req.method === 'GET') {
      const methods = await getPaymentMethodsForUser(userId);
      return res.status(200).json(methods);
    }
    if (req.method === 'POST') {
      const { number, expMonth, expYear, cvc, setDefault } = req.body || {};
      if (!number || !expMonth || !expYear || !cvc)
        return res.status(400).json({ message: 'card details required' });
      const tokenized = await paymentProvider.tokenizeCard({
        number,
        expMonth: Number(expMonth),
        expYear: Number(expYear),
        cvc,
      });
      const method = await addPaymentMethod(userId, {
        provider: 'mock',
        cardLast4: tokenized.cardLast4,
        cardBrand: tokenized.cardBrand,
        expMonth: tokenized.expMonth,
        expYear: tokenized.expYear,
        token: tokenized.token,
        isDefault: !!setDefault,
      });
      return res.status(200).json(method);
    }
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage payment methods');
  }
}
