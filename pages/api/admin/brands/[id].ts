import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteUserById } from '@lib/users';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import { USER_ROLES } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ message: 'id required' });
        return;
      }
      await deleteUserById(parseInt(id, 10));
      res.status(200).json({ message: 'deleted' });
      return;
    }
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    handleApiError(res, error, 'Failed to delete brand');
  }
}

export default withRole([USER_ROLES.SUPER_ADMIN])(handler);