import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@lib/notifications';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });
    const user = await findUser(session.user.email);
    if (!user) return res.status(404).json({ message: USER_NOT_FOUND });

    if (req.method === 'GET') {
      const preferences = await getNotificationPreferences(user.id);
      return res.status(200).json(preferences);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const {
        orderUpdates,
        promotions,
        discounts,
        generalUpdates,
        emailNotifications,
      } = req.body;

      const preferences = await updateNotificationPreferences(user.id, {
        orderUpdates,
        promotions,
        discounts,
        generalUpdates,
        emailNotifications,
      });

      return res.status(200).json(preferences);
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(
      res,
      error,
      'Failed to manage notification preferences'
    );
  }
}
