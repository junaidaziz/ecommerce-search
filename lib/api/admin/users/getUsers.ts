import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers } from '@lib/users';
import { getQueryParam } from '@utils/getQueryParam';
import type { AdminUser, ApiMessage } from '@/types';

export default async function getUsersHandler(
  req: NextApiRequest,
  res: NextApiResponse<AdminUser[] | ApiMessage>
) {
  const search = getQueryParam(req.query.search) || '';
  const users: AdminUser[] = await getAllUsers(search);
  res.status(200).json(users);
} 