import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '../../../lib/utils/handleApiError';
import {
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from '../../../lib/paymentMethods';
import type { ApiMessage, PaymentMethod } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentMethod | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = (session.user as any).id;
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ message: 'id required' });

    if (req.method === 'DELETE') {
      await deletePaymentMethod(id);
      return res.status(200).json({ message: 'deleted' });
    }

    if (req.method === 'PATCH') {
      await setDefaultPaymentMethod(Number(userId), id);
      return res.status(200).json({ message: 'updated' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return handleApiError(res, err, 'Failed to manage payment method');
  }
}
