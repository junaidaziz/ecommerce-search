import type { NextApiRequest, NextApiResponse } from 'next';
import { addGuestOrder, getGuestOrder } from '@lib/guestOrders';
import { handleApiError } from '@utils/handleApiError';
import {
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  ID_REQUIRED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const { name, email, address, items, total } = req.body || {};
      if (!name || !email || !address || !Array.isArray(items)) {
        return res.status(400).json({ message: 'invalid payload' });
      }
      const order = await addGuestOrder({
        name,
        email,
        address,
        items,
        total: Number(total) || 0,
      });
      return res.status(201).json(order);
    }

    if (req.method === 'GET') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ message: ID_REQUIRED });
      const order = getGuestOrder(id);
      if (!order) return res.status(404).json({ message: NOT_FOUND });
      return res.status(200).json(order);
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (e) {
    return handleApiError(res, e, 'guest order error');
  }
}
