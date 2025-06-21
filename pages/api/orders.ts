import type { NextApiRequest, NextApiResponse } from 'next';
import {
  addOrder,
  getOrdersForUser,
  getAllOrders,
  getOrdersForVendor,
} from '../../lib/orders';
import { findUser } from '../../lib/users';
import {
  getProductById,
  decreaseProductQuantity,
  clearCart,
} from '../../lib/db';
import { withRole } from '../../lib/withRole';
import { sendOrderConfirmation } from '../../lib/email';
import { handleApiError } from '../../lib/utils/handleApiError';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { email, items, total, shippingName, shippingAddress } = req.body;
    if (!email || !items) {
      return res.status(400).json({ message: 'email and items required' });
    }

    for (const item of items) {
      const product = await getProductById(String(item.id));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if ((product.quantity || 0) < item.qty) {
        return res
          .status(409)
          .json({ message: `Insufficient stock for ${product.title}` });
      }
    }

    for (const item of items) {
      await decreaseProductQuantity(String(item.id), item.qty);
    }

    const orderId = await addOrder({
      user_email: email,
      items,
      total: total || 0,
      shipping_name: shippingName,
      shipping_address: shippingAddress,
    });
    await clearCart(email);
    await sendOrderConfirmation(email, { id: orderId });
    return res.status(201).json({ message: 'order placed', id: orderId });
  }

  if (req.method === 'GET') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = await findUser(email);
    if (!user) return res.status(404).json({ message: 'user not found' });
    if (user.role === 'SUPER_ADMIN') {
      return res.status(200).json(await getAllOrders());
    }
    if (user.role === 'BRAND') {
      return res.status(200).json(await getOrdersForVendor(user.brandName));
    }
    return res.status(200).json(await getOrdersForUser(email));
  }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to process orders');
  }
}

export default withRole(['USER', 'BRAND', 'SUPER_ADMIN'])(handler);
