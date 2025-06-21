import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser } from '../../lib/users';
import bcrypt from 'bcryptjs';
import { handleApiError } from '../../lib/utils/handleApiError';
import type { LoginResponse } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }
    const user = await findUser(email);
    if (
      !user ||
      user.disabled ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { firstName, lastName, brandName, gender, role } = user;
    return res.status(200).json({
      message: 'Login successful',
      user: {
        email,
        firstName,
        lastName,
        brandName,
        gender,
        role,
      },
    });
  } catch (error) {
    return handleApiError(res, error, 'Failed to login');
  }
}
