import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { findUser, getUserPreferences, updateUserPreferences } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions(req, res));
    if (!session?.user?.email) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }

    const dbUser = await findUser(session.user.email);
    if (!dbUser) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    if (req.method === 'GET') {
      const preferences = await getUserPreferences(dbUser.id);
      return res.status(200).json(preferences);
    }

    if (req.method === 'PUT') {
      const { language, currency, receiveOrderUpdates, receivePromotions } = req.body;

      // Validate input
      if (language && typeof language !== 'string') {
        return res.status(400).json({ message: 'Invalid language' });
      }
      if (currency && typeof currency !== 'string') {
        return res.status(400).json({ message: 'Invalid currency' });
      }
      if (receiveOrderUpdates !== undefined && typeof receiveOrderUpdates !== 'boolean') {
        return res.status(400).json({ message: 'Invalid receiveOrderUpdates value' });
      }
      if (receivePromotions !== undefined && typeof receivePromotions !== 'boolean') {
        return res.status(400).json({ message: 'Invalid receivePromotions value' });
      }

      await updateUserPreferences(dbUser.id, {
        language,
        currency,
        receiveOrderUpdates,
        receivePromotions,
      });

      const updatedPreferences = await getUserPreferences(dbUser.id);
      return res.status(200).json(updatedPreferences);
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage preferences');
  }
}
