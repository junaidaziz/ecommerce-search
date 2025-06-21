import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getCategoriesFlat,
  createCategory,
  renameCategory,
  removeCategory,
} from '../../../lib/products';
import { withRole } from '../../../lib/withRole';
import { logAudit } from '../../../lib/audit';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import { Category, CategoryInput, ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Category[] | ApiMessage>
) {
  try {
    if (req.method === 'GET') {
      const cats = await getCategoriesFlat();
      return res.status(200).json(cats as Category[]);
    }
    if (req.method === 'POST') {
      const { name, parentId, image } = req.body as CategoryInput;
      if (!name) return res.status(400).json({ message: 'name required' });
      const exists = (await getCategoriesFlat()).find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        return res.status(409).json({ message: 'category exists' });
      }
      try {
        await createCategory(name, parentId || null, image || null);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'depth') {
          return res.status(400).json({ message: 'max depth exceeded' });
        }
        throw e;
      }
      logAudit('create_category', { name, parentId, image });
      return res.status(201).json({ message: 'category created' });
    }
    if (req.method === 'PUT') {
      const { uuid, name, parentId, image } = req.body as CategoryInput & { uuid: string };
      if (!uuid || !name)
        return res.status(400).json({ message: 'uuid and name required' });
      await renameCategory(uuid, name, parentId || null, image || null);
      logAudit('rename_category', { uuid, name, parentId, image });
      return res.status(200).json({ message: 'category updated' });
    }
    if (req.method === 'DELETE') {
      const uuid = getQueryParam(req.query.uuid);
      if (!uuid) return res.status(400).json({ message: 'uuid required' });
      try {
        await removeCategory(String(uuid));
        logAudit('delete_category', { uuid });
        return res.status(200).json({ message: 'category deleted' });
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'category in use') {
          return res
            .status(400)
            .json({ message: 'cannot delete category with products' });
        }
        throw e;
      }
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage categories');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
