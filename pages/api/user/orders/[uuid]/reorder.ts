import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getOrderByUuid } from '@lib/orders';
import { getProductByUuid, getCart, setCart } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '../../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: 'Unauthorized' });

    const uuid = Array.isArray(req.query.uuid) ? req.query.uuid[0] : req.query.uuid;
    if (!uuid) return res.status(400).json({ message: 'uuid required' });

    const order = await getOrderByUuid(String(uuid));
    if (!order || order.userEmail !== session.user.email) {
      return res.status(404).json({ message: 'Not found' });
    }

    const product = await getProductByUuid(order.product.uuid);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const qty = Math.min(product.quantity || 0, order.quantity);
    if (qty <= 0) return res.status(409).json({ message: 'Out of stock' });

    const cart = getCart(session.user.email);
    const existing = cart.find((c) => c.id === product.id);
    if (existing) existing.qty += qty; else cart.push({ ...product, qty });
    setCart(session.user.email, cart);

    return res.status(200).json({ message: 'added to cart' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to reorder');
  }
}
