import { getProductById } from '../../../lib/db.js';
import { mapDbRowToProduct } from '../../../lib/products.js';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'id required' });
  }
  try {
    const row = getProductById(String(id));
    if (!row) {
      return res.status(404).json({ message: 'Not found' });
    }
    const product = mapDbRowToProduct(row);
    res.status(200).json(product);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load product' });
  }
}
