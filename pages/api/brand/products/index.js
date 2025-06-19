import { addProduct, loadAndIndexProducts } from '../../../../lib/products';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { vendor } = req.query;
    if (!vendor) return res.status(400).json({ message: 'vendor required' });
    const { products } = await loadAndIndexProducts();
    const filtered = products.filter((p) => p.VENDOR === vendor);
    return res.status(200).json(filtered);
  }

  if (req.method === 'POST') {
    const {
      id,
      title,
      vendor,
      description,
      product_type,
      tags,
      category,
      quantity,
      min_price,
      max_price,
      currency,
    } = req.body || {};
    if (!id || !title || !vendor) {
      return res.status(400).json({ message: 'id, title, vendor required' });
    }
    addProduct({
      id: String(id),
      slug: slugify(title || String(id)),
      title,
      vendor,
      description,
      product_type,
      tags,
      category,
      quantity: quantity ? parseInt(quantity, 10) : 0,
      min_price: parseFloat(min_price || 0),
      max_price: parseFloat(max_price || 0),
      currency: currency || 'USD',
      status: 'approved',
      images: JSON.stringify([]),
    });
    await loadAndIndexProducts();
    return res.status(201).json({ message: 'product created' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
