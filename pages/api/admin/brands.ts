import type { NextApiRequest, NextApiResponse } from 'next';
import { getVendors, getVendorsCount, setBrandActive, setBrandVerified, updateBrand } from '@lib/users';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import type { Vendor, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Vendor[] | { brands: Vendor[]; total: number; totalPages: number } | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const search = String(req.query.search || '');
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '20'), 10);
      const offset = (page - 1) * limit;
      
      const [vendors, total] = await Promise.all([
        getVendors(search, limit, offset, true),
        getVendorsCount(search, true)
      ]);
      
      res.status(200).json({
        brands: vendors,
        total,
        totalPages: Math.ceil(total / limit),
      });
      return;
    }
    if (req.method === 'PATCH') {
      const { id, active, verified, brandName } = req.body as { id?: number; active?: boolean; verified?: boolean; brandName?: string };
      if (!id) {
        res.status(400).json({ message: 'id required' });
        return;
      }
      if (typeof brandName === 'string' && brandName.trim()) {
        await updateBrand(id, { brandName });
        res.status(200).json({ message: 'brand name updated' });
        return;
      }
      if (typeof active === 'boolean') {
        await setBrandActive(id, active);
        res.status(200).json({ message: 'active status updated' });
        return;
      }
      if (typeof verified === 'boolean') {
        await setBrandVerified(id, verified);
        res.status(200).json({ message: 'verification status updated' });
        return;
      }
      res.status(400).json({ message: 'active or verified field required' });
      return;
    }
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    handleApiError(res, error, 'Failed to load brands');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
