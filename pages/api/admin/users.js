import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  addUser,
  setUserDisabled,
} from '../../../lib/users';
import { withRole } from '../../../lib/withRole';

async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(await getAllUsers());
  }
  if (req.method === 'PUT') {
    const { email, role } = req.body || {};
    if (!email || !role)
      return res.status(400).json({ message: 'email and role required' });
    await updateUserRole(email, role);
    return res.status(200).json({ message: 'role updated' });
  }
  if (req.method === 'PATCH') {
    const { email, disabled } = req.body || {};
    if (typeof disabled !== 'boolean' || !email)
      return res.status(400).json({ message: 'email and disabled required' });
    await setUserDisabled(email, disabled);
    return res.status(200).json({ message: 'status updated' });
  }
  if (req.method === 'DELETE') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email required' });
    await deleteUser(email);
    return res.status(200).json({ message: 'user deleted' });
  }
  if (req.method === 'POST') {
    const { email, password, firstName, lastName, brandName, gender, role } =
      req.body || {};
    if (!email || !password || !firstName || !lastName || !gender) {
      return res.status(400).json({ message: 'missing required fields' });
    }
    await addUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      brand_name: brandName,
      gender,
      role: role || 'USER',
    });
    return res.status(201).json({ message: 'user created' });
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}

export default withRole(['SUPER_ADMIN'])(handler);
