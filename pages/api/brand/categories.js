import { getCategories, createCategory } from '../../../lib/products';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: 'name required' });
  const exists = getCategories().find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (!exists) {
    createCategory(name);
  }
  return res.status(201).json({ message: 'ok' });
}
