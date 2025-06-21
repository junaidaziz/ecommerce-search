import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import {
  addReview,
  getReviewsForProduct,
  getAverageRating,
} from '../../../../lib/db.js';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import type {
  Review,
  ReviewsResponse,
  ReviewAddedResponse,
} from '../../../../types/review';
import type { ApiMessage } from '../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewsResponse | ReviewAddedResponse | ApiMessage>
): Promise<void> {
  const {
    query: { uuid },
    method,
  } = req;
  try {
    if (!uuid) return res.status(400).json({ message: 'uuid required' });

    if (method === 'GET') {
      const reviews = getReviewsForProduct(String(uuid)) as Review[];
      const stats = getAverageRating(String(uuid));
      return res.status(200).json({
        reviews,
        averageRating: stats.average,
        reviewCount: stats.count,
      });
    }

    if (method === 'POST') {
      const session = await getSession({ req });
      if (!session?.user) {
        return res.status(401).json({ message: 'auth required' });
      }
      const { rating, comment = '' } = (req.body || {}) as {
        rating?: number | string;
        comment?: string;
      };
      const r = parseInt(String(rating), 10);
      if (!r || r < 1 || r > 5) {
        return res.status(400).json({ message: 'rating 1-5 required' });
      }
      addReview({
        productId: String(uuid),
        userEmail: session.user.email!,
        rating: r,
        comment,
      });
      const stats = getAverageRating(String(uuid));
      return res.status(201).json({
        message: 'review added',
        averageRating: stats.average,
        reviewCount: stats.count,
      });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to handle review');
  }
}
