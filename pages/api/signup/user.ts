import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser, findUser } from '@lib/users';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { handleApiError } from '@utils/handleApiError';
import type { SignupTokenResponse, ApiMessage } from '@/types';
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
    
    // Check if we're in production environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Generate token only in production
    const token = isProduction ? crypto.randomBytes(20).toString('hex') : null;
    
    // In local/dev, auto-confirm by setting verified to true
    const verified = !isProduction;
    
    await addUser({
      email,
      password: hashed,
      firstName,
      lastName: '',
      gender: 'other',
      role: 'USER',
      verificationToken: token,
      verified,
    });
    
    // Return token only in production (for email confirmation flow)
    return res.status(201).json({ token: token || '' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to sign up user');
  }
}
