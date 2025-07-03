import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser, findUser } from '@lib/users';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { handleApiError } from '@utils/handleApiError';
import type { SignupTokenResponse, ApiMessage } from '../@/types';
import {
  METHOD_NOT_ALLOWED,
  MISSING_REQUIRED_FIELDS,
  USER_EXISTS,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignupTokenResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }

    const { email, password, firstName } = req.body as {
      email?: string;
      password?: string;
      firstName?: string;
    };

    if (!email || !password || !firstName) {
      return res.status(400).json({ message: MISSING_REQUIRED_FIELDS });
    }
    if (await findUser(email)) {
      return res.status(409).json({ message: USER_EXISTS });
    }
    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(20).toString('hex');
    await addUser({
      email,
      password: hashed,
      firstName,
      lastName: '',
      brandName: '',
      role: 'BRAND',
      verificationToken: token,
    });
    return res.status(201).json({ token });
  } catch (error) {
    return handleApiError(res, error, 'Failed to sign up brand');
  }
}
