import { addProduct, updateProduct, loadAndIndexProducts } from '../../../lib/products';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, title, vendor, description, product_type, tags, quantity, min_price, max_price, currency } = req.body;
    if (!id || !title) {
      return res.status(400).json({ message: 'id and title are required' });
    }
    addProduct({
      id: String(id),
      title,
      vendor,
      description,
      product_type,
      tags,
      quantity: quantity ? parseInt(quantity, 10) : 0,
      min_price: parseFloat(min_price || 0),
      max_price: parseFloat(max_price || 0),
      currency: currency || 'USD',
      status: 'approved'
    });
    await loadAndIndexProducts();
    return res.status(201).json({ message: 'Product added' });
  }

  if (req.method === 'PUT') {
    const { id, title, vendor, description, product_type, tags, quantity, min_price, max_price, currency } = req.body;
    if (!id || !title) {
      return res.status(400).json({ message: 'id and title are required' });
    }
    updateProduct({
      id: String(id),
      title,
      vendor,
      description,
      product_type,
      tags,
      quantity: quantity ? parseInt(quantity, 10) : 0,
      min_price: parseFloat(min_price || 0),
      max_price: parseFloat(max_price || 0),
      currency: currency || 'USD',
      status: 'approved'
    });
    await loadAndIndexProducts();
    return res.status(200).json({ message: 'Product updated' });
  }

  if (req.method === 'GET') {
    const { products } = await loadAndIndexProducts();
    let filtered = products;
    if (req.query.vendor) {
      filtered = products.filter(p => p.VENDOR === req.query.vendor);
    }
    return res.status(200).json(filtered);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
