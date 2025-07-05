import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers } from '@lib/users';
import { getQueryParam } from '@utils/getQueryParam';
import type { AdminUser, ApiMessage } from '@/types';

export default async function getUsersHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ users: AdminUser[]; total: number; page: number; limit: number } | ApiMessage>
) {
  const search = getQueryParam(req.query.search) || '';
  const page = parseInt(getQueryParam(req.query.page) || '1', 10);
  const limit = parseInt(getQueryParam(req.query.limit) || '20', 10);
  const allUsers: AdminUser[] = await getAllUsers(search);
  const total = allUsers.length;
  const start = (page - 1) * limit;
  const users = allUsers.slice(start, start + limit);
  res.status(200).json({ users, total, page, limit });
} 