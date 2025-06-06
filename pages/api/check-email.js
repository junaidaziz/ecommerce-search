import { findUser } from '../../lib/users';

export default function handler(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'email required' });
  }
  const user = findUser(email);
  return res.status(200).json({ exists: !!user });
}
