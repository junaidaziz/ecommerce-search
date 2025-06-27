import type { NextApiRequest, NextApiResponse } from 'next';
import { addGuestOrder, getGuestOrder } from '@lib/guestOrders';
import { handleApiError } from '@utils/handleApiError';

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
      const order = await addGuestOrder({ name, email, address, items, total: Number(total) || 0 });
      return res.status(201).json(order);
    }

    if (req.method === 'GET') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ message: 'id required' });
      const order = getGuestOrder(id);
      if (!order) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json(order);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (e) {
    return handleApiError(res, e, 'guest order error');
  }
}
