import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser, findUser } from '../../lib/users';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { handleApiError } from '../../lib/utils/handleApiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { email, password, firstName, lastName, brandName, gender, role } =
    req.body;
  if (!email || !password || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  try {
    if (await findUser(email)) {
      return res.status(409).json({ message: 'User exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(20).toString('hex');
    await addUser({
      email,
      password: hashed,
      first_name: firstName,
      last_name: lastName,
      brand_name: brandName,
      gender,
      role: role || 'USER',
      verification_token: token,
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
