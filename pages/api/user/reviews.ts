import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getReviewsByUser } from '@lib/db';
import type { Review, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Review[] | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });

    if (req.method !== 'GET')
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });

    const reviews = getReviewsByUser(session.user.email);
    return res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
}
