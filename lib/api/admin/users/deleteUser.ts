import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteUser, findUser } from '@lib/users';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '@/types';
import { EMAIL_REQUIRED } from '@/constants/messages';

export default async function deleteUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
) {
  const email = getQueryParam(req.query.email);
  if (!email) return res.status(400).json({ message: EMAIL_REQUIRED });
  const target = await findUser(email);
  if (target?.role === 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'cannot delete super admin' });
  }
  await deleteUser(email);
  res.status(200).json({ message: 'user deleted' });
} 