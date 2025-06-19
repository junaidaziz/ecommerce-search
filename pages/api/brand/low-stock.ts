import { loadAndIndexProducts } from '../../../lib/products';

export default async function handler(req, res) {
  const { vendor } = req.query;
  if (!vendor) return res.status(400).json({ message: 'vendor required' });
  const { products } = await loadAndIndexProducts();
  const low = products.filter(
    (p) => p.VENDOR === vendor && p.TOTAL_INVENTORY <= 5
  );
  res.status(200).json(low);
}
