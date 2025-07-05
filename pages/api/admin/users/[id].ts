import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteUserById, findUserById } from '@lib/users';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { ID_REQUIRED, METHOD_NOT_ALLOWED } from '@/constants/messages';
import { UserRole, type ApiMessage } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const idParam = req.query.id as string | undefined;
    if (!idParam) return res.status(400).json({ message: ID_REQUIRED });
    const id = parseInt(idParam, 10);
    if (isNaN(id)) return res.status(400).json({ message: ID_REQUIRED });

    const target = await findUserById(id);
    if (target?.role === UserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: 'cannot delete super admin' });
    }

    await deleteUserById(id);
    return res.status(200).json({ message: 'user deleted' });
  } catch (e) {
    return handleApiError(res, e, 'Failed to delete user');
  }
}

export default withRole([UserRole.SUPER_ADMIN])(handler);
