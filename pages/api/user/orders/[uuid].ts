import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getOrderByUuid } from '@lib/orders';
import { handleApiError } from '@utils/handleApiError';
import type { Order, ApiMessage } from '../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const uuid = Array.isArray(req.query.uuid) ? req.query.uuid[0] : req.query.uuid;
    if (!uuid) return res.status(400).json({ message: 'uuid required' });
    const order = await getOrderByUuid(String(uuid));
    if (!order || order.userEmail !== session.user.email) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.status(200).json(order);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get order');
  }
}
