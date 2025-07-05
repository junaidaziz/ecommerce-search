import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import type { ApiMessage } from '@/types';
import updateUserRoleHandler from '@lib/api/admin/users/updateUserRole';
import { handleApiError } from '@utils/handleApiError';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
) {
  try {
    if (req.method === 'PUT') return updateUserRoleHandler(req, res);
    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    handleApiError(res, error, 'Failed to update user role');
  }
}

export default withRole(['SUPER_ADMIN'])(handler); 