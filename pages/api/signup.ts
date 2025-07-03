import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser, findUser } from '@lib/users';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { handleApiError } from '@utils/handleApiError';
import type { SignupResponse, ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  MISSING_REQUIRED_FIELDS,
  USER_EXISTS,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignupResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  }
  const { email, password, firstName, lastName, brandName, gender, role } =
    req.body;
  if (!email || !password || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: MISSING_REQUIRED_FIELDS });
  }
  try {
    if (await findUser(email)) {
      return res.status(409).json({ message: USER_EXISTS });
    }
    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(20).toString('hex');
    await addUser({
      email,
      password: hashed,
      firstName,
      lastName,
      brandName,
      gender,
      role: role || 'USER',
      verificationToken: token,
    });
    return res.status(201).json({
      message: 'User created',
      user: {
        email,
        firstName,
        lastName,
        brandName,
        gender,
        role: role || 'USER',
      },
      token,
    });
  } catch (e) {
    return handleApiError(res, e, 'Error creating user');
  }
}
