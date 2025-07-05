import type { NextApiRequest, NextApiResponse } from 'next';
import { getVendors } from '@lib/users';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import type { Vendor, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Vendor[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ message: METHOD_NOT_ALLOWED });
      return;
    }
    const vendors = await getVendors();
    res.status(200).json(vendors);
  } catch (error) {
    handleApiError(res, error, 'Failed to load brands');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
