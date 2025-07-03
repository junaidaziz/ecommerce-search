import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { findUser } from '@lib/users';
import { addWishlistItem, getWishlistForUser } from '@lib/wishlist';
import { handleApiError } from '@utils/handleApiError';
import type { WishlistItem, ApiMessage } from '../../@/types';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WishlistItem[] | WishlistItem | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const user = await findUser(session.user.email);
    if (!user) return res.status(404).json({ message: USER_NOT_FOUND });

    if (req.method === 'GET') {
      const items = await getWishlistForUser(user.id);
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const { productId, variantId, notifyOnStock } = req.body as {
        productId?: number;
        variantId?: string;
        notifyOnStock?: boolean;
      };
      if (!productId) {
        return res.status(400).json({ message: 'productId required' });
      }
      const item = await addWishlistItem({
        userId: user.id,
        productId,
        variantId: variantId ?? null,
        notifyOnStock,
      });
      return res.status(200).json(item);
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage wishlist');
  }
}
