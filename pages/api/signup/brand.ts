import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser, findUser } from '../../../lib/users';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { handleApiError } from '../../../lib/utils/handleApiError';
import type { SignupTokenResponse, ApiMessage } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignupTokenResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      brandName,
      phoneNumber,
      businessAddress,
      city,
      country,
      website,
      businessDescription,
      taxId,
    } = req.body as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      brandName?: string;
      phoneNumber?: string;
      businessAddress?: string;
      city?: string;
      country?: string;
      website?: string;
      businessDescription?: string;
      taxId?: string;
    };

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !brandName ||
      !phoneNumber ||
      !businessAddress ||
      !city ||
      !country
    ) {
      return res.status(400).json({ message: 'missing required fields' });
    }
    if (await findUser(email)) {
      return res.status(409).json({ message: 'User exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(20).toString('hex');
      await addUser({
        email,
        password: hashed,
        firstName,
        lastName,
        brandName,
        phoneNumber,
        businessAddress,
        city,
        country,
        website: website ?? undefined,
        businessDescription: businessDescription ?? undefined,
        taxId: taxId ?? undefined,
        role: 'BRAND',
        verificationToken: token,
      });
    return res.status(201).json({ token });
  } catch (error) {
    return handleApiError(res, error, 'Failed to sign up brand');
  }
}
