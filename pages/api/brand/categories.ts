import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesFlat, createCategory } from '@lib/products';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage, Category } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  NAME_REQUIRED,
} from '@/constants/messages';
import { USER_ROLES } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Category | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const session = await getServerSession(req, res, authOptions(req, res));
    if (
      !session?.user ||
      (session.user.role !== 'BRAND' && session.user.role !== USER_ROLES.SUPER_ADMIN)
    ) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const { name, slug } = req.body || {};
    if (!name) return res.status(400).json({ message: NAME_REQUIRED });
    const exists = (await getCategoriesFlat()).find(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() ||
        (slug && c.slug?.toLowerCase() === String(slug).toLowerCase())
    );
    let category: Category | null = exists ?? null;
    if (!category) {
      category = await createCategory(name, slug);
    }
    return res.status(201).json(category);
  } catch (error) {
    return handleApiError(res, error, 'Failed to create category');
  }
}
