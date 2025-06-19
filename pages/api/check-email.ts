import { findUser } from '../../lib/users';

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'email required' });
  }
  const user = await findUser(email);
  return res.status(200).json({ exists: !!user });
}
