import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import type { ApiMessage } from '@/types';
import updateUserDisabledHandler from '@lib/api/admin/users/updateUserDisabled';
import { handleApiError } from '@utils/handleApiError';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
) {
  try {
    if (req.method === 'PATCH') return updateUserDisabledHandler(req, res);
    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    handleApiError(res, error, 'Failed to update user status');
  }
}

export default withRole(['SUPER_ADMIN'])(handler); 