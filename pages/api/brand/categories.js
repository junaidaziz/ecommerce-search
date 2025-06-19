import { getCategoriesFlat, createCategory } from '../../../lib/products';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { name, parentId } = req.body || {};
  if (!name) return res.status(400).json({ message: 'name required' });
  const exists = getCategoriesFlat().find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (!exists) {
    try {
      createCategory(name, parentId || null);
    } catch (e) {
      if (e.message === 'depth') {
        return res.status(400).json({ message: 'max depth exceeded' });
      }
      throw e;
    }
  }
  return res.status(201).json({ message: 'ok' });
}
