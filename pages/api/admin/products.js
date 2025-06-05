import { addProduct, loadAndIndexProducts } from '../../../lib/products';

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
      currency: currency || 'USD'
    });
    await loadAndIndexProducts();
    return res.status(201).json({ message: 'Product added' });
  }

  if (req.method === 'GET') {
    const { products } = await loadAndIndexProducts();
    return res.status(200).json(products);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
