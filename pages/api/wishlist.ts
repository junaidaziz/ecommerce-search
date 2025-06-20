import type { NextApiRequest, NextApiResponse } from 'next';
import { getWishlist, setWishlist } from '../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { handleApiError } from '../../lib/utils/handleApiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const email = session.user.email;
    if (req.method === 'GET') {
      const items = getWishlist(email);
      return res.status(200).json(items);
    }
    if (req.method === 'POST') {
      const { items } = req.body || {};
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'items required' });
      }
      setWishlist(email, items);
      return res.status(200).json({ message: 'saved' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage wishlist');
  }
}
