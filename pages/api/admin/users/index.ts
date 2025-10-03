import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import type { AdminUser, ApiMessage } from '@/types';
import { USER_ROLES } from '@/types';
import getUsersHandler from '@lib/api/admin/users/getUsers';
import createUserHandler from '@lib/api/admin/users/createUser';
import { handleApiError } from '@utils/handleApiError';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminUser[] | ApiMessage>
) {
  try {
    if (req.method === 'GET') return getUsersHandler(req, res);
    if (req.method === 'POST') return createUserHandler(req, res);
    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    handleApiError(res, error, 'Failed to manage users');
  }
}

export default withRole([USER_ROLES.SUPER_ADMIN])(handler);