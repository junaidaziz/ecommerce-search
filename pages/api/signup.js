import { addUser, findUser } from '../../lib/users';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password required' });
  }
  try {
    if (findUser(email)) {
      return res.status(409).json({ message: 'User exists' });
    }
    addUser({ email, password });
    return res.status(201).json({ message: 'User created' });
  } catch (e) {
    return res.status(500).json({ message: 'Error creating user' });
  }
}
