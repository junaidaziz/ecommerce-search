import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import type { ApiMessage } from '@/types';
import deleteUserHandler from '@lib/api/admin/users/deleteUser';
import { handleApiError } from '@utils/handleApiError';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
) {
  try {
    if (req.method === 'DELETE') return deleteUserHandler(req, res);
    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    handleApiError(res, error, 'Failed to delete user');
  }
}

export default withRole(['SUPER_ADMIN'])(handler); 