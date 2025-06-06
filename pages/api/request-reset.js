import { findUser, setResetToken } from '../../lib/users';
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });
  const user = findUser(email);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const token = crypto.randomBytes(20).toString('hex');
  const expires = Date.now() + 3600 * 1000; // 1 hour
  setResetToken(email, token, expires);
  return res.status(200).json({ message: 'Reset email sent', token });
}
