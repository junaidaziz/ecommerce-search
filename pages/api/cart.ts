import type { NextApiRequest, NextApiResponse } from 'next';
import { getCart, setCart } from '@lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';
import type { CartItem, ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  SAVED,
  ITEMS_REQUIRED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CartItem[] | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const email = session.user.email;
    if (req.method === 'GET') {
      const items = getCart(email);
      return res.status(200).json(items);
    }
    if (req.method === 'POST') {
      const { items } = (req.body as { items?: CartItem[] }) || {};
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: ITEMS_REQUIRED });
      }
      setCart(email, items);
      return res.status(200).json({ message: SAVED });
    }
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage cart');
  }
}
