import {
  getCategories,
  createCategory,
  renameCategory,
  removeCategory,
} from '../../../lib/products';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(getCategories());
  }
  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name required' });
    createCategory(name);
    return res.status(201).json({ message: 'category created' });
  }
  if (req.method === 'PUT') {
    const { id, name } = req.body || {};
    if (!id || !name)
      return res.status(400).json({ message: 'id and name required' });
    renameCategory(id, name);
    return res.status(200).json({ message: 'category updated' });
  }
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'id required' });
    removeCategory(id);
    return res.status(200).json({ message: 'category deleted' });
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
