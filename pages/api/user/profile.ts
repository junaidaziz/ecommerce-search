import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserProfile, findUser } from '../../../lib/users';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '../../../lib/utils/handleApiError';
import type { User, ApiMessage } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.method === 'GET') {
      const userData = await findUser(session.user.email);
      return res.status(200).json(userData);
    }
    if (req.method === 'PUT') {
      const {
        firstName,
        lastName,
        email,
        password,
        gender,
        phoneNumber,
        address,
        city,
        country,
      } = req.body as Partial<User> & { password?: string };
      const update: any = {
        firstName,
        lastName,
        gender,
        phoneNumber,
        address,
        city,
        country,
      };
      if (email) update.email = email;
      if (password) update.password = await bcrypt.hash(password, 10);
      await updateUserProfile(session.user.email, update);
      return res.status(200).json({ message: 'updated' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to update profile');
  }
}
