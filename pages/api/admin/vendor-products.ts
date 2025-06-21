import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from '../../../lib/products';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { PendingProduct, ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PendingProduct[] | ApiMessage>
) {
  try {
    if (req.method === 'GET') {
      const list = await getPendingProducts();
      return res.status(200).json(list as PendingProduct[]);
    }
    if (req.method === 'PUT') {
      const { uuid, action } = req.body as { uuid?: string; action?: string };
      if (!uuid || !action)
        return res.status(400).json({ message: 'uuid and action required' });
      if (action === 'approve') {
        await approveProduct(uuid);
        return res.status(200).json({ message: 'approved' });
      }
      if (action === 'reject') {
        await rejectProduct(uuid);
        return res.status(200).json({ message: 'rejected' });
      }
      return res.status(400).json({ message: 'invalid action' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to process vendor products');
  }
}


export default withRole(['SUPER_ADMIN'])(handler);
