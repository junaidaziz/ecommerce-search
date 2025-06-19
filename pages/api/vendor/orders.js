import { getOrdersForVendor } from '../../../lib/orders';
import { withRole } from '../../../lib/withRole';

function handler(req, res) {
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
