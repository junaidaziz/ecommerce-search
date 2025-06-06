import { resetPassword } from '../../lib/users';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'token and password required' });
  try {
    resetPassword(token, password);
    return res.status(200).json({ message: 'Password reset' });
  } catch (e) {
    return res.status(500).json({ message: 'Error resetting password' });
  }
}
