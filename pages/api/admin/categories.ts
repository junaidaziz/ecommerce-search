import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getCategoriesFlat,
  createCategory,
  renameCategory,
  removeCategory,
} from '@lib/products';
import { withRole } from '@lib/withRole';
import { logAudit } from '@lib/audit';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { Category, ApiMessage, CategoryInput } from '@/types';
import { USER_ROLES } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  UUID_REQUIRED,
  NAME_REQUIRED,
  CATEGORY_EXISTS,
} from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Category[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const cats: Category[] = await getCategoriesFlat();
      res.status(200).json(cats);
      return;
    }
    if (req.method === 'POST') {
      const { name, slug } = req.body as CategoryInput;
      if (!name) return res.status(400).json({ message: NAME_REQUIRED });
      const exists = (await getCategoriesFlat()).find(
        (c: Category) =>
          c.name.toLowerCase() === name.toLowerCase() ||
          (slug && c.slug?.toLowerCase() === slug.toLowerCase())
      );
      if (exists) {
        return res.status(409).json({ message: CATEGORY_EXISTS });
      }
      await createCategory(name, slug);
      logAudit('create_category', { name, slug });
      res.status(201).json({ message: 'category created' });
      return;
    }
    if (req.method === 'PUT') {
      const { uuid, name } = req.body as CategoryInput & { uuid: string };
      if (!uuid || !name)
        return res.status(400).json({ message: 'uuid and name required' });
      await renameCategory(uuid, name);
      logAudit('rename_category', { uuid, name });
      res.status(200).json({ message: 'category updated' });
      return;
    }
    if (req.method === 'DELETE') {
      const uuid = getQueryParam(req.query.uuid);
      if (!uuid) return res.status(400).json({ message: UUID_REQUIRED });
      try {
        await removeCategory(String(uuid));
        logAudit('delete_category', { uuid });
        res.status(200).json({ message: 'category deleted' });
        return;
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'category in use') {
          return res
            .status(400)
            .json({ message: 'cannot delete category with products' });
        }
        throw e;
      }
    }
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  } catch (error) {
    handleApiError(res, error, 'Failed to manage categories');
  }
}

export default withRole([USER_ROLES.SUPER_ADMIN])(handler);
