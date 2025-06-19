import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserProfile, findUser } from '../../../lib/users';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.method === 'GET') {
    const userData = await findUser(session.user.email);
    return res.status(200).json(userData);
  }
  if (req.method === 'PUT') {
    const { phoneNumber, address, city, country } = req.body;
    await updateUserProfile(session.user.email, {
      phoneNumber,
      address,
      city,
      country,
    });
    return res.status(200).json({ message: 'updated' });
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
