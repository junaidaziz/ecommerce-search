import { addUser, findUser } from '../../lib/users';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { email, password, firstName, lastName, brandName, gender, role } = req.body;
  if (!email || !password || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  try {
    if (findUser(email)) {
      return res.status(409).json({ message: 'User exists' });
    }
    addUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      brand_name: brandName,
      gender,
      role: role || 'customer'
    });
    return res.status(201).json({
      message: 'User created',
      user: { email, firstName, lastName, brandName, gender, role: role || 'customer' }
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error creating user' });
  }
}

