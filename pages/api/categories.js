import { getCategories } from '../../lib/products';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const cats = getCategories().map((c) => c.name);
    return res.status(200).json(cats);
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
