import type { NextApiRequest, NextApiResponse } from 'next';
import { findVendorByName, createVendor } from '../../../lib/users';
import { handleApiError } from '../../../lib/utils/handleApiError';
import type { Vendor, ApiMessage } from '../../../types';

interface CheckCreateResponse {
  exists?: boolean;
  success?: boolean;
  vendor?: Vendor;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckCreateResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name required' });
    const existing = await findVendorByName(String(name));
    if (existing) {
      return res
        .status(200)
        .json({ exists: true, vendor: existing as Vendor });
    }
    const vendor = await createVendor(String(name));
    return res.status(201).json({ success: true, vendor });
  } catch (error) {
    return handleApiError(res, error, 'Failed to create vendor');
  }
}
