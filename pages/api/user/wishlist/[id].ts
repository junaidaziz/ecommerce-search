import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { findUser } from '@lib/users';
import { removeWishlistItem } from '@lib/wishlist';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '../../../../types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
  ID_REQUIRED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const user = await findUser(session.user.email);
    if (!user) return res.status(404).json({ message: USER_NOT_FOUND });

    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!id) return res.status(400).json({ message: ID_REQUIRED });
      await removeWishlistItem(parseInt(id, 10), user.id);
      return res.status(200).json({ message: 'removed' });
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to remove wishlist item');
  }
}
