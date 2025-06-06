import { getAllUsers, updateUserRole, deleteUser, addUser } from '../../../lib/users';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(getAllUsers());
  }
  if (req.method === 'PUT') {
    const { email, role } = req.body || {};
    if (!email || !role) return res.status(400).json({ message: 'email and role required' });
    updateUserRole(email, role);
    return res.status(200).json({ message: 'role updated' });
  }
  if (req.method === 'DELETE') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    deleteUser(email);
    return res.status(200).json({ message: 'user deleted' });
  }
  if (req.method === 'POST') {
    const { email, password, firstName, lastName, brandName, gender, role } = req.body || {};
    if (!email || !password || !firstName || !lastName || !gender) {
      return res.status(400).json({ message: 'missing required fields' });
    }
    addUser({ email, password, first_name: firstName, last_name: lastName, brand_name: brandName, gender, role: role || 'user' });
    return res.status(201).json({ message: 'user created' });
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
