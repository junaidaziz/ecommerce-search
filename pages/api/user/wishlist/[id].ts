import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { findUser } from '../../../../lib/users';
import { removeWishlistItem } from '../../../../lib/wishlist';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import type { ApiMessage } from '../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await findUser(session.user.email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!id) return res.status(400).json({ message: 'id required' });
      await removeWishlistItem(parseInt(id, 10), user.id);
      return res.status(200).json({ message: 'removed' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to remove wishlist item');
  }
}
