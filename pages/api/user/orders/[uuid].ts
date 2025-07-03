import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getOrderByUuid } from '@lib/orders';
import { handleApiError } from '@utils/handleApiError';
import type { Order, ApiMessage } from '../../../../types';
import { UNAUTHORIZED, NOT_FOUND, UUID_REQUIRED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const uuid = Array.isArray(req.query.uuid)
      ? req.query.uuid[0]
      : req.query.uuid;
    if (!uuid) return res.status(400).json({ message: UUID_REQUIRED });
    const order = await getOrderByUuid(String(uuid));
    if (!order || order.userEmail !== session.user.email) {
      return res.status(404).json({ message: NOT_FOUND });
    }
    return res.status(200).json(order);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get order');
  }
}
