import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import {
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodsForUser,
} from '@lib/paymentMethods';
import { handleApiError } from '@utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id)
      return res.status(401).json({ message: 'Unauthorized' });
    const userId = Number(session.user.id);
    const id = parseInt(String(req.query.id));
    if (isNaN(id)) return res.status(400).json({ message: 'invalid id' });
    if (req.method === 'DELETE') {
      await deletePaymentMethod(id);
      const methods = await getPaymentMethodsForUser(userId);
      return res.status(200).json(methods);
    }
    if (req.method === 'PATCH') {
      const { makeDefault } = req.body || {};
      if (makeDefault) {
        await setDefaultPaymentMethod(userId, id);
      }
      const methods = await getPaymentMethodsForUser(userId);
      return res.status(200).json(methods);
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage payment methods');
  }
}
