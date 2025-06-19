import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendor } from '../../../lib/orders';
import { withRole } from '../../../lib/withRole';

function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { vendor } = req.query;
  if (!vendor) {
    return res.status(400).json({ message: 'vendor required' });
  }
  const orders = getOrdersForVendor(vendor);
  return res.status(200).json(orders);
}

export default withRole(['BRAND'])(handler);
