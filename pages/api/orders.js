import {
  addOrder,
  getOrdersForUser,
  getAllOrders,
  getOrdersForVendor,
} from '../../lib/orders.js';
import { findUser } from '../../lib/users.js';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, items, total } = req.body;
    if (!email || !items) {
      return res.status(400).json({ message: 'email and items required' });
    }
    addOrder({ user_email: email, items, total: total || 0 });
    return res.status(201).json({ message: 'order placed' });
  }

  if (req.method === 'GET') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = findUser(email);
    if (!user) return res.status(404).json({ message: 'user not found' });
    if (user.role === 'admin') {
      return res.status(200).json(getAllOrders());
    }
    if (user.role === 'brand') {
      return res.status(200).json(getOrdersForVendor(user.brand_name));
    }
    return res.status(200).json(getOrdersForUser(email));
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
