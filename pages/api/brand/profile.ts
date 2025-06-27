import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserProfile, findUser } from '@lib/users';
import type { Vendor, ApiMessage } from '../../../types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Vendor | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.method === 'GET') {
      const userData = await findUser(session.user.email);
      if (!userData) {
        return res.status(404).json({ message: 'Not found' });
      }
      const vendor: Vendor = {
        id: Number(userData.id),
        email: userData.email,
        brandName: userData.brandName ?? '',
        phoneNumber: userData.phoneNumber ?? undefined,
        businessAddress: userData.businessAddress ?? undefined,
        city: userData.city ?? undefined,
        country: userData.country ?? undefined,
        website: userData.website ?? undefined,
        description: userData.businessDescription ?? undefined,
        taxId: userData.taxId ?? undefined,
        status: userData.disabled ? 'disabled' : 'active',
        createdAt: userData.createdAt ?? undefined,
        updatedAt: userData.updatedAt ?? undefined,
      };
      return res.status(200).json(vendor);
    }
    if (req.method === 'PUT') {
      const {
        brandName,
        phoneNumber,
        businessAddress,
        city,
        country,
        website,
        businessDescription,
        logo,
        taxId,
      } = req.body;
      await updateUserProfile(session.user.email, {
        brandName,
        phoneNumber,
        businessAddress,
        city,
        country,
        website,
        businessDescription,
        logo,
        taxId,
      });
      return res.status(200).json({ message: 'updated' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage profile');
  }
}
