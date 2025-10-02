import type { NextApiRequest, NextApiResponse } from 'next';
import { findVendorByName } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ exists: boolean } | ApiMessage>
): Promise<void> {
  try {
    const brandName = getQueryParam(req.query.brandName);
    if (!brandName) {
      return res.status(400).json({ message: 'Brand name is required' });
    }
    const vendor = await findVendorByName(brandName);
    return res.status(200).json({ exists: !!vendor });
  } catch (error) {
    return handleApiError(res, error, 'Failed to check brand name');
  }
}
