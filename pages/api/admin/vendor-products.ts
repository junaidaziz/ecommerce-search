import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from '../../../lib/products';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await getPendingProducts());
    }
    if (req.method === 'PUT') {
      const { id, action } = req.body || {};
      if (!id || !action)
        return res.status(400).json({ message: 'id and action required' });
      if (action === 'approve') {
        await approveProduct(id);
        return res.status(200).json({ message: 'approved' });
      }
      if (action === 'reject') {
        await rejectProduct(id);
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
