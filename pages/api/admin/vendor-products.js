import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from '../../../lib/products';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(getPendingProducts());
  }
  if (req.method === 'PUT') {
    const { id, action } = req.body || {};
    if (!id || !action)
      return res.status(400).json({ message: 'id and action required' });
    if (action === 'approve') {
      approveProduct(id);
      return res.status(200).json({ message: 'approved' });
    }
    if (action === 'reject') {
      rejectProduct(id);
      return res.status(200).json({ message: 'rejected' });
    }
    return res.status(400).json({ message: 'invalid action' });
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
