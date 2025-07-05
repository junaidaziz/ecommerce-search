import type { NextApiRequest, NextApiResponse } from 'next';
import { getVendors } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { Vendor, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

export interface VendorsResponse {
  vendors: Vendor[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VendorsResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const { search = '', page, limit } = req.query;
    const pageNum = parseInt(String(page || '1'), 10);
    const limitNum = parseInt(String(limit || '20'), 10);
    const offset = (pageNum - 1) * limitNum;
    const vendors = await getVendors(String(search), limitNum, offset, false);
    return res.status(200).json({ vendors });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load vendors');
  }
}
