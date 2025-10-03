import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';
import prisma from '@lib/prisma';
import type { ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  CREATED,
  DELETED,
  NOT_FOUND,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }

    const userId = session.user.id;

    // GET all addresses
    if (req.method === 'GET') {
      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      return res.status(200).json(addresses);
    }

    // POST create new address
    if (req.method === 'POST') {
      const {
        type,
        fullName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
        isDefault,
      } = req.body;

      // If this is set as default, unset all other default addresses of the same type
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId, type, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          userId,
          type,
          fullName,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          phoneNumber: phoneNumber || null,
          isDefault: isDefault || false,
        },
      });

      return res.status(201).json({ message: CREATED, address });
    }

    // PUT update address
    if (req.method === 'PUT') {
      const { id } = req.query;
      const addressId = parseInt(id as string, 10);

      if (!addressId) {
        return res.status(400).json({ message: 'Address ID required' });
      }

      // Verify ownership
      const existing = await prisma.address.findFirst({
        where: { id: addressId, userId },
      });

      if (!existing) {
        return res.status(404).json({ message: NOT_FOUND });
      }

      const {
        type,
        fullName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
        isDefault,
      } = req.body;

      // If this is set as default, unset all other default addresses of the same type
      if (isDefault && !existing.isDefault) {
        await prisma.address.updateMany({
          where: { userId, type, isDefault: true, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.update({
        where: { id: addressId },
        data: {
          type,
          fullName,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          phoneNumber: phoneNumber || null,
          isDefault: isDefault || false,
        },
      });

      return res.status(200).json({ message: 'Updated', address });
    }

    // DELETE address
    if (req.method === 'DELETE') {
      const { id } = req.query;
      const addressId = parseInt(id as string, 10);

      if (!addressId) {
        return res.status(400).json({ message: 'Address ID required' });
      }

      // Verify ownership
      const existing = await prisma.address.findFirst({
        where: { id: addressId, userId },
      });

      if (!existing) {
        return res.status(404).json({ message: NOT_FOUND });
      }

      await prisma.address.delete({
        where: { id: addressId },
      });

      return res.status(200).json({ message: DELETED });
    }

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage addresses');
  }
}
