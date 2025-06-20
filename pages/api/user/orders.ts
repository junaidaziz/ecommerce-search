import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForUser } from '../../../lib/orders';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '../../../lib/utils/handleApiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const orders = await getOrdersForUser(session.user.email);
    return res.status(200).json(orders);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get orders');
  }
}
