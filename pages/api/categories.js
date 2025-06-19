import { getCategoryTree } from '../../lib/products';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(getCategoryTree());
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
