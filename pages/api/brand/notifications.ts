import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import {
  getNotificationsForUser,
  markNotificationsRead,
} from '@lib/notifications';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { Notification, ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Notification[] | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions(req, res));
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await findUser(session.user.email);
    if (!user) return res.status(404).json({ message: USER_NOT_FOUND });

    if (req.method === 'GET') {
      const notes = await getNotificationsForUser(user.id);
      return res.status(200).json(notes);
    }

    if (req.method === 'PATCH') {
      await markNotificationsRead(user.id);
      const notes = await getNotificationsForUser(user.id);
      return res.status(200).json(notes);
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage notifications');
  }
}
