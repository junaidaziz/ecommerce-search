import {
  getCategoriesFlat,
  createCategory,
  renameCategory,
  removeCategory,
} from '../../../lib/products';
import { withRole } from '../../../lib/withRole';
import { logAudit } from '../../../lib/audit';

function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(getCategoriesFlat());
  }
  if (req.method === 'POST') {
    const { name, parentId } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name required' });
    const exists = getCategoriesFlat().find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ message: 'category exists' });
    }
    try {
      createCategory(name, parentId || null);
    } catch (e) {
      if (e.message === 'depth') {
        return res.status(400).json({ message: 'max depth exceeded' });
      }
      throw e;
    }
    logAudit('create_category', { name, parentId });
    return res.status(201).json({ message: 'category created' });
  }
  if (req.method === 'PUT') {
    const { id, name, parentId } = req.body || {};
    if (!id || !name)
      return res.status(400).json({ message: 'id and name required' });
    renameCategory(id, name, parentId || null);
    logAudit('rename_category', { id, name, parentId });
    return res.status(200).json({ message: 'category updated' });
  }
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'id required' });
    try {
      removeCategory(id);
      logAudit('delete_category', { id });
      return res.status(200).json({ message: 'category deleted' });
    } catch (e) {
      if (e.message === 'category in use') {
        return res
          .status(400)
          .json({ message: 'cannot delete category with products' });
      }
      throw e;
    }
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}

export default withRole(['SUPER_ADMIN'])(handler);
