import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { markNotificationRead, deleteNotification } from '@lib/notifications';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { Notification, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED, USER_NOT_FOUND } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Notification | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });
    
    const user = await findUser(session.user.email);
    if (!user) return res.status(404).json({ message: USER_NOT_FOUND });

    const { id } = req.query;
    const notificationId = parseInt(id as string, 10);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    if (req.method === 'PATCH') {
      const notification = await markNotificationRead(notificationId, user.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      return res.status(200).json(notification);
    }

    if (req.method === 'DELETE') {
      const deleted = await deleteNotification(notificationId, user.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      return res.status(200).json({ message: 'Notification deleted' });
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage notification');
  }
}
