import type { NextApiRequest, NextApiResponse } from 'next';
import { getWishlist, setWishlist } from '@lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';
import type { Product, ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  SAVED,
  ITEMS_REQUIRED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const email = session.user.email;
    if (req.method === 'GET') {
      const items = getWishlist(email);
      return res.status(200).json(items);
    }
    if (req.method === 'POST') {
      const { items } = (req.body as { items?: Product[] }) || {};
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: ITEMS_REQUIRED });
      }
      setWishlist(email, items);
      return res.status(200).json({ message: SAVED });
    }
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage wishlist');
  }
}
