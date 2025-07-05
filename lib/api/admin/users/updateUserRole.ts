import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserRole, findUser } from '@lib/users';
import type { UserRoleUpdateRequest, ApiMessage } from '@/types';
import type { Role } from '@prisma/client';

export default async function updateUserRoleHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
) {
  const { email, role } = req.body as UserRoleUpdateRequest;
  if (!email || !role)
    return res.status(400).json({ message: 'email and role required' });
  const target = await findUser(email);
  if (target?.role === 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'cannot modify super admin' });
  }
  await updateUserRole(email, role.toUpperCase() as Role);
  res.status(200).json({ message: 'role updated' });
} 