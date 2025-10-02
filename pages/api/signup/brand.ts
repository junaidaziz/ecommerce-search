import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser, findUser, findVendorByName } from '@lib/users';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage, SignupTokenResponse } from '@/types';
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
    
    // Check if brand name is already taken
    if (await findVendorByName(firstName.trim())) {
      return res.status(409).json({ message: 'Brand name already taken' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    
    // Check AUTO_CONFIRM_BRANDS environment variable
    const autoConfirm = process.env.AUTO_CONFIRM_BRANDS === 'true';
    
    // Generate token only when email verification is required
    const token = autoConfirm ? null : crypto.randomBytes(20).toString('hex');
    
    // Auto-confirm in local/dev, require verification in production
    const verified = autoConfirm;
    
    await addUser({
      email,
      password: hashed,
      firstName,
      lastName: '',
      brandName: '',
      role: 'BRAND',
      verificationToken: token,
      verified,
    });
    
    // Return response with autoConfirmed flag for frontend logic
    return res.status(201).json({ 
      token: token || '', 
      autoConfirmed: autoConfirm 
    });
  } catch (error) {
    return handleApiError(res, error, 'Failed to sign up brand');
  }
}
