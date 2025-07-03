import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendorId } from '@lib/orders';
import { handleApiError } from '@utils/handleApiError';
import type { Order, ApiMessage } from '../../../types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const session = await getServerSession(req, res, authOptions);
    const brandId =
      typeof session?.user?.brandId === 'number'
        ? session.user.brandId
        : undefined;
    if (!brandId) {
      return res.status(401).json({ message: 'Unable to determine brand ID' });
    }
    const orders = await getOrdersForVendorId(brandId);
    return res.status(200).json(orders);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get orders');
  }
}
