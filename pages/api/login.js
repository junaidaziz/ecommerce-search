import { findUser } from '../../lib/users';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password required' });
  }
  const user = findUser(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const { first_name, last_name, brand_name, gender, role } = user;
  return res.status(200).json({
    message: 'Login successful',
    user: {
      email,
      firstName: first_name,
      lastName: last_name,
      brandName: brand_name,
      gender,
      role,
    },
  });
}
