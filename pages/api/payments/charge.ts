import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { paymentProvider } from '@lib/paymentProvider';
import { recordPayment } from '@lib/payments';
import { getDb } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id)
      return res.status(401).json({ message: UNAUTHORIZED });
    if (req.method !== 'POST')
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    const { orderId, paymentMethodId, amount } = req.body || {};
    if (!orderId || !paymentMethodId || !amount)
      return res.status(400).json({ message: 'missing fields' });
    const db = getDb();
    const method = await db.paymentMethod.findUnique({
      where: { id: Number(paymentMethodId) },
    });
    if (!method) return res.status(400).json({ message: 'method not found' });
    const charge = await paymentProvider.charge(method.token, Number(amount));
    await recordPayment({
      orderId: Number(orderId),
      amount: Number(amount),
      provider: method.provider,
      status: charge.status,
      paymentMethodId: method.id,
      transactionId: charge.transactionId,
    });
    if (charge.status === 'succeeded') {
      await db.order.update({
        where: { id: Number(orderId) },
        data: { status: 'processing' },
      });
    }
    return res.status(200).json(charge);
  } catch (error) {
    return handleApiError(res, error, 'Failed to process payment');
  }
}
