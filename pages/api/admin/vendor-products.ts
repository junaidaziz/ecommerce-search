import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from '@lib/products';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { PendingProduct, ApiMessage, USER_ROLES } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PendingProduct[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const list: PendingProduct[] = await getPendingProducts();
      res.status(200).json(list);
      return;
    }
    if (req.method === 'PUT') {
      const { uuid, action } = req.body as {
        uuid?: string;
        action?: 'approve' | 'reject';
      };
      if (!uuid || !action)
        return res.status(400).json({ message: 'uuid and action required' });
      if (action === 'approve') {
        await approveProduct(uuid);
        res.status(200).json({ message: 'approved' });
        return;
      }
      if (action === 'reject') {
        await rejectProduct(uuid);
        res.status(200).json({ message: 'rejected' });
        return;
      }
      res.status(400).json({ message: 'invalid action' });
      return;
    }
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  } catch (error) {
    handleApiError(res, error, 'Failed to process vendor products');
  }
}

export default withRole([USER_ROLES.SUPER_ADMIN])(handler);
