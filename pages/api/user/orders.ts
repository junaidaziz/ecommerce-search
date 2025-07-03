import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForUser } from '@lib/orders';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';
import type { Order, ApiMessage } from '../@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const orders = await getOrdersForUser(session.user.email);
    return res.status(200).json(orders);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get orders');
  }
}
