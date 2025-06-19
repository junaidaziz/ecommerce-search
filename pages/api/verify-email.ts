import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyUser } from '../../lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'token required' });
  try {
    await verifyUser(token);
    return res.status(200).json({ message: 'Email verified' });
  } catch (e) {
    return res.status(500).json({ message: 'Error verifying email' });
  }
}
