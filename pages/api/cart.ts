import { getCart, setCart } from '../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const email = session.user.email;
  if (req.method === 'GET') {
    const items = getCart(email);
    return res.status(200).json(items);
  }
  if (req.method === 'POST') {
    const { items } = req.body || {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items required' });
    }
    setCart(email, items);
    return res.status(200).json({ message: 'saved' });
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
