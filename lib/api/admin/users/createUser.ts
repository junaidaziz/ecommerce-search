import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser } from '@lib/users';
import type { CreateUserRequest, ApiMessage } from '@/types';
import type { Role } from '@prisma/client';
import { MISSING_REQUIRED_FIELDS } from '@/constants/messages';

export default async function createUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
) {
  const { email, password, firstName, lastName, brandName, gender, role } = req.body as CreateUserRequest;
  if (!email || !password || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: MISSING_REQUIRED_FIELDS });
  }
  await addUser({
    email,
    password,
    firstName,
    lastName,
    brandName,
    gender,
    role: (role || 'USER') as Role,
  });
  res.status(201).json({ message: 'user created' });
} 