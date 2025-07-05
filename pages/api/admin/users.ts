import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  addUser,
  setUserDisabled,
  findUser,
} from '@lib/users';
import type { Role } from '@prisma/client';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import {
  AdminUser,
  UserRoleUpdateRequest,
  UserDisabledUpdateRequest,
  CreateUserRequest,
  ApiMessage,
} from '@/types';
import {
  METHOD_NOT_ALLOWED,
  MISSING_REQUIRED_FIELDS,
  EMAIL_REQUIRED,
} from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminUser[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const users: AdminUser[] = await getAllUsers();
      res.status(200).json(users);
      return;
    }
    if (req.method === 'PUT') {
      const { email, role } = req.body as UserRoleUpdateRequest;
      if (!email || !role)
        return res.status(400).json({ message: 'email and role required' });
      const target = await findUser(email);
      if (target?.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'cannot modify super admin' });
      }
      await updateUserRole(email, role as Role);
      res.status(200).json({ message: 'role updated' });
      return;
    }
    if (req.method === 'PATCH') {
      const { email, disabled } = req.body as UserDisabledUpdateRequest;
      if (typeof disabled !== 'boolean' || !email)
        return res.status(400).json({ message: 'email and disabled required' });
      const target = await findUser(email);
      if (target?.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'cannot modify super admin' });
      }
      await setUserDisabled(email, disabled);
      res.status(200).json({ message: 'status updated' });
      return;
    }
    if (req.method === 'DELETE') {
      const email = getQueryParam(req.query.email);
      if (!email) return res.status(400).json({ message: EMAIL_REQUIRED });
      const target = await findUser(email);
      if (target?.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'cannot delete super admin' });
      }
      await deleteUser(email);
      res.status(200).json({ message: 'user deleted' });
      return;
    }
    if (req.method === 'POST') {
      const { email, password, firstName, lastName, brandName, gender, role } =
        req.body as CreateUserRequest;
      if (!email || !password || !firstName || !lastName || !gender) {
        return res.status(400).json({ message: MISSING_REQUIRED_FIELDS });
      }
      await addUser({
        email,
        password,
        firstName,
        lastName,
        brandName,
        gender,
        role: (role || 'USER') as Role,
      });
      res.status(201).json({ message: 'user created' });
      return;
    }
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  } catch (error) {
    handleApiError(res, error, 'Failed to manage users');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
