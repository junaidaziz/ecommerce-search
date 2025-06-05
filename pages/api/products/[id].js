import { loadAndIndexProducts } from '../../../lib/products';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'id required' });
  }
  try {
    const { products } = await loadAndIndexProducts();
    const product = products.find(p => p.ID === String(id));
    if (!product) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(product);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load product' });
  }
}
