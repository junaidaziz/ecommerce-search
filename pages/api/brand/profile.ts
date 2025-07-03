import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserProfile, findUser } from '@lib/users';
import type { Vendor, ApiMessage } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  NOT_FOUND,
  UPDATED,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Vendor | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    if (req.method === 'GET') {
      const userData = await findUser(session.user.email);
      if (!userData) {
        return res.status(404).json({ message: NOT_FOUND });
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
        paymentMethods: (userData.paymentMethods as any) ?? undefined,
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
        paymentMethods,
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
        paymentMethods,
      });
      return res.status(200).json({ message: UPDATED });
    }
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage profile');
  }
}
