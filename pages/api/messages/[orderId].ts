import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { createMessage, getMessagesForOrder } from '@lib/messages';
import { getOrderByUuid } from '@lib/orders';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { Message, ApiMessage } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Message[] | Message | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user)
      return res.status(401).json({ message: 'Unauthorized' });

    const orderUuid = getQueryParam(req.query.orderId);
    if (!orderUuid)
      return res.status(400).json({ message: 'orderId required' });
    const order = await getOrderByUuid(String(orderUuid));
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const user = await findUser(session.user.email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isBuyer = order.userId === user.id;
    const isVendor = order.product.vendor.id === user.id;
    if (!isBuyer && !isVendor && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'GET') {
      const msgs = await getMessagesForOrder(order.id);
      return res.status(200).json(msgs);
    }

    if (req.method === 'POST') {
      const { content, messageType, fileUrl, fileName } = req.body as {
        content?: string;
        messageType?: 'text' | 'image' | 'file';
        fileUrl?: string;
        fileName?: string;
      };
      if (messageType === 'text' && !content) {
        return res.status(400).json({ message: 'content required' });
      }
      const receiverId = isBuyer ? order.product.vendor.id : order.userId;
      const msg = await createMessage({
        senderId: user.id,
        receiverId,
        orderId: order.id,
        messageType,
        content,
        fileUrl,
        fileName,
      });
      return res.status(201).json(msg);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage messages');
  }
}
